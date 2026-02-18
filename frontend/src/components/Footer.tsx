import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Instagram, Twitter, Shield, Search, ArrowRight, CheckCircle } from "lucide-react";
import wfLogo from "@/assets/Transparent_logo.png";

const Footer = () => {
  const [batchNumber, setBatchNumber] = useState("");
  const navigate = useNavigate();
  const quickLinks = [{ name: "Home", href: "/" }, { name: "Products", href: "/product" }, { name: "Transparency", href: "/transparency" }];
  const contactLinks = [{ name: "Contact Us", href: "#" }, { name: "FAQ", href: "#" }, { name: "Privacy Policy", href: "#" }];
  const socialLinks = [{ icon: Instagram, href: "#", label: "Instagram" }, { icon: Twitter, href: "#", label: "Twitter" }];

  const handleBatchSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (batchNumber.trim()) { navigate(`/transparency?batch=${batchNumber.trim()}`); window.scrollTo(0, 0); }
  };

  return (
    <footer className="bg-secondary/30 border-t border-border pb-16 sm:pb-0">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 text-left">
          <div className="hidden lg:flex flex-col items-start lg:col-span-1">
            <img src={wfLogo} alt="WellForged Logo" className="w-8 h-8 sm:w-10 sm:h-10 object-contain mb-2" />
            <p className="font-display text-xs text-foreground font-medium">WellForged</p>
            <p className="font-body text-[9px] text-muted-foreground italic mb-3">Wellness, Forged With Integrity</p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="h-11 w-11 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300" aria-label={social.label}>
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-start">
            <h4 className="font-display text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 sm:mb-2">Quick Links</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}><Link to={link.href} onClick={() => window.scrollTo(0, 0)} className="font-body text-muted-foreground hover:text-foreground transition-colors py-1.5 inline-block" style={{ fontSize: "var(--text-sm)" }}>{link.name}</Link></li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start">
            <h4 className="font-display text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 sm:mb-2">Contact</h4>
            <ul className="space-y-1.5 sm:space-y-2">
              {contactLinks.map((link) => (
                <li key={link.name}><a href={link.href} className="font-body text-muted-foreground hover:text-foreground transition-colors py-1.5 inline-block" style={{ fontSize: "var(--text-sm)" }}>{link.name}</a></li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-start">
            <h4 className="font-display text-[10px] sm:text-xs font-semibold text-foreground uppercase tracking-wider mb-1.5 sm:mb-2">Legal</h4>
            <ul className="space-y-1.5 sm:space-y-2 mb-4">
              <li><Link to="/privacy-policy" className="font-body text-muted-foreground hover:text-foreground transition-colors py-1.5 inline-block text-[var(--text-sm)]">Privacy Policy</Link></li>
              <li><Link to="/terms-of-service" className="font-body text-muted-foreground hover:text-foreground transition-colors py-1.5 inline-block text-[var(--text-sm)]">Terms of Service</Link></li>
              <li><Link to="/refund-policy" className="font-body text-muted-foreground hover:text-foreground transition-colors py-1.5 inline-block text-[var(--text-sm)]">Refund Policy</Link></li>
            </ul>
            <div className="flex items-center gap-3 mt-1">
              {socialLinks.map((social) => (
                <a key={social.label} href={social.href} className="h-10 w-10 flex items-center justify-center rounded-full bg-muted hover:bg-primary hover:text-primary-foreground transition-all duration-300" aria-label={social.label}>
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
            <Link to="/transparency" onClick={() => window.scrollTo(0, 0)} className="font-body text-[10px] sm:text-xs text-primary hover:underline mt-4">Transparency Portal →</Link>
          </div>
        </div>
        <div className="border-t border-border mt-3 sm:mt-6 pt-3 sm:pt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
              <p className="font-body text-[9px] sm:text-[10px] text-muted-foreground">© {new Date().getFullYear()} WellForged. All rights reserved.</p>
              <p className="font-mono text-[9px] text-muted-foreground bg-muted/50 px-2 py-0.5 rounded border border-border/50">FSSAI Lic. No. 1002XXXXXXXXXX</p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-primary/5 border border-primary/20 rounded-full">
              <Shield className="h-3 w-3 text-primary" /><CheckCircle className="h-2.5 w-2.5 text-primary" /><span className="font-body text-[9px] font-medium text-primary">Secure & Verified</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
