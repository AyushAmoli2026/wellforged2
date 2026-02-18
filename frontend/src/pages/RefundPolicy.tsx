import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPolicy = () => {
    return (
        <>
            <Helmet>
                <title>Refund & Cancellation Policy | WellForged</title>
            </Helmet>
            <Navbar />
            <main className="pt-24 pb-16 min-h-screen bg-[#fcfdfc]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-8">Refund & Cancellation Policy</h1>
                    <div className="prose prose-slate max-w-none font-body text-muted-foreground space-y-6">
                        <p>Last Updated: February 18, 2026</p>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">1. Cancellations</h2>
                            <p>Orders can only be cancelled within 2 hours of placement. Once the order has been processed or shipped, cancellations are no longer possible.</p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">2. Refunds</h2>
                            <p>Due to the nature of health supplements, we do not accept returns on opened products. If you receive a damaged or incorrect item, please contact us within 48 hours of delivery with photographic evidence.</p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">3. Processing Time</h2>
                            <p>Approved refunds will be processed and credited back to the original payment method within 7-10 working days.</p>
                        </section>
                        <p className="pt-8">For queries, please email us at support@wellforged.in</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default RefundPolicy;
