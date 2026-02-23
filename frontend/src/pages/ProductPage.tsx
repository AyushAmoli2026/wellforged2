import React, { useState, useEffect, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { Check, Leaf, Shield, FlaskConical, QrCode, Atom, Droplet, Heart, Globe, Clock, Award, Star, CheckCircle, HelpCircle, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import ScrollReveal from "@/components/ScrollReveal";
import ProductSelector from "@/components/ProductSelector";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { API_BASE_URL } from "@/config";
import productImage1 from "@/assets/product-carousel-1.jpg";
import productImage2 from "@/assets/product-carousel-2.jpg";
import productImage3 from "@/assets/product-carousel-3.jpg";
import productImage4 from "@/assets/product-carousel-4.jpg";
import productImage5 from "@/assets/product-carousel-5.jpg";

const ProductPage = () => {
    const [product, setProduct] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const navigate = useNavigate();
    const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const slug = "moringa-powder"; // This can be dynamic from URL params later

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/api/products/${slug}`);
                if (response.ok) {
                    const data = await response.json();
                    setProduct(data);
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [slug]);

    const handleProcessTransition = () => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigate("/transparency");
            window.scrollTo(0, 0);
        }, 800);
    };

    // Images fallback logic
    const backendImages = product?.images?.map((img: any) => img.image_url) || [];
    const productImages = backendImages.length > 0 ? backendImages : [productImage1, productImage2, productImage3, productImage4, productImage5];

    const startAutoPlay = useCallback(() => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        if (productImages.length <= 1) return;
        autoPlayRef.current = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
        }, 4000);
    }, [productImages.length]);

    useEffect(() => {
        startAutoPlay();
        return () => { if (autoPlayRef.current) clearInterval(autoPlayRef.current); };
    }, [startAutoPlay]);

    const goTo = (idx: number) => {
        setCurrentImageIndex(idx);
        startAutoPlay();
    };
    const nextImage = () => goTo((currentImageIndex + 1) % productImages.length);
    const prevImage = () => goTo((currentImageIndex - 1 + productImages.length) % productImages.length);

    const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.changedTouches[0].screenX; };
    const onTouchEnd = (e: React.TouchEvent) => {
        touchEndX.current = e.changedTouches[0].screenX;
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 40) diff > 0 ? nextImage() : prevImage();
    };

    const trustHighlights = product?.metadata
        ?.filter((m: any) => m.category === 'highlight')
        .map((m: any) => ({
            icon: (m.icon_name === 'Leaf' ? Leaf : m.icon_name === 'Shield' ? Shield : m.icon_name === 'FlaskConical' ? FlaskConical : CheckCircle),
            label: m.key
        })) || [
            { icon: Leaf, label: "Single Ingredient" },
            { icon: Shield, label: "No Additives or Fillers" },
            { icon: FlaskConical, label: "Third-Party Lab Tested" },
            { icon: QrCode, label: "Batch-Wise QR Verification" },
        ];

    const ingredients = product?.metadata
        ?.filter((m: any) => m.category === 'ingredient')
        .map((m: any) => ({
            icon: Leaf,
            name: m.key,
            description: m.value
        })) || [
            { icon: Leaf, name: "Moringa Oleifera", description: "Pure leaf powder" },
        ];

    // Group specs by icon/title if they have display_order or just show all
    const specs = product?.metadata?.filter((m: any) => m.category === 'spec') || [];

    const technicalSpecs = {
        sourcingOrigin: {
            icon: Globe,
            title: "Technical Overview",
            details: specs.map((s: any) => ({ label: s.key, value: s.value }))
        },
    };

    const faqs = product?.faqs?.length > 0 ? product.faqs : [
        { question: "Is this product lab tested?", answer: "Yes, every batch undergoes independent third-party laboratory testing." }
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            <Helmet>
                <title>{product?.name || 'WellForged Moringa Leaf Powder'} | Clean Single-Ingredient Wellness</title>
                <meta name="description" content={product?.base_description || "WellForged Moringa Leaf Powder - Clean, single-ingredient moringa powder crafted with disciplined sourcing, careful processing, and verified quality."} />
                <script type="application/ld+json">
                    {`
                    {
                      "@context": "https://schema.org/",
                      "@type": "Product",
                      "name": "${product?.name || 'WellForged Moringa Leaf Powder'}",
                      "image": [
                        "https://wellforged.in/assets/product-carousel-1.jpg"
                      ],
                      "description": "${product?.base_description || "Pure, nutrient-rich moringa powder—lab tested, no fillers, nothing hidden. Just nature's most powerful green, delivered fresh."}",
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
            <main className="min-h-screen bg-background page-pt">
                <section className="py-[var(--space-sm)]">
                    <div className="max-w-[1440px] mx-auto px-[var(--space-sm)] lg:px-[var(--space-md)]">
                        <div className="grid lg:grid-cols-2 gap-[var(--space-md)] lg:gap-[var(--space-xl)]">
                            <div className="lg:sticky lg:top-24 lg:self-start">
                                <ScrollReveal animation="fade-right">
                                    <div
                                        className="relative w-full max-w-[420px] sm:max-w-[500px] lg:max-w-full mx-auto select-none"
                                        onTouchStart={onTouchStart}
                                        onTouchEnd={onTouchEnd}
                                    >
                                        <div className="aspect-square sm:aspect-[4/5] overflow-hidden rounded-2xl bg-[#f6f8f5]">
                                            <div
                                                className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                                                style={{ transform: `translateX(-${currentImageIndex * (100 / productImages.length)}%)`, width: `${productImages.length * 100}%` }}
                                            >
                                                {productImages.map((img, i) => (
                                                    <div key={i} className="h-full flex-shrink-0" style={{ width: `${100 / productImages.length}%` }}>
                                                        <img
                                                            src={img}
                                                            alt={`${product?.name || 'Product'} - view ${i + 1}`}
                                                            loading={i === 0 ? "eager" : "lazy"}
                                                            className="w-full h-full object-contain p-6 sm:p-10"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {productImages.length > 1 && (
                                            <div className="flex items-center justify-center gap-1.5 mt-3">
                                                {productImages.map((_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => goTo(i)}
                                                        aria-label={`Slide ${i + 1}`}
                                                        className="transition-all duration-300"
                                                    >
                                                        <div className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex
                                                            ? "w-6 bg-primary"
                                                            : "w-1.5 bg-primary/25 hover:bg-primary/50"
                                                            }`} />
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </ScrollReveal>
                            </div>
                            <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                                <ScrollReveal animation="fade-left">
                                    <div className="space-y-[var(--space-xs)]">
                                        <h1 className="font-display font-semibold text-foreground leading-[1.1]" style={{ fontSize: "var(--text-4xl)" }}>{product?.name || 'WellForged – Moringa Powder'}</h1>
                                        <p className="font-body text-muted-foreground leading-relaxed" style={{ fontSize: "var(--text-base)" }}>{product?.base_description || "Pure, nutrient-rich moringa powder—lab tested, no fillers, nothing hidden. Just nature's most powerful green, delivered fresh."}</p>
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
                                        <ProductSelector product={product} />
                                    </div>
                                </ScrollReveal>
                            </div>
                        </div>
                        <div className="mt-[var(--space-lg)] sm:mt-[var(--space-xl)]">
                            <ScrollReveal animation="fade-up">
                                <div className="space-y-[var(--space-sm)] sm:space-y-[var(--space-md)]">
                                    <h2 className="font-display font-semibold text-foreground text-center" style={{ fontSize: "var(--text-3xl)" }}>Ingredient Profile</h2>
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
                            <div className="text-center mb-[var(--space-lg)] sm:mb-[var(--space-xl)]">
                                <span className="inline-block font-body text-[var(--text-xs)] uppercase tracking-widest text-gold mb-[var(--space-2xs)]">Quality Reference</span>
                                <h2 className="font-display font-semibold text-foreground mb-[var(--space-xs)] text-gold-gradient" style={{ fontSize: "var(--text-4xl)" }}>Technical Specifications</h2>
                                <p className="font-body text-muted-foreground max-w-xl sm:max-w-2xl mx-auto px-2" style={{ fontSize: "var(--text-lg)" }}>Complete transparency on our sourcing, testing protocols, and purity standards.</p>
                            </div>
                        </ScrollReveal>
                        <div className="max-w-4xl mx-auto">
                            <Accordion type="single" collapsible className="space-y-4">
                                {Object.values(technicalSpecs).map((spec: any, index: number) => (
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
                                                {spec.details.map((detail: any, i: number) => (
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
