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

  // Form data with auto-filled phone
  const [formData, setFormData] = useState({
    fullName: "",
    phone: user?.mobile_number || "",
    address: "",
    pincode: "",
    city: "",
    state: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string>("upi");

  // Fetch saved addresses on mount
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;
      try {
        const response = await fetch("http://localhost:5000/api/cart/addresses", {
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

  // Auto-fill phone when user data becomes available
  useEffect(() => {
    if (user?.mobile_number) {
      setFormData(prev => ({ ...prev, phone: user.mobile_number }));
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
      const response = await fetch("http://localhost:5000/api/coupons/validate", {
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
    // If using saved address, just proceed
    if (!isAddingNewAddress && selectedAddressId) {
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
        const addressResponse = await fetch("http://localhost:5000/api/cart/addresses", {
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
      const orderResponse = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          address_id: addressId,
          coupon_id: appliedCoupon?.coupon_id || null
        })
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.message || "Failed to create order");

      toast.success("Order placed successfully!");
      clearCart();
      navigate("/profile");
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
      <main className="min-h-screen bg-background pt-16 sm:pt-20 pb-8 sm:pb-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-3xl)" }}>Checkout</h1>
          </div>
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
                        <h2 className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-lg)" }}>Shipping Details</h2>
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
                          <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Full Name *</label>
                          <Input name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Enter your full name" className="h-11 sm:h-12" />
                        </div>
                        <div>
                          <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Phone Number *</label>
                          <Input name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder="+91 98765 43210" className="h-11 sm:h-12" readOnly={user?.mobile_number ? true : false} />
                        </div>
                        <div>
                          <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Address *</label>
                          <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="House/Flat No., Street, Locality" className="h-11 sm:h-12" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="font-body text-sm font-medium text-foreground mb-1.5 block">Pincode *</label>
                            <Input name="pincode" value={formData.pincode} onChange={handleInputChange} placeholder="400001" className="h-11 sm:h-12" />
                          </div>
                          <div>
                            <label className="font-body text-sm font-medium text-foreground mb-1.5 block">City *</label>
                            <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Mumbai" className="h-11 sm:h-12" />
                          </div>
                        </div>
                        <div>
                          <label className="font-body text-sm font-medium text-foreground mb-1.5 block">State *</label>
                          <Input name="state" value={formData.state} onChange={handleInputChange} placeholder="Maharashtra" className="h-11 sm:h-12" />
                        </div>
                      </div>
                    )}

                    <Button variant="hero" size="xl" className="w-full h-12 sm:h-14 mt-6" onClick={handleContinue}>
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
                      <div key={item.id} className="flex gap-3">
                        <img src={item.image} alt={item.name} className="w-14 h-14 object-contain bg-secondary rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm font-medium text-foreground truncate">{item.name}</p>
                          <p className="font-body text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="font-display text-sm font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
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

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground">₹{subtotal.toLocaleString()}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex justify-between font-body text-sm">
                        <span className="text-muted-foreground">Discount</span>
                        <span className="text-primary font-medium">-₹{discount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-body text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className={shipping === 0 ? "text-primary font-medium" : "text-foreground"}>{shipping === 0 ? "FREE" : `₹${shipping}`}</span>
                    </div>
                  </div>
                  <div className="flex justify-between font-display text-lg font-semibold pt-3 border-t border-border mb-4">
                    <span>Total</span>
                    <span>₹{total.toLocaleString()}</span>
                  </div>
                  {step === 2 && (
                    <Button variant="hero" size="xl" className="w-full h-12 sm:h-14 mb-4" onClick={handlePlaceOrder} disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : `Pay ₹${total.toLocaleString()}`}
                    </Button>
                  )}
                  <div className="flex flex-wrap justify-center gap-3 pt-3 border-t border-border">
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
