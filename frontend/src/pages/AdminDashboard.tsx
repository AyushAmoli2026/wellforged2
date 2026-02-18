import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
    Package,
    ClipboardList,
    Search,
    CheckCircle,
    Clock,
    Truck,
    XCircle,
    ChevronRight,
    Plus,
    Trash2,
    ExternalLink,
    ShieldCheck,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { API_BASE_URL } from "@/config";

type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface Order {
    id: string;
    total_amount: number;
    fulfillment_status: OrderStatus;
    payment_status: string;
    created_at: string;
    address_snapshot: any;
    user_email?: string;
}

interface TestResult {
    test_name: string;
    test_value: string;
    unit: string;
    pass_status: boolean;
}

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<"orders" | "batches">("orders");
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [isOrderLoading, setIsOrderLoading] = useState(true);
    const { token } = useAuth();

    // Batch Form State
    const [batchData, setBatchData] = useState({
        product_id: "",
        batch_number: "",
        testing_date: new Date().toISOString().split('T')[0],
        tested_by: "Eurofins Lab Services",
        test_results: [
            { test_name: "Purity", test_value: "99.2", unit: "%", pass_status: true }
        ]
    });

    useEffect(() => {
        fetchOrders();
        fetchProducts();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            toast.error("Failed to fetch orders");
        } finally {
            setIsOrderLoading(false);
        }
    };

    const fetchProducts = async () => {
        const res = await fetch(`${API_BASE_URL}/api/products`);
        if (res.ok) setProducts(await res.json());
    };

    const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/orders/${orderId}/status`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ fulfillment_status: newStatus })
            });

            if (response.ok) {
                toast.success(`Order marked as ${newStatus}`);
                fetchOrders();
            } else {
                toast.error("Status update failed");
            }
        } catch (error) {
            toast.error("Network error updating status");
        }
    };

    const handleAddTest = () => {
        setBatchData({
            ...batchData,
            test_results: [...batchData.test_results, { test_name: "", test_value: "", unit: "", pass_status: true }]
        });
    };

    const handleRemoveTest = (index: number) => {
        setBatchData({
            ...batchData,
            test_results: batchData.test_results.filter((_, i) => i !== index)
        });
    };

    const handleTestChange = (index: number, field: keyof TestResult, value: any) => {
        const updated = [...batchData.test_results];
        updated[index] = { ...updated[index], [field]: value };
        setBatchData({ ...batchData, test_results: updated });
    };

    const handleSubmitBatch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!batchData.product_id) return toast.error("Select a product");

        try {
            const response = await fetch(`${API_BASE_URL}/api/inventory/batch-report`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(batchData)
            });

            if (response.ok) {
                toast.success("Batch report created successfully");
                setBatchData({
                    product_id: "",
                    batch_number: "",
                    testing_date: new Date().toISOString().split('T')[0],
                    tested_by: "Eurofins Lab Services",
                    test_results: [{ test_name: "", test_value: "", unit: "", pass_status: true }]
                });
            } else {
                const error = await response.json();
                toast.error(error.message || "Failed to create batch report");
            }
        } catch (error) {
            toast.error("Network error creating batch");
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4 text-gold" />;
            case 'processing': return <Package className="h-4 w-4 text-primary" />;
            case 'shipped': return <Truck className="h-4 w-4 text-blue-500" />;
            case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'cancelled': return <XCircle className="h-4 w-4 text-destructive" />;
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return 'bg-gold/10 text-gold border-gold/20';
            case 'processing': return 'bg-primary/10 text-primary border-primary/20';
            case 'shipped': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'delivered': return 'bg-green-500/10 text-green-500 border-green-500/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
        }
    };

    return (
        <div className="min-h-screen bg-[#fcfdfc]">
            <Helmet>
                <title>Admin Dashboard | WellForged</title>
            </Helmet>
            <Navbar />

            <main className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <header className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="font-display text-3xl font-bold text-foreground">Admin Operations</h1>
                            <p className="font-body text-muted-foreground mt-1">Manage fulfillment and transparency logistics</p>
                        </div>
                        <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
                            <button
                                onClick={() => setActiveTab("orders")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "orders" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <ClipboardList className="h-4 w-4" /> Orders
                            </button>
                            <button
                                onClick={() => setActiveTab("batches")}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === "batches" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <ShieldCheck className="h-4 w-4" /> Batches
                            </button>
                        </div>
                    </div>
                </header>

                {activeTab === "orders" ? (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Orders</p>
                                <h3 className="text-3xl font-display font-bold text-foreground">{orders.length}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Processing</p>
                                <h3 className="text-3xl font-display font-bold text-primary">{orders.filter(o => o.fulfillment_status === 'processing').length}</h3>
                            </div>
                            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Shipped/Pending</p>
                                <h3 className="text-3xl font-display font-bold text-blue-500">{orders.filter(o => o.fulfillment_status === 'shipped').length}</h3>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                            <div className="p-4 border-b border-border bg-muted/20 flex items-center justify-between">
                                <h2 className="font-display font-bold text-foreground">Recent Orders</h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <input type="text" placeholder="Search orders..." className="pl-9 pr-4 py-2 bg-white border border-border rounded-lg text-sm focus:outline-none focus:border-primary transition-colors w-48 sm:w-64" />
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-muted/10">
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Order ID</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {isOrderLoading ? (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">Loading orders...</td></tr>
                                        ) : orders.length === 0 ? (
                                            <tr><td colSpan={5} className="px-6 py-12 text-center text-muted-foreground italic">No orders found.</td></tr>
                                        ) : (
                                            orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-muted/10 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-mono text-xs text-foreground uppercase tracking-tighter">{order.id.slice(0, 13)}...</div>
                                                    </td>
                                                    <td className="px-6 py-4 font-body text-sm text-foreground">
                                                        {new Date(order.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 font-display font-bold text-foreground text-sm">
                                                        ₹{order.total_amount}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(order.fulfillment_status)}`}>
                                                            {getStatusIcon(order.fulfillment_status)}
                                                            {order.fulfillment_status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <select
                                                            className="text-xs bg-muted/50 border border-border rounded p-1.5 focus:outline-none focus:border-primary"
                                                            value={order.fulfillment_status}
                                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                                                        >
                                                            <option value="pending">Mark Pending</option>
                                                            <option value="processing">Mark Processing</option>
                                                            <option value="shipped">Mark Shipped</option>
                                                            <option value="delivered">Mark Delivered</option>
                                                            <option value="cancelled">Mark Cancelled</option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-border shadow-sm">
                            <h2 className="font-display font-bold text-xl text-foreground mb-6 flex items-center gap-2">
                                <Plus className="h-5 w-5 text-primary" /> Create New Report
                            </h2>
                            <form onSubmit={handleSubmitBatch} className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Target Product</label>
                                        <select
                                            value={batchData.product_id}
                                            onChange={(e) => setBatchData({ ...batchData, product_id: e.target.value })}
                                            className="w-full h-11 bg-muted/30 border border-border rounded-xl px-4 text-sm focus:outline-none focus:border-primary"
                                        >
                                            <option value="">Select SKU...</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Batch Number</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. WF-MOR-24A"
                                            value={batchData.batch_number}
                                            onChange={(e) => setBatchData({ ...batchData, batch_number: e.target.value })}
                                            className="w-full h-11 bg-muted/30 border border-border rounded-xl px-4 text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Testing Date</label>
                                        <input
                                            type="date"
                                            value={batchData.testing_date}
                                            onChange={(e) => setBatchData({ ...batchData, testing_date: e.target.value })}
                                            className="w-full h-11 bg-muted/30 border border-border rounded-xl px-4 text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tested By (Lab)</label>
                                        <input
                                            type="text"
                                            value={batchData.tested_by}
                                            onChange={(e) => setBatchData({ ...batchData, tested_by: e.target.value })}
                                            className="w-full h-11 bg-muted/30 border border-border rounded-xl px-4 text-sm focus:outline-none focus:border-primary"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Lab Parameters</label>
                                        <Button type="button" variant="ghost" size="sm" onClick={handleAddTest} className="text-xs text-primary gap-1">
                                            <Plus className="h-3 w-3" /> Add Row
                                        </Button>
                                    </div>

                                    <div className="space-y-3">
                                        {batchData.test_results.map((test, index) => (
                                            <div key={index} className="flex gap-2 items-start">
                                                <input
                                                    placeholder="Test Name (e.g. Lead)"
                                                    value={test.test_name}
                                                    onChange={(e) => handleTestChange(index, 'test_name', e.target.value)}
                                                    className="flex-1 h-10 bg-muted/30 border border-border rounded-lg px-3 text-xs"
                                                />
                                                <input
                                                    placeholder="Result (e.g. 0.05)"
                                                    value={test.test_value}
                                                    onChange={(e) => handleTestChange(index, 'test_value', e.target.value)}
                                                    className="w-24 h-10 bg-muted/30 border border-border rounded-lg px-3 text-xs"
                                                />
                                                <input
                                                    placeholder="Unit"
                                                    value={test.unit}
                                                    onChange={(e) => handleTestChange(index, 'unit', e.target.value)}
                                                    className="w-16 h-10 bg-muted/30 border border-border rounded-lg px-3 text-xs"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveTest(index)}
                                                    className="p-2.5 text-muted-foreground hover:text-destructive transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <Button type="submit" variant="hero" className="w-full h-12 gap-2">
                                    <ShieldCheck className="h-5 w-5" /> Publish Lab Report
                                </Button>
                            </form>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
                                <div className="flex items-start gap-4">
                                    <div className="bg-primary/10 p-2.5 rounded-lg">
                                        <ShieldCheck className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-display font-bold text-foreground">Transparency Protocol</h3>
                                        <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed">
                                            All results published here are final. Once a report is created, it becomes public via the Transparency Portal and is searchable by consumers using the Batch ID.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
                                <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-gold" /> Active Batches
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border/50">
                                        <div>
                                            <div className="text-sm font-bold text-foreground">WF-MOR-24A</div>
                                            <div className="text-[10px] text-muted-foreground uppercase">Moringa Powder - 250g</div>
                                        </div>
                                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><ExternalLink className="h-4 w-4" /></Button>
                                    </div>
                                    <div className="flex items-center justify-center p-8 border-2 border-dashed border-border rounded-2xl">
                                        <p className="text-xs text-muted-foreground italic">List of existing reports loading...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
};

export default AdminDashboard;
