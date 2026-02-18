import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsOfService = () => {
    return (
        <>
            <Helmet>
                <title>Terms of Service | WellForged</title>
            </Helmet>
            <Navbar />
            <main className="pt-24 pb-16 min-h-screen bg-[#fcfdfc]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-8">Terms of Service</h1>
                    <div className="prose prose-slate max-w-none font-body text-muted-foreground space-y-6">
                        <p>Last Updated: February 18, 2026</p>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">1. Introduction</h2>
                            <p>Welcome to WellForged. By accessing and using this website, you agree to comply with and be bound by the following terms and conditions of use.</p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">2. Use License</h2>
                            <p>Permission is granted to temporarily download one copy of the materials on WellForged's website for personal, non-commercial transitory viewing only.</p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">3. Disclaimer</h2>
                            <p>The materials on WellForged's website are provided on an 'as is' basis. WellForged makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                        </section>
                        <p className="pt-8">These terms are governed by and construed in accordance with the laws of India.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default TermsOfService;
