import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowLeft, ShoppingCart, LogIn, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import newLogo from "@/assets/Transparent_logo.png";
import homeLogo from "@/assets/Transparent_logo_WF.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();

  const isHomePage = location.pathname === "/" || location.pathname === "";
  const currentLogo = isHomePage ? homeLogo : newLogo;

  // Handle scroll effect
  useState(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const navLinks = isLoggedIn
    ? [
      { name: "Shop", href: "/product" },
      { name: "Transparency", href: "/transparency" },
      { name: "Profile", href: "/profile" },
      { name: "Orders", href: "/profile#orders" },
      { name: "Loyalty", href: "/profile#loyalty" },
    ]
    : [
      { name: "Shop", href: "/product" },
      { name: "Transparency", href: "/transparency" },
    ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled
        ? "bg-background/80 backdrop-blur-2xl border-border/50 py-2"
        : "bg-transparent border-transparent py-4"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">

          <div className="flex-1 flex items-center min-w-0">
            {isLoggedIn ? (
              <span className="font-display text-sm sm:text-base font-semibold text-foreground animate-fade-in truncate">
                Welcome, {user?.first_name || "User"}
              </span>
            ) : !isHomePage && (
              <button
                onClick={() => navigate(-1)}
                className="h-10 w-10 lg:h-12 lg:w-12 flex items-center justify-center rounded-full hover:bg-muted border border-border transition-colors group"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5 lg:h-6 lg:w-6 text-foreground/70 group-hover:text-primary transition-colors" />
              </button>
            )}
          </div>

          {/* RIGHT SECTION */}
          <div className="flex items-center justify-end gap-2 sm:gap-4">
            {!isLoggedIn && (
              <button
                onClick={() => navigate("/auth")}
                className="p-2.5 hover:bg-muted rounded-full transition-all duration-300 group flex items-center gap-2"
                aria-label="Login"
              >
                <LogIn className="h-4 w-4 text-foreground/80 group-hover:text-primary" />
                <span className="hidden sm:inline font-body text-xs font-bold uppercase tracking-widest text-foreground/80 group-hover:text-primary">Login</span>
              </button>
            )}

            <button
              className="p-2.5 hover:bg-muted rounded-full transition-all duration-300 flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU: Sleek dropdown with Backdrop */}
        {isOpen && <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[-1] md:hidden" onClick={() => setIsOpen(false)} />}
        <div
          className={`md:hidden absolute inset-x-0 top-[100%] bg-background/95 backdrop-blur-2xl border-b border-border shadow-2xl transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-4 invisible pointer-events-none'
            }`}
        >
          <div className="py-6 px-4 flex flex-col gap-4">
            {navLinks.map((link, index) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-lg font-display font-medium text-foreground py-2 px-4 rounded-lg hover:bg-muted transition-all duration-200 flex items-center justify-between group"
                onClick={() => setIsOpen(false)}
                style={{ transitionDelay: `${index * 30}ms` }}
              >
                {link.name}
                <ArrowLeft className="h-4 w-4 rotate-180 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
