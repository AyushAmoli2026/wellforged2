import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { CreditCard, Smartphone, Building2, Truck, Shield, CheckCircle, MapPin, Tag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { API_BASE_URL, APP_CONFIG } from "@/config";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage = () => {
  const { items, subtotal, clearCart } = useCart();
  const { token, isLoggedIn, user } = useAuth();
  const navigate = useNavigate();

  // Address state
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(true);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Calculate amounts
  const shipping = subtotal >= 500 ? 0 : 49;
  const discount = appliedCoupon?.discount_amount || 0;
  const total = subtotal - discount + shipping;

  // Step management (1 = Details, 2 = Payment)
  const [step, setStep] = useState(1);

  // Form data with auto-filled phone and Name
  const [formData, setFormData] = useState({
    fullName: user ? `${user.first_name} ${user.last_name}`.trim() : "",
    phone: user?.mobile_number || "",
    address: "",
    pincode: "",
    city: "",
    state: ""
  });

  const [idempotencyKey] = useState(() => crypto.randomUUID());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("upi");

  // Fetch saved addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/addresses`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const addresses = await response.json();
          setSavedAddresses(addresses);
          if (addresses.length > 0) {
            setIsAddingNewAddress(false);
            setSelectedAddressId(addresses[0].id); // Select first address by default
          }
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      }
    };
    fetchAddresses();
  }, [token]);

  // Auto-fill phone/name when user data becomes available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        phone: user.mobile_number || prev.phone,
        fullName: prev.fullName || `${user.first_name} ${user.last_name}`.trim()
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setIsValidatingCoupon(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, subtotal })
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        toast.error(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to validate coupon");
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  const handleContinue = () => {
    // If using saved address, check if it has a full name
    if (!isAddingNewAddress && selectedAddressId) {
      const addr = savedAddresses.find(a => a.id === selectedAddressId);
      if (addr) {
        setFormData(prev => ({ ...prev, fullName: addr.full_name, phone: addr.mobile_number, address: addr.address_line1, city: addr.city, state: addr.state, pincode: addr.pincode }));
      }
      setStep(2);
      return;
    }

    // If adding new address, validate form
    if (!formData.fullName || !formData.phone || !formData.address || !formData.pincode || !formData.city || !formData.state) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    if (!isLoggedIn || !token) {
      toast.error("Please log in to place an order");
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Get or Create Address
      let addressId = selectedAddressId;

      // If adding new address, create it
      if (isAddingNewAddress) {
        const addressResponse = await fetch(`${API_BASE_URL}/api/cart/addresses`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            full_name: formData.fullName,
            mobile_number: formData.phone,
            address_line1: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            is_default: savedAddresses.length === 0
          })
        });

        const addressData = await addressResponse.json();
        if (!addressResponse.ok) throw new Error(addressData.message || "Failed to save address");
        addressId = addressData.id;
      }

      // 2. Create Order
      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          address_id: addressId,
          coupon_id: appliedCoupon?.coupon_id || null,
          idempotency_key: idempotencyKey
        })
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || "Failed to create order");

      // 3. Launch Razorpay Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: Math.round(total * 100),
        currency: "INR",
        name: APP_CONFIG.SITE_NAME,
        description: "Wellness Supplements Purchase",
        image: "/favicon.png",
        order_id: orderData.razorpay_order_id,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch(`${API_BASE_URL}/api/orders/payment`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({
                order_id: orderData.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              })
            });

            if (verifyResponse.ok) {
              toast.success("Payment successful! Order placed.");
              clearCart();
              navigate("/order-success");
            } else {
              const error = await verifyResponse.json();
              throw new Error(error.message || "Payment verification failed");
            }
          } catch (err: any) {
            toast.error(err.message || "Something went wrong during verification");
          }
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
        },
        theme: {
          color: "#2C4C3B" // WellForged brand green
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: "upi", name: "UPI", icon: Smartphone, description: "GPay, PhonePe, Paytm", popular: true },
    { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay", popular: false },
    { id: "netbanking", name: "Net Banking", icon: Building2, description: "All major banks", popular: false },
  ];

  return (
    <>
      <Helmet><title>Checkout | WellForged</title></Helmet>
      <Navbar />
      <main className="min-h-screen bg-background page-pt pb-[var(--space-xl)]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-body text-lg text-muted-foreground mb-4">Your cart is empty</p>
              <Button variant="hero" onClick={() => navigate("/product")}>Continue Shopping</Button>
            </div>
          ) : (
            <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
              <div className="lg:col-span-3 space-y-6">
                {/* Step 1: Shipping Details */}
                {step === 1 && (
                  <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h2 className="font-display font-semibold text-foreground uppercase tracking-wider" style={{ fontSize: "var(--text-base)" }}>Shipping Details</h2>
                      </div>
                      {savedAddresses.length > 0 && !isAddingNewAddress && (
                        <Button variant="outline" size="sm" onClick={() => setIsAddingNewAddress(true)} className="h-8 text-xs">
                          Add New
                        </Button>
                      )}
                      {isAddingNewAddress && savedAddresses.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={() => setIsAddingNewAddress(false)} className="h-8 text-xs">
                          Select Saved
                        </Button>
                      )}
                    </div>

                    {!isAddingNewAddress && savedAddresses.length > 0 ? (
                      <div className="space-y-3">
                        {savedAddresses.map((addr) => (
                          <button
                            key={addr.id}
                            onClick={() => setSelectedAddressId(addr.id)}
                            className={`w-full p-4 rounded-xl border-2 transition-all text-left ${selectedAddressId === addr.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                              }`}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <p className="font-body text-sm font-semibold text-foreground">{addr.full_name}</p>
                              {selectedAddressId === addr.id && <CheckCircle className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="font-body text-xs text-muted-foreground">{addr.address_line1}</p>
                            <p className="font-body text-xs text-muted-foreground">{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="font-body text-xs text-muted-foreground mt-1">{addr.mobile_number}</p>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="font-body text-[var(--text-xs)] font-bold uppercase tracking-widest text-foreground mb-1.5 block">Full Name *</label>
                          <Input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" className="h-[var(--space-xl)]" />
                        </div>
                        <div>
                          <label className="font-body text-[var(--text-xs)] font-bold uppercase tracking-widest text-foreground mb-1.5 block">Phone Number *</label>
                          <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="h-[var(--space-xl)]" readOnly={user?.mobile_number ? true : false} />
                        </div>
                        <div>
                          <label className="font-body text-[var(--text-xs)] font-bold uppercase tracking-widest text-foreground mb-1.5 block">Address *</label>
                          <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="House/Flat No., Street, Locality" className="h-[var(--space-xl)]" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-body text-[var(--text-xs)] font-bold uppercase tracking-widest text-foreground mb-1.5 block">Pincode *</label>
                            <Input name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="400001" className="h-[var(--space-xl)]" />
                          </div>
                          <div>
                            <label className="font-body text-[var(--text-xs)] font-bold uppercase tracking-widest text-foreground mb-1.5 block">City *</label>
                            <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" className="h-[var(--space-xl)]" />
                          </div>
                        </div>
                        <div>
                          <label className="font-body text-[var(--text-xs)] font-bold uppercase tracking-widest text-foreground mb-1.5 block">State *</label>
                          <Input name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" className="h-[var(--space-xl)]" />
                        </div>
                      </div>
                    )}

                    <Button variant="hero" size="xl" className="w-full h-[var(--space-xl)] mt-6 font-bold uppercase tracking-widest" onClick={handleContinue}>
                      Continue to Payment
                    </Button>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                  <>
                    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <MapPin className="h-5 w-5 text-primary" />
                        <h2 className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>Shipping Details</h2>
                        <button onClick={() => setStep(1)} className="ml-auto text-xs text-primary hover:underline">Edit</button>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p className="font-body text-foreground"><span className="font-semibold">{formData.fullName}</span></p>
                        <p className="font-body text-muted-foreground">{formData.address}</p>
                        <p className="font-body text-muted-foreground">{formData.city}, {formData.state} - {formData.pincode}</p>
                        <p className="font-body text-muted-foreground">Phone: {formData.phone}</p>
                      </div>
                    </div>
                    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border">
                      <div className="flex items-center gap-2 mb-4">
                        <CreditCard className="h-5 w-5 text-primary" />
                        <h2 className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>Payment Method</h2>
                      </div>
                      <div className="space-y-3">
                        {paymentMethods.map((method) => (
                          <button key={method.id} onClick={() => setSelectedPayment(method.id)} className={`w-full flex items-center gap-2.5 sm:gap-4 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left ${selectedPayment === method.id ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/50"}`}>
                            <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selectedPayment === method.id ? "bg-primary/20" : "bg-muted"}`}>
                              <method.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${selectedPayment === method.id ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                                <span className="font-display font-medium text-foreground text-sm sm:text-base">{method.name}</span>
                                {method.popular && <span className="px-1.5 py-0.5 bg-gold/20 text-gold text-[10px] font-medium rounded-full">Popular</span>}
                              </div>
                              <p className="font-body text-[10px] sm:text-xs text-muted-foreground truncate sm:whitespace-normal">{method.description}</p>
                            </div>
                            <div className={`h-4 w-4 sm:h-5 sm:w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${selectedPayment === method.id ? "border-primary bg-primary" : "border-muted-foreground/30"}`}>
                              {selectedPayment === method.id && <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground" />}
                            </div>
                          </button>
                        ))}
                      </div>
                      <p className="font-body text-xs text-muted-foreground mt-4 text-center">Payment integration coming soon. Contact us for manual orders.</p>
                    </div>
                  </>
                )}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-2">
                <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border sticky top-20">
                  <h2 className="font-display font-semibold text-foreground mb-4" style={{ fontSize: "var(--text-lg)" }}>Order Summary</h2>
                  <div className="space-y-3 mb-4 pb-4 border-b border-border">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 group">
                        <div className="w-16 h-16 bg-muted rounded-xl overflow-hidden flex-shrink-0 border border-border group-hover:border-primary/30 transition-colors flex items-center justify-center p-2">
                          <img
                            src={item.image || "/Packaging_Updated.png"}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/Packaging_Updated.png";
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-semibold text-foreground leading-tight mb-1">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-secondary text-secondary-foreground text-[10px] font-bold rounded-md uppercase tracking-wider">Qty: {item.quantity}</span>
                            {item.size && <span className="px-2 py-0.5 bg-primary/5 text-primary text-[10px] font-bold rounded-md uppercase tracking-wider">{item.size}</span>}
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className="font-display text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupon Section */}
                  <div className="mb-4 pb-4 border-b border-border">
                    {!appliedCoupon ? (
                      <div className="space-y-2">
                        <label className="font-body text-xs font-medium text-muted-foreground">Have a coupon code?</label>
                        <div className="flex gap-2">
                          <Input
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter code"
                            className="h-10 text-sm"
                            disabled={isValidatingCoupon}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleApplyCoupon}
                            disabled={isValidatingCoupon || !couponCode.trim()}
                            className="h-10 gap-1.5 px-4"
                          >
                            <Tag className="h-3.5 w-3.5" />
                            {isValidatingCoupon ? "Checking..." : "Apply"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-body text-sm font-medium text-foreground">{appliedCoupon.code}</p>
                            <p className="font-body text-xs text-primary">-₹{appliedCoupon.discount_amount.toLocaleString()} off</p>
                          </div>
                        </div>
                        <button onClick={handleRemoveCoupon} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3 mb-6 bg-muted/30 p-4 rounded-xl">
                    <div className="flex justify-between items-center font-body text-sm">
                      <span className="text-muted-foreground font-medium">Subtotal</span>
                      <span className="text-foreground font-bold">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between items-center font-body text-sm">
                        <span className="text-muted-foreground font-medium">Discount ({appliedCoupon.code})</span>
                        <span className="text-primary font-bold">-₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center font-body text-sm">
                      <span className="text-muted-foreground font-medium">Delivery</span>
                      <span className={shipping === 0 ? "text-primary font-bold" : "text-foreground font-bold"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>
                    <div className="flex justify-between items-center font-display text-lg font-bold pt-3 border-t border-border mt-1">
                      <span className="text-foreground uppercase tracking-wider">Total</span>
                      <span className="text-foreground">₹{total.toLocaleString()}</span>
                    </div>
                  </div>
                  {step === 2 && (
                    <Button variant="hero" size="xl" className="w-full h-12 sm:h-14 mb-4" onClick={handlePlaceOrder} disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
                    </Button>
                  )}
                  <div className="flex flex-wrap justify-center gap-3 pt-3 border-t border-border mt-4">
                    <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-3 sm:p-4 mb-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-display text-xs font-bold text-foreground">Money-Back Transparency Guarantee</span>
                      </div>
                      <p className="font-body text-[10px] text-muted-foreground leading-snug">
                        If your specific batch lab report isn't available or shows any impurity, we'll refund your entire order immediately.
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="font-body text-xs">Secure Payment</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Truck className="h-4 w-4 text-primary" />
                      <span className="font-body text-xs">Fast Delivery</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckoutPage;
