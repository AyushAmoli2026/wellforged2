import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
    return (
        <>
            <Helmet>
                <title>Privacy Policy | WellForged</title>
            </Helmet>
            <Navbar />
            <main className="pt-24 pb-16 min-h-screen bg-[#fcfdfc]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-8">Privacy Policy</h1>
                    <div className="prose prose-slate max-w-none font-body text-muted-foreground space-y-6">
                        <p>Last Updated: February 18, 2026</p>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">1. Information We Collect</h2>
                            <p>We receive, collect and store any information you enter on our website or provide us in any other way. In addition, we collect the Internet protocol (IP) address used to connect your computer to the Internet; login; e-mail address; password; computer and connection information and purchase history.</p>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">2. How We Use Information</h2>
                            <p>We collect such Non-personal and Personal Information for the following purposes:</p>
                            <ul className="list-disc pl-6 space-y-2">
                                <li>To provide and operate the Services;</li>
                                <li>To provide our Users with ongoing customer assistance and technical support;</li>
                                <li>To be able to contact our Visitors and Users with general or personalized service-related notices and promotional messages;</li>
                                <li>To comply with any applicable laws and regulations.</li>
                            </ul>
                        </section>
                        <section className="space-y-4">
                            <h2 className="text-xl font-display font-semibold text-foreground">3. Security</h2>
                            <p>We take security seriously and implement industry-standard precautions to maintain the integrity and confidentiality of your data. However, no method of transmission over the Internet is 100% secure.</p>
                        </section>
                        <p className="pt-8">If you have any questions about this Privacy Policy, please contact us at support@wellforged.in</p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
};

export default PrivacyPolicy;
