import React, { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Phone, Shield, CheckCircle, FlaskConical, Leaf, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { API_BASE_URL } from "@/config";
import productImage from "@/assets/Packaging_Updated.png";
import logo from "@/assets/WellForged_Shield_Logo.png";

type AuthView = "signin" | "signup";
type SignUpStep = "details" | "otp";

const TRUST_POINTS = [
    { icon: FlaskConical, label: "NABL Certified Lab Tests" },
    { icon: Shield, label: "100% Clean Ingredients" },
    { icon: Leaf, label: "No Fillers, No Fluff" },
    { icon: Star, label: "4.9★ from 500+ customers" },
];

const AuthPage = () => {
    const [view, setView] = useState<AuthView>("signin");

    const [signInPhone, setSignInPhone] = useState("");
    const [signInOtp, setSignInOtp] = useState("");
    const [signInStep, setSignInStep] = useState<"phone" | "otp">("phone");
    const [signInLoading, setSignInLoading] = useState(false);

    const [signUpStep, setSignUpStep] = useState<SignUpStep>("details");
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [acceptTerms, setAcceptTerms] = useState(true);
    const [receiveWhatsApp, setReceiveWhatsApp] = useState(true);
    const [signUpOtp, setSignUpOtp] = useState("");
    const [signUpLoading, setSignUpLoading] = useState(false);

    const { toast } = useToast();
    const navigate = useNavigate();
    const { login, redirectUrl, setRedirectUrl, pendingCartAction, setPendingCartAction } = useAuth();
    const { addItem } = useCart();

    const skus = [
        { id: "76d371e6-e301-42d4-8920-d110e4e1182e", size: "100g", price: 349 },
        { id: "3700f25c-5050-4679-a3ca-9b4e8ecd3daa", size: "250g", price: 549, originalPrice: 699 },
    ];

    const handlePostLogin = async (token: string, user: any) => {
        login(token, user);
        if (pendingCartAction) {
            const sku = skus.find(s => s.id === pendingCartAction.sku);
            if (sku) {
                await addItem({ id: sku.id, name: `Moringa Powder - ${sku.size}`, size: sku.size, price: sku.price, originalPrice: (sku as any).originalPrice, image: productImage });
            }
            setPendingCartAction(null);
        }
        const target = redirectUrl || "/";
        setRedirectUrl(null);
        navigate(target);
    };

    // ─── Sign In ───────────────────────────────────────────────────────────────
    const handleRequestSignInOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (signInPhone.length !== 10) {
            toast({ title: "Invalid Number", description: "Please enter a valid 10-digit number.", variant: "destructive" });
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/check-phone`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile_number: signInPhone }),
            });
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Something went wrong");
            }

            setSignInStep("otp");
            toast({ title: "OTP Sent", description: "Enter the 4-digit OTP sent to your WhatsApp." });
        } catch (err: any) {
            toast({
                title: "Login Failed",
                description: err.message || "Account not found. Please sign up.",
                variant: "destructive"
            });
        }
    };

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignInLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile_number: signInPhone, otp: signInOtp }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Sign in failed");
            toast({ title: "Welcome back!" });
            await handlePostLogin(data.token, data.user);
        } catch (err: any) {
            toast({ title: "Sign In Failed", description: err.message, variant: "destructive" });
        } finally {
            setSignInLoading(false);
        }
    };

    const handleRequestSignUpOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fullName.trim()) { toast({ title: "Name Required", variant: "destructive" }); return; }
        if (phone.length !== 10) { toast({ title: "Invalid Number", description: "Enter a valid 10-digit number.", variant: "destructive" }); return; }
        if (!acceptTerms) { toast({ title: "Terms Required", description: "Please accept the terms.", variant: "destructive" }); return; }

        setSignUpLoading(true);
        try {
            // Check if phone already exists
            const res = await fetch(`${API_BASE_URL}/api/auth/check-phone`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ mobile_number: phone }),
            });
            const data = await res.json();

            // For Signup, we WANT check-phone to return 404 (Not Found)
            if (res.status === 200) {
                throw new Error("Phone number already registered. Please sign in.");
            }

            if (res.status !== 404) {
                throw new Error(data.message || "Failed to verify phone number");
            }

            setSignUpStep("otp");
            toast({ title: "OTP Sent ✓", description: "Check your WhatsApp for the 4-digit code." });
        } catch (err: any) {
            toast({
                title: "Sign Up Blocked",
                description: err.message,
                variant: "destructive"
            });
        } finally {
            setSignUpLoading(false);
        }
    };

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignUpLoading(true);
        const nameParts = fullName.trim().split(" ");
        try {
            const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: nameParts[0],
                    last_name: nameParts.slice(1).join(" ") || "",
                    mobile_number: phone,
                    otp: signUpOtp,
                    terms_accepted: acceptTerms,
                    whatsapp_opt_in: receiveWhatsApp,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Sign up failed");
            toast({ title: "Welcome to WellForged!" });
            await handlePostLogin(data.token, data.user);
        } catch (err: any) {
            toast({ title: "Sign Up Failed", description: err.message, variant: "destructive" });
            setSignUpStep("details");
        } finally {
            setSignUpLoading(false);
        }
    };

    const switchView = (v: AuthView) => {
        setView(v);
        setSignInStep("phone");
        setSignUpStep("details");
    };

    const inputCls = "w-full h-12 px-4 bg-white/70 border border-white/40 rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground/60 shadow-sm";

    return (
        <>
            <Helmet>
                <title>{view === "signin" ? "Sign In" : "Join WellForged"} | WellForged</title>
            </Helmet>

            <div className="min-h-screen flex flex-col lg:flex-row">
                {/* ─── LEFT PANEL — Brand ─────────────────────────────────── */}
                <div className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative flex-col justify-between p-12 overflow-hidden"
                    style={{ background: "linear-gradient(145deg, #1a3028 0%, #0f2018 50%, #0a1a12 100%)" }}>

                    {/* Decorative glows */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full opacity-20 blur-[120px]"
                        style={{ background: "radial-gradient(circle, #4a9060, transparent)" }} />
                    <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full opacity-15 blur-[100px]"
                        style={{ background: "radial-gradient(circle, #e2a850, transparent)" }} />

                    {/* Grid lines overlay */}
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                    {/* Top: Logo */}
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-16">
                            <img src={logo} alt="WellForged" className="h-10 w-10 object-contain brightness-0 invert" />
                            <span className="font-display text-white font-bold text-xl tracking-wide">WellForged</span>
                        </div>

                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-sm">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-xs font-medium text-white/80">Radical Transparency. Real Results.</span>
                            </div>
                            <h2 className="font-display text-3xl xl:text-4xl font-bold text-white leading-snug">
                                Proof is <br />
                                <span style={{ background: "linear-gradient(90deg, #5cb87a, #a8d5b5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                                    the New Standard.
                                </span>
                            </h2>
                            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
                                Join India's most transparent nutrition brand — every batch tested, every ingredient disclosed.
                            </p>
                        </div>
                    </div>

                    {/* Middle: Trust points */}
                    <div className="relative z-10 space-y-3 my-8">
                        {TRUST_POINTS.map(({ icon: Icon, label }) => (
                            <div key={label} className="flex items-center gap-3 group">
                                <div className="h-8 w-8 rounded-lg bg-white/8 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-all">
                                    <Icon className="h-3.5 w-3.5 text-emerald-400" />
                                </div>
                                <span className="text-sm text-white/65 group-hover:text-white/90 transition-colors">{label}</span>
                            </div>
                        ))}
                    </div>

                    {/* Bottom: Product image */}
                    <div className="relative z-10 flex items-end justify-between">
                        <div className="text-xs text-white/30 leading-relaxed">
                            © 2026 WellForged<br />Clean. Proven. Transparent.
                        </div>
                        <img
                            src={productImage}
                            alt="WellForged Moringa"
                            className="h-36 xl:h-44 object-contain drop-shadow-2xl opacity-90 -mb-4 hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* ─── RIGHT PANEL — Form ──────────────────────────────────── */}
                <div className="flex-1 flex flex-col min-h-screen"
                    style={{ background: "linear-gradient(160deg, #f8faf8 0%, #f2f7f3 50%, #edf4ee 100%)" }}>

                    {/* Top nav strip */}
                    <div className="flex items-center justify-between px-6 pt-6 lg:px-10">
                        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground/70 hover:text-foreground text-sm transition-colors group">
                            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                            <span>Home</span>
                        </Link>
                        {/* Mobile logo */}
                        <div className="flex lg:hidden items-center gap-2">
                            <img src={logo} alt="WellForged" className="h-7 w-7 object-contain" />
                            <span className="font-display font-bold text-sm text-foreground">WellForged</span>
                        </div>
                        <div className="hidden lg:block" />
                    </div>

                    {/* Form area */}
                    <div className="flex-1 flex items-center justify-center px-6 py-10 lg:px-16">
                        <div className="w-full max-w-sm">

                            {/* ─── SIGN IN ──────────────────────────────────── */}
                            {view === "signin" && (
                                <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                                    <div className="mb-8">
                                        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Welcome back 👋</h1>
                                        <p className="text-muted-foreground text-sm">Sign in with your WhatsApp number</p>
                                    </div>

                                    {/* Card */}
                                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-lg shadow-black/5 p-6 space-y-5">
                                        {signInStep === "phone" ? (
                                            <form onSubmit={handleRequestSignInOtp} className="space-y-5">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">WhatsApp Number</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                            <span className="text-sm font-semibold text-foreground/70 pr-3 border-r border-border">+91</span>
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            value={signInPhone}
                                                            onChange={e => setSignInPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                            className={`${inputCls} pl-[68px]`}
                                                            placeholder="98765 43210"
                                                            autoFocus
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                                <button type="submit"
                                                    className="w-full h-12 rounded-xl font-display font-bold text-sm tracking-wider text-white flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.98] shadow-md"
                                                    style={{ background: "linear-gradient(135deg, #1e4d36, #2a6349)" }}>
                                                    <Phone className="h-4 w-4" /> Request OTP
                                                </button>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleSignIn} className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">OTP Sent</label>
                                                        <button type="button" onClick={() => setSignInStep("phone")}
                                                            className="text-[10px] text-primary font-bold hover:underline underline-offset-2">
                                                            ← Change number
                                                        </button>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                                        <span className="text-xs text-emerald-700 font-medium">WhatsApp OTP sent to +91 {signInPhone}</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={signInOtp}
                                                        onChange={e => setSignInOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                        className={`${inputCls} tracking-[0.6em] text-center text-2xl font-bold`}
                                                        placeholder="• • • •"
                                                        maxLength={4}
                                                        autoFocus
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" disabled={signInLoading}
                                                    className="w-full h-12 rounded-xl font-display font-bold text-sm tracking-wider text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-60"
                                                    style={{ background: "linear-gradient(135deg, #1e4d36, #2a6349)" }}>
                                                    {signInLoading ? "Signing in..." : "Sign In Securely →"}
                                                </button>
                                            </form>
                                        )}
                                    </div>

                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            New to WellForged?{" "}
                                            <button onClick={() => switchView("signup")}
                                                className="text-primary font-bold hover:underline underline-offset-4 transition-colors">
                                                Create an account
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* ─── SIGN UP ──────────────────────────────────── */}
                            {view === "signup" && (
                                <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                                    <div className="mb-8">
                                        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                                            {signUpStep === "details" ? "Join WellForged ✨" : "Almost there!"}
                                        </h1>
                                        <p className="text-muted-foreground text-sm">
                                            {signUpStep === "details"
                                                ? "Create your account in seconds."
                                                : `Enter the OTP sent to +91 ${phone}`}
                                        </p>
                                    </div>

                                    {/* Step indicator */}
                                    <div className="flex items-center gap-2 mb-6">
                                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${signUpStep === "details" ? "bg-primary" : "bg-primary"}`} />
                                        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${signUpStep === "otp" ? "bg-primary" : "bg-border"}`} />
                                    </div>

                                    <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl shadow-lg shadow-black/5 p-6">
                                        {signUpStep === "details" ? (
                                            <form onSubmit={handleRequestSignUpOtp} className="space-y-4">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={fullName}
                                                        onChange={e => setFullName(e.target.value)}
                                                        className={inputCls}
                                                        placeholder="John Doe"
                                                        autoFocus
                                                        required
                                                    />
                                                </div>

                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">WhatsApp Number</label>
                                                    <div className="relative">
                                                        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                                            <span className="text-sm font-semibold text-foreground/70 pr-3 border-r border-border">+91</span>
                                                        </div>
                                                        <input
                                                            type="tel"
                                                            value={phone}
                                                            onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                                            className={`${inputCls} pl-[68px]`}
                                                            placeholder="98765 43210"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-3 pt-1">
                                                    <label className="flex items-start gap-3 cursor-pointer group">
                                                        <div className="relative mt-0.5 flex-shrink-0">
                                                            <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)}
                                                                className="sr-only peer" />
                                                            <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${acceptTerms ? "bg-primary border-primary" : "bg-white border-border"}`}>
                                                                {acceptTerms && <CheckCircle className="h-3 w-3 text-white fill-white" />}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                                                            I agree to the{" "}
                                                            <Link to="/terms" className="text-primary font-semibold hover:underline underline-offset-2">
                                                                Terms & Conditions
                                                            </Link>
                                                        </span>
                                                    </label>
                                                    <label className="flex items-start gap-3 cursor-pointer group">
                                                        <div className="relative mt-0.5 flex-shrink-0">
                                                            <input type="checkbox" checked={receiveWhatsApp} onChange={e => setReceiveWhatsApp(e.target.checked)}
                                                                className="sr-only peer" />
                                                            <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${receiveWhatsApp ? "bg-primary border-primary" : "bg-white border-border"}`}>
                                                                {receiveWhatsApp && <CheckCircle className="h-3 w-3 text-white fill-white" />}
                                                            </div>
                                                        </div>
                                                        <span className="text-xs text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors">
                                                            Receive order updates & offers on WhatsApp
                                                        </span>
                                                    </label>
                                                </div>

                                                <button type="submit"
                                                    className="w-full h-12 rounded-xl font-display font-bold text-sm tracking-wider text-white flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.98] shadow-md mt-2"
                                                    style={{ background: "linear-gradient(135deg, #1e4d36, #2a6349)" }}>
                                                    <Phone className="h-4 w-4" /> Request OTP
                                                </button>
                                            </form>
                                        ) : (
                                            <form onSubmit={handleSignUp} className="space-y-5 animate-in fade-in slide-in-from-right-3 duration-300">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/80">Enter OTP</label>
                                                        <button type="button" onClick={() => setSignUpStep("details")}
                                                            className="text-[10px] text-primary font-bold hover:underline underline-offset-2">
                                                            ← Edit details
                                                        </button>
                                                    </div>
                                                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center gap-2">
                                                        <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                                                        <span className="text-xs text-emerald-700 font-medium">WhatsApp OTP sent to +91 {phone}</span>
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={signUpOtp}
                                                        onChange={e => setSignUpOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                                                        className={`${inputCls} tracking-[0.6em] text-center text-2xl font-bold`}
                                                        placeholder="• • • •"
                                                        maxLength={4}
                                                        autoFocus
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" disabled={signUpLoading}
                                                    className="w-full h-12 rounded-xl font-display font-bold text-sm tracking-wider text-white transition-all hover:opacity-90 active:scale-[0.98] shadow-md disabled:opacity-60"
                                                    style={{ background: "linear-gradient(135deg, #1e4d36, #2a6349)" }}>
                                                    {signUpLoading ? "Creating account..." : "Forge My Account →"}
                                                </button>
                                            </form>
                                        )}
                                    </div>

                                    <div className="mt-8 text-center">
                                        <p className="text-sm text-muted-foreground">
                                            Already have an account?{" "}
                                            <button onClick={() => switchView("signin")}
                                                className="text-primary font-bold hover:underline underline-offset-4 transition-colors">
                                                Sign In
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Trust footer */}
                            <div className="mt-10 flex items-center justify-center gap-2">
                                <Shield className="h-3.5 w-3.5 text-muted-foreground/40" />
                                <span className="text-[11px] text-muted-foreground/50">Your data is safe. We never share your details.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AuthPage;
