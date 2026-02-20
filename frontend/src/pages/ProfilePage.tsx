import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Package, User, LogOut, ChevronRight, ShoppingBag, ExternalLink, Calendar, MapPin, Truck, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";

interface OrderItem {
    id: string;
    product_id: string;
    quantity: number;
    price_at_purchase: string; // Postgres returns numerics as strings
    name: string;
    slug: string;
}

interface Payment {
    id: string;
    payment_method: string;
    payment_status: string;
    transaction_id: string;
}

interface Order {
    id: string;
    created_at: string;
    total_amount: string;
    status: string;
    payment_status: string;
    fulfillment_status: string;
    address_snapshot: any;
    items?: OrderItem[];
    payment?: Payment;
}

const ProfilePage = () => {
    const { user, logout, token } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        if (!token) {
            navigate("/auth");
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setOrders(data);
                } else {
                    toast.error("Failed to fetch orders");
                }
            } catch (error) {
                console.error("Error fetching orders:", error);
                toast.error("Could not load order history");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token, navigate]);

    const toggleOrder = async (orderId: string) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
            return;
        }

        setExpandedOrder(orderId);

        // If items aren't loaded for this order (optimization: fetch on expand if not already present)
        // The current backend implementation of getOrders doesn't return items, so we might need to fetch details
        // But for now, let's assume we want to fetch details on expand if the main list is light.
        // However, looking at the controller, getOrders sends all columns but not relations.
        // Let's check getOrderDetails in controller. It fetches items.

        // We already have the order object, but maybe not items.
        // Let's implement a quick fetch for details if items are missing.
        const order = orders.find(o => o.id === orderId);
        if (order && !order.items) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (response.ok) {
                    const details = await response.json();
                    setOrders(prev => prev.map(o => o.id === orderId ? details : o));
                }
            } catch (error) {
                console.error("Error fetching order details:", error);
            }
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/");
        toast.success("Logged out successfully");
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <>
            <Helmet>
                <title>My Account | WellForged</title>
            </Helmet>
            <Navbar />
            <main className="min-h-screen bg-[#fcfdfc] page-pt pb-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 animate-fade-up">
                        <div>
                            <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-2">My Account</h1>
                            <p className="font-body text-muted-foreground">Welcome back, <span className="text-primary font-medium">{user?.first_name}</span></p>
                        </div>
                        <Button variant="outline" onClick={handleLogout} className="gap-2 border-destructive/20 text-destructive hover:bg-destructive/10 hover:text-destructive">
                            <LogOut className="h-4 w-4" /> Sign Out
                        </Button>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8">

                        {/* Sidebar / Profile Card */}
                        <div className="lg:col-span-1 animate-fade-up delay-100">
                            <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-6 sticky top-24">
                                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto md:mx-0">
                                    <User className="h-8 w-8 text-primary" />
                                </div>
                                <h2 className="font-display font-semibold text-xl text-foreground text-center md:text-left">{user?.first_name} {user?.last_name}</h2>
                                <p className="font-body text-sm text-muted-foreground text-center md:text-left mb-6">{user?.email}</p>

                                {user?.role === 'admin' && (
                                    <Link to="/admin" className="block mb-6">
                                        <Button className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                                            <ShieldCheck className="h-4 w-4" /> Admin Dashboard
                                        </Button>
                                    </Link>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                        <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                                            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total Orders</p>
                                            <p className="font-display font-semibold text-foreground">{orders.length}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                                        <div className="h-8 w-8 rounded-full bg-background border border-border flex items-center justify-center shrink-0">
                                            <MapPin className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Region</p>
                                            <p className="font-display font-semibold text-foreground">India</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="lg:col-span-2 space-y-6 animate-fade-up delay-200">
                            <h2 className="font-display font-semibold text-2xl text-foreground flex items-center gap-2">
                                <Package className="h-6 w-6 text-primary" /> Order History
                            </h2>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-muted-foreground font-body">Loading your history...</p>
                                </div>
                            ) : orders.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-border/60 shadow-sm p-12 text-center">
                                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="font-display font-semibold text-xl text-foreground mb-2">No orders yet</h3>
                                    <p className="font-body text-muted-foreground mb-6">You haven't placed any orders with us yet.</p>
                                    <Link to="/product">
                                        <Button variant="hero" className="gap-2">Start Shopping <ChevronRight className="h-4 w-4" /></Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {orders.map((order, index) => (
                                        <div key={order.id} className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                                            {/* Order Header */}
                                            <div
                                                className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-muted/30 transition-colors"
                                                onClick={() => toggleOrder(order.id)}
                                            >
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono text-sm font-semibold text-foreground">#{order.id.slice(0, 8).toUpperCase()}</span>
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.payment_status === 'completed' || order.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                order.payment_status === 'failed' ? 'bg-red-100 text-red-700' :
                                                                    'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                Pay: {order.payment_status || 'pending'}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${order.fulfillment_status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                                order.fulfillment_status === 'shipped' ? 'bg-blue-100 text-blue-700' :
                                                                    order.fulfillment_status === 'processing' ? 'bg-indigo-100 text-indigo-700' :
                                                                        'bg-amber-100 text-amber-700'
                                                                }`}>
                                                                {order.fulfillment_status || 'pending'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>{formatDate(order.created_at)}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                                    <div className="text-right">
                                                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Total</p>
                                                        <p className="font-display font-bold text-lg text-foreground">₹{parseFloat(order.total_amount).toLocaleString()}</p>
                                                    </div>
                                                    <div className={`transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-90' : ''}`}>
                                                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {expandedOrder === order.id && (
                                                <div className="border-t border-border/50 bg-muted/10 p-4 sm:p-6 animate-in slide-in-from-top-2 duration-200">

                                                    {/* Order Items */}
                                                    <div className="mb-6">
                                                        <h4 className="font-display font-semibold text-sm text-foreground mb-3">Items Ordered</h4>
                                                        <div className="space-y-3">
                                                            {order.items?.map((item, i) => (
                                                                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-xl border border-border/50">
                                                                    <div className="flex items-center gap-3">
                                                                        <div className="h-12 w-12 bg-secondary/30 rounded-lg flex items-center justify-center">
                                                                            {/* Placeholder for product image since it's not in order item response directly usually */}
                                                                            <Package className="h-6 w-6 text-primary/40" />
                                                                        </div>
                                                                        <div>
                                                                            <p className="font-body font-medium text-sm text-foreground">{item.name}</p>
                                                                            <p className="text-xs text-muted-foreground">Qty: {item.quantity} × ₹{item.price_at_purchase}</p>
                                                                        </div>
                                                                    </div>

                                                                    {/* Transparency Link - The "Missing Feature" Integration */}
                                                                    <Link to={`/transparency?batch=WF2026021212`} target="_blank">
                                                                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1.5 text-primary hover:text-primary hover:bg-primary/10">
                                                                            <ExternalLink className="h-3 w-3" /> Lab Report
                                                                        </Button>
                                                                    </Link>
                                                                </div>
                                                            ))}
                                                            {!order.items && <p className="text-sm text-muted-foreground italic">Loading items...</p>}
                                                        </div>
                                                    </div>

                                                    {/* Shipping & Payment Info Grid */}
                                                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                                                        <div className="p-3 rounded-xl bg-background border border-border/50">
                                                            <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> Shipping Address</h5>
                                                            <p className="text-muted-foreground text-xs leading-relaxed">
                                                                {order.address_snapshot ? (
                                                                    <>
                                                                        {JSON.parse(order.address_snapshot).address_line1}<br />
                                                                        {JSON.parse(order.address_snapshot).city} - {JSON.parse(order.address_snapshot).pincode}
                                                                    </>
                                                                ) : "Address not available"}
                                                            </p>
                                                        </div>
                                                        <div className="p-3 rounded-xl bg-background border border-border/50">
                                                            <h5 className="font-semibold text-foreground mb-1 flex items-center gap-2"><Truck className="h-3.5 w-3.5" /> Delivery Status</h5>
                                                            <p className="text-muted-foreground text-xs">
                                                                {order.fulfillment_status === 'delivered' ? 'Your order has been delivered.' :
                                                                    order.fulfillment_status === 'shipped' ? 'Your order has been shipped and is on its way.' :
                                                                        order.fulfillment_status === 'processing' ? 'Your order is being prepared for shipment.' :
                                                                            'Your order is pending and will be processed soon.'}
                                                            </p>
                                                        </div>
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default ProfilePage;
