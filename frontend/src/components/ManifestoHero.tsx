import { useState, useEffect } from "react";
import { Shield, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AnimatedLogo from "@/components/AnimatedLogo";

const ManifestoHero = () => {
  const [visibleWords, setVisibleWords] = useState(0);
  const words = ["Proof", "is", "the", "New", "Standard."];

  useEffect(() => {
    const timer = setInterval(() => {
      setVisibleWords((prev) => {
        if (prev >= words.length) { clearInterval(timer); return prev; }
        return prev + 1;
      });
    }, 200);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[100svh] flex items-center justify-center overflow-hidden py-[var(--space-xl)]">
      <div className="absolute inset-0 animate-gradient-shift">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-primary/3" />
        <div className="absolute inset-0 bg-gradient-to-tl from-secondary/50 via-transparent to-primary/5 animate-gradient-reverse" />
      </div>
      <div className="hidden sm:block absolute top-20 left-10 w-48 md:w-64 h-48 md:h-64 rounded-full bg-primary/5 blur-3xl animate-float" />
      <div className="hidden sm:block absolute bottom-20 right-10 w-64 md:w-96 h-64 md:h-96 rounded-full bg-gold/5 blur-3xl animate-float delay-300" />

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex justify-center mb-[var(--space-lg)]">
          <AnimatedLogo size="hero" className="animate-subtle-float" />
        </div>

        {/* Live Batch Status Pill - Uncertainty Reduction */}
        <div className="animate-hero-fade-up mb-[var(--space-md)]">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full shadow-sm animate-pulse-subtle">
            <Shield className="h-4 w-4 text-primary" />
            <span className="font-mono text-[var(--text-xs)] lg:text-[var(--text-sm)] uppercase tracking-[0.15em] text-primary font-bold">
              Batch #WF2026: 100% Purity Verified
            </span>
          </div>
        </div>

        <div className="animate-hero-fade-up mb-[var(--space-sm)]">
          <span className="inline-block font-body text-[var(--text-xs)] lg:text-[var(--text-sm)] font-semibold uppercase tracking-[0.15em] text-primary bg-primary/5 border border-primary/10 px-4 py-2 rounded-full">
            The No - Nonsense Supplement Brand
          </span>
        </div>

        <h1 className="font-display font-semibold text-foreground leading-[1.1] sm:leading-[1.05] mb-[var(--space-md)]" style={{ fontSize: "var(--text-6xl)", textWrap: "balance" } as React.CSSProperties}>
          {words.map((word, index) => (
            <span key={index} className={`inline-block transition-all duration-700 mr-[0.25em] last:mr-0 ${index < visibleWords ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${word === "Standard." ? "text-gold-gradient drop-shadow-sm" : ""}`} style={{ transitionDelay: `${index * 150}ms` }}>
              {word}
            </span>
          ))}
        </h1>

        <div className="animate-hero-fade-up-delay-3 max-w-lg sm:max-w-xl lg:max-w-2xl mx-auto">
          <p className="font-body text-[var(--text-base)] sm:text-[var(--text-lg)] text-muted-foreground leading-relaxed mb-[var(--space-lg)]">
            Most brands ask for your trust. <span className="text-foreground font-semibold">We provide the evidence.</span> Access third-party lab results for the specific bottle in your hand.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-[var(--space-sm)]">
            <Link to="/product" className="w-full sm:w-auto">
              <Button variant="hero" size="xl" className="h-14 sm:h-16 px-8 sm:px-10 font-bold uppercase tracking-widest group w-full">
                Shop the Evidence
                <ArrowRight className="h-5 w-5 ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link to="/transparency" className="w-full sm:w-auto">
              <Button variant="outline" size="xl" className="h-14 sm:h-16 px-8 sm:px-10 font-bold uppercase tracking-widest border-2 w-full">
                Verify Your Batch
              </Button>
            </Link>
          </div>
        </div>
        <div className="animate-hero-fade-up-delay-5 mt-8 sm:mt-12 lg:mt-16">
          <div className="flex flex-col items-center gap-1.5 text-muted-foreground/60">
            <span className="text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-widest">Discover</span>
            <div className="w-px h-6 sm:h-8 lg:h-12 bg-gradient-to-b from-primary/30 to-transparent animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default ManifestoHero;
