import { Link } from "react-router-dom";
import { CheckCircle, ArrowRight, ShoppingBag, Shield, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const OrderSuccessPage = () => {
    const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

    useEffect(() => {
        const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <>
            <Navbar />
            <div className="relative min-h-screen bg-background pt-24 pb-12 overflow-hidden">
                <Confetti width={windowSize.width} height={windowSize.height} recycle={false} numberOfPieces={200} gravity={0.1} colors={['#F59E0B', '#10B981', '#3B82F6']} />

                <div className="max-w-3xl mx-auto px-4 text-center">
                    <div className="animate-hero-fade-up">
                        <div className="inline-flex items-center justify-center h-20 w-20 bg-primary/10 rounded-full mb-6">
                            <CheckCircle className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                        <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">Investment Confirmed.</h1>
                        <p className="font-body text-lg sm:text-xl text-muted-foreground mb-10 max-w-xl mx-auto leading-relaxed">
                            You haven't just bought a supplement; you've invested in <span className="text-foreground font-semibold">Radical Transparency</span>.
                            We're preparing your batch for dispatch.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mb-12 animate-hero-fade-up-delay-3">
                        <div className="bg-card p-6 rounded-2xl border border-border text-left">
                            <Shield className="h-6 w-6 text-primary mb-3" />
                            <h3 className="font-display text-lg font-semibold text-foreground mb-2">Track Your Purity</h3>
                            <p className="font-body text-sm text-muted-foreground mb-4">
                                Once your order arrives, scan the QR code to see the exact lab report for your bottle.
                            </p>
                            <Link to="/transparency">
                                <Button variant="link" className="p-0 h-auto text-primary font-bold">Explore Reports <ArrowRight className="h-4 w-4 ml-1" /></Button>
                            </Link>
                        </div>
                        <div className="bg-card p-6 rounded-2xl border border-border text-left">
                            <ShoppingBag className="h-6 w-6 text-primary mb-3" />
                            <h3 className="font-display text-lg font-semibold text-foreground mb-2">What's Next?</h3>
                            <p className="font-body text-sm text-muted-foreground mb-4">
                                You'll receive an SMS with tracking details within 24 hours. Your wellness journey starts here.
                            </p>
                            <Link to="/profile">
                                <Button variant="link" className="p-0 h-auto text-primary font-bold">View Order Details <ArrowRight className="h-4 w-4 ml-1" /></Button>
                            </Link>
                        </div>
                    </div>

                    <div className="animate-hero-fade-up-delay-5">
                        <Link to="/product">
                            <Button variant="hero" size="xl" className="px-10 h-16 text-lg">
                                Continue Exploring
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default OrderSuccessPage;
