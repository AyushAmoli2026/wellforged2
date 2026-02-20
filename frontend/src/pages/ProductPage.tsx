import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Check, Leaf, Shield, FlaskConical, QrCode, Atom, Droplet, Heart, Globe, Clock, Award, Star, CheckCircle, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import ProductSelector from "@/components/ProductSelector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import productImage1 from "@/assets/product-carousel-1.jpg";
import productImage2 from "@/assets/product-carousel-2.jpg";
import productImage3 from "@/assets/product-carousel-3.jpg";
import productImage4 from "@/assets/product-carousel-4.jpg";
import productImage5 from "@/assets/product-carousel-5.jpg";

const ProductPage = () => {
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();

    const handleProcessTransition = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/transparency");
            window.scrollTo(0, 0);
        }, 800);
    };

    const productImages = [productImage1, productImage2, productImage3, productImage4, productImage5];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
        setIsAutoPlaying(false);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
        setIsAutoPlaying(false);
    };

    useEffect(() => {
        if (!isAutoPlaying) return;
        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [isAutoPlaying, productImages.length]);

    const trustHighlights = [
        { icon: Leaf, label: "Single Ingredient" },
        { icon: Shield, label: "No Additives or Fillers" },
        { icon: FlaskConical, label: "Third-Party Lab Tested" },
        { icon: QrCode, label: "Batch-Wise QR Verification" },
    ];
    const ingredients = [
        { icon: Leaf, name: "Moringa Oleifera", description: "Pure leaf powder" },
        { icon: Atom, name: "Natural Compounds", description: "Vitamins & minerals" },
        { icon: Droplet, name: "No Additives", description: "Zero fillers" },
        { icon: Heart, name: "Clean Formula", description: "Single ingredient" },
    ];
    const technicalSpecs = {
        sourcingOrigin: { icon: Globe, title: "Sourcing Origin", details: [{ label: "Region", value: "Southern India" }, { label: "Farm Type", value: "Organic Certified Farms" }, { label: "Harvest Method", value: "Hand-picked, shade-dried" }, { label: "Soil Type", value: "Nutrient-rich volcanic soil" }, { label: "Climate", value: "Tropical, optimal humidity" }] },
        testingFrequency: { icon: Clock, title: "Testing Frequency", details: [{ label: "Heavy Metals", value: "Every batch" }, { label: "Microbial Testing", value: "Every batch" }, { label: "Potency Verification", value: "Every batch" }, { label: "Identity Testing", value: "Every batch" }, { label: "Pesticide Screening", value: "Quarterly" }] },
        purityStandards: { icon: Award, title: "Purity Standards", details: [{ label: "Lead", value: "<0.5 ppm (FDA limit: 1.0 ppm)" }, { label: "Mercury", value: "<0.1 ppm (FDA limit: 0.5 ppm)" }, { label: "Arsenic", value: "<0.2 ppm (FDA limit: 1.0 ppm)" }, { label: "Moisture Content", value: "<5% (Limit: 8%)" }, { label: "Purity Level", value: ">99.5%" }] },
    };
    const faqs = [
        { question: "Is this product lab tested?", answer: "Yes, every batch undergoes independent third-party laboratory testing. You can verify the results using the QR code on the packaging." },
        { question: "Is it suitable for daily use?", answer: "Yes, designed for consistent daily use. We recommend mixing 1 teaspoon (approximately 5g) with water, smoothies, or food, once daily." },
        { question: "Does it contain additives or fillers?", answer: "No. Contains only 100% moringa leaf powder. No artificial colors, flavors, preservatives, sugars, fillers, or flow agents." },
        { question: "Who should consult a professional before use?", answer: "We recommend consulting a healthcare professional if you are pregnant, nursing, taking medication, or have a pre-existing medical condition." },
    ];

    return (
        <>
            <Helmet>
                <title>WellForged Moringa Leaf Powder | Clean Single-Ingredient Wellness</title>
                <meta name="description" content="WellForged Moringa Leaf Powder - Clean, single-ingredient moringa powder crafted with disciplined sourcing, careful processing, and verified quality." />
                <script type="application/ld+json">
                    {`
                    {
                      "@context": "https://schema.org/",
                      "@type": "Product",
                      "name": "WellForged Moringa Leaf Powder",
                      "image": [
                        "https://wellforged.in/assets/product-carousel-1.jpg"
                      ],
                      "description": "Pure, nutrient-rich moringa powder—lab tested, no fillers, nothing hidden. Just nature's most powerful green, delivered fresh.",
                      "sku": "WF-MOR-250",
                      "brand": {
                        "@type": "Brand",
                        "name": "WellForged"
                      },
                      "offers": {
                        "@type": "Offer",
                        "url": "https://wellforged.in/product",
                        "priceCurrency": "INR",
                        "price": "499",
                        "availability": "https://schema.org/InStock",
                        "itemCondition": "https://schema.org/NewCondition"
                      },
                      "aggregateRating": {
                        "@type": "AggregateRating",
                        "ratingValue": "4.9",
                        "reviewCount": "128"
                      }
                    }
                  `}
                </script>
            </Helmet>
            <Navbar />
            <main className="min-h-screen bg-background pt-24 sm:pt-28 lg:pt-32">
                <section className="py-2 sm:py-4 lg:py-6">
                    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
                        <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-12">
                            <div className="lg:sticky lg:top-24 lg:self-start">
                                <ScrollReveal animation="fade-right">
                                    <div className="relative group">
                                        <div className="absolute -inset-2 sm:-inset-4 bg-gradient-to-br from-primary/20 via-gold/30 to-primary/20 rounded-xl sm:rounded-3xl blur-xl sm:blur-2xl opacity-40 group-hover:opacity-100 transition-all duration-1000" />
                                        <div className="relative bg-white rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gold/10 w-full max-w-[420px] sm:max-w-[520px] lg:max-w-full mx-auto">
                                            <div className="aspect-[4/5] sm:aspect-square lg:aspect-[4/5] max-h-[65vh] relative overflow-hidden bg-white flex items-center justify-center">
                                                {productImages.map((img, index) => (
                                                    <div
                                                        key={index}
                                                        className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] transform ${index === currentImageIndex ? "opacity-100 scale-100" : "opacity-0 scale-95"
                                                            }`}
                                                    >
                                                        <img
                                                            src={img}
                                                            alt={`${trustHighlights[currentImageIndex]?.label || 'WellForged Moringa Product'} - View ${index + 1}`}
                                                            loading={index === 0 ? "eager" : "lazy"}
                                                            className="w-full h-full object-contain p-4 sm:p-8"
                                                        />
                                                    </div>
                                                ))}

                                                {/* Navigation Arrows */}
                                                <button
                                                    onClick={prevImage}
                                                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 text-primary z-20"
                                                    aria-label="Previous image"
                                                >
                                                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                                                </button>
                                                <button
                                                    onClick={nextImage}
                                                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/5 hover:bg-black/10 backdrop-blur-sm transition-all duration-300 hover:scale-110 text-primary z-20"
                                                    aria-label="Next image"
                                                >
                                                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                                                </button>

                                                {/* Dots Indicator */}
                                                <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 flex gap-1 sm:gap-1.5">
                                                    {productImages.map((_, index) => (
                                                        <button
                                                            key={index}
                                                            onClick={() => { setCurrentImageIndex(index); setIsAutoPlaying(false); }}
                                                            className="p-2 transition-all duration-300"
                                                            aria-label={`Go to slide ${index + 1}`}
                                                        >
                                                            <div className={`h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? "bg-primary w-5" : "bg-primary/20 w-2 hover:bg-primary/40"}`} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </ScrollReveal>
                            </div>
                            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                                <ScrollReveal animation="fade-left">
                                    <div className="space-y-1 sm:space-y-2">
                                        <h1 className="font-display font-semibold text-foreground leading-[1.1]" style={{ fontSize: "var(--text-3xl)" }}>WellForged – Moringa Powder</h1>
                                        <p className="font-body text-muted-foreground leading-relaxed" style={{ fontSize: "var(--text-sm)" }}>Pure, nutrient-rich moringa powder—lab tested, no fillers, nothing hidden. Just nature's most powerful green, delivered fresh.</p>
                                    </div>
                                </ScrollReveal>
                                <ScrollReveal animation="fade-up">
                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                        {trustHighlights.map(({ icon: Icon, label }) => (
                                            <div key={label} className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-secondary/50 rounded-lg sm:rounded-xl transition-all duration-200 hover:bg-secondary/70">
                                                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0"><Icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" /></div>
                                                <span className="font-body text-[10px] sm:text-xs text-foreground font-medium leading-tight">{label}</span>
                                            </div>
                                        ))}
                                    </div>
                                </ScrollReveal>
                                <ScrollReveal animation="fade-up">
                                    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6 border border-gold/10 shadow-gold group">
                                        <ProductSelector />
                                    </div>
                                </ScrollReveal>


                            </div>
                        </div>
                        <div className="mt-6 sm:mt-10 lg:mt-12">
                            <ScrollReveal animation="fade-up">
                                <div className="space-y-3 sm:space-y-5">
                                    <h2 className="font-display font-semibold text-foreground text-center" style={{ fontSize: "var(--text-2xl)" }}>Ingredient Profile</h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                                        {ingredients.map(({ icon: Icon, name, description }) => (
                                            <div key={name} className="flex flex-col items-center text-center gap-2 sm:gap-3 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/10 transition-all duration-200 hover:bg-primary/10 h-full">
                                                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-secondary rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0"><Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" /></div>
                                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                                    <h3 className="font-body text-xs sm:text-sm font-semibold text-foreground leading-tight">{name}</h3>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ScrollReveal>
                        </div>
                    </div>
                </section>

                <section className="py-10 sm:py-14 lg:py-20 bg-secondary/30">
                    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
                        <ScrollReveal animation="fade-up">
                            <div className="text-center mb-8 sm:mb-10 lg:mb-12">
                                <span className="inline-block font-body text-[10px] sm:text-xs uppercase tracking-widest text-gold mb-2 sm:mb-3">Quality Reference</span>
                                <h2 className="font-display font-semibold text-foreground mb-3 sm:mb-4 text-gold-gradient" style={{ fontSize: "var(--text-3xl)" }}>Technical Specifications</h2>
                                <p className="font-body text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-2" style={{ fontSize: "var(--text-base)" }}>Complete transparency on our sourcing, testing protocols, and purity standards.</p>
                            </div>
                        </ScrollReveal>
                        <div className="max-w-4xl mx-auto">
                            <Accordion type="single" collapsible className="space-y-4">
                                {Object.values(technicalSpecs).map((spec, index) => (
                                    <AccordionItem key={spec.title} value={`spec-${index}`} className="bg-card rounded-xl border border-border px-4 sm:px-6">
                                        <AccordionTrigger className="hover:no-underline py-4 sm:py-6 group">
                                            <div className="flex items-center gap-3 sm:gap-4 text-left">
                                                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <spec.icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                                                </div>
                                                <div>
                                                    <h3 className="font-display text-base sm:text-lg lg:text-xl font-semibold text-foreground">{spec.title}</h3>
                                                    <p className="font-body text-xs text-muted-foreground mt-0.5">Click to view detailed certifications and data</p>
                                                </div>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-6">
                                            <ul className="grid sm:grid-cols-2 gap-x-8 gap-y-2 pt-2 border-t border-border/50">
                                                {spec.details.map((detail, i) => (
                                                    <li key={i} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0 sm:last:border-b">
                                                        <span className="font-body text-xs sm:text-sm text-muted-foreground">{detail.label}</span>
                                                        <span className="font-body text-xs sm:text-sm font-semibold text-foreground text-right">{detail.value}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </div>
                    </div>
                </section>

                <section className="py-10 sm:py-14 lg:py-20">
                    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
                        <ScrollReveal animation="fade-up">
                            <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-3 sm:mb-5 text-center">Why We Chose Moringa</h2>
                            <p className="font-body text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed text-center px-2">Moringa has long been valued as a nutrient-dense plant ingredient. We chose moringa for its versatility, simplicity, and alignment with our clean nutrition philosophy.</p>
                        </ScrollReveal>
                    </div>
                </section>

                <section className="py-10 sm:py-14 lg:py-20 bg-secondary/30">
                    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
                        <ScrollReveal animation="fade-up">
                            <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-4 sm:mb-6 text-center">What Makes This Product Different</h2>
                            <div className="space-y-2 sm:space-y-3 max-w-2xl mx-auto">
                                {["Single-ingredient formulation with no hidden blends", "Carefully sourced leaves processed under controlled conditions", "Finely milled for smooth texture and easy mixing", "Each batch independently lab tested", "QR-based batch verification for complete transparency"].map((item, index) => (
                                    <div key={index} className="flex items-start gap-2 sm:gap-3 group">
                                        <div className="h-4 w-4 sm:h-5 sm:w-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300 group-hover:bg-primary/20"><Check className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" /></div>
                                        <span className="font-body text-sm sm:text-base text-foreground">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollReveal>
                    </div>
                </section>

                <section className="py-10 sm:py-14 lg:py-20 bg-secondary/30">
                    <div className="max-w-3xl mx-auto px-3 sm:px-6 lg:px-8">
                        <ScrollReveal animation="fade-up">
                            <h2 className="font-display text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-foreground mb-4 sm:mb-6 text-center">Frequently Asked Questions</h2>
                            <Accordion type="single" collapsible className="space-y-2 sm:space-y-3">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`faq-${index}`} className="bg-card rounded-lg sm:rounded-xl border border-border px-3 sm:px-5 data-[state=open]:shadow-md transition-shadow">
                                        <AccordionTrigger className="font-display text-sm sm:text-base text-left text-foreground hover:no-underline py-3 sm:py-4">{faq.question}</AccordionTrigger>
                                        <AccordionContent className="font-body text-xs sm:text-sm text-muted-foreground pb-3 sm:pb-4">{faq.answer}</AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </ScrollReveal>
                    </div>
                </section>

                <section className="py-10 sm:py-14 lg:py-20 bg-primary/5 pb-24 sm:pb-14 lg:pb-20 relative overflow-hidden">
                    {/* Process Animation Overlay */}
                    <div className={`absolute inset-0 bg-primary z-50 flex items-center justify-center transition-all duration-700 pointer-events-none ${isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-110'}`}>
                        <div className="text-center">
                            <div className="mb-6 flex justify-center"><Shield className="h-16 w-16 text-primary-foreground animate-shield-pulse" /></div>
                            <h2 className="font-display text-3xl font-bold text-primary-foreground mb-2">Accessing Transparency Forge</h2>
                            <div className="w-48 h-1 bg-primary-foreground/20 rounded-full mx-auto overflow-hidden">
                                <div className="h-full bg-primary-foreground animate-shimmer-sweep" />
                            </div>
                        </div>
                    </div>

                    <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">
                        <ScrollReveal animation="scale">
                            <div className="text-center space-y-4 sm:space-y-6">
                                <h2 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold text-foreground">Ready to Experience Clean Nutrition?</h2>
                                <p className="font-body text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto px-2">Join thousands who trust WellForged for their daily wellness routine.</p>
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                                    <button
                                        onClick={handleProcessTransition}
                                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 w-full sm:w-auto"
                                    >
                                        Learn About Our Process
                                    </button>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>
                </section>
                <Footer />
            </main>
        </>
    );
};

export default ProductPage;
