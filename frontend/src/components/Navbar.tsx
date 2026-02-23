import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ArrowLeft, LogIn, LogOut, User, ShoppingBag, FlaskConical, ClipboardList } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import newLogo from "@/assets/Transparent_logo.png";
import homeLogo from "@/assets/Transparent_logo_WF.png";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const isHomePage = location.pathname === "/" || location.pathname === "";

  useState(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  const navLinks = isLoggedIn
    ? [
      { name: "Profile", href: "/profile", icon: User },
      { name: "Orders", href: "/profile#orders", icon: ClipboardList },
    ]
    : [
      { name: "Shop", href: "/product", icon: ShoppingBag },
      { name: "Transparency", href: "/transparency", icon: FlaskConical },
    ];

  const close = () => setIsOpen(false);

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
            {isHomePage ? (
              isLoggedIn && (
                <span className="font-display text-sm sm:text-base font-semibold text-foreground animate-fade-in truncate">
                  Welcome, {user?.first_name || "User"}
                </span>
              )
            ) : (
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
              className="relative p-2.5 hover:bg-muted rounded-full transition-all duration-300 flex items-center justify-center"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              <Menu className={`h-5 w-5 text-foreground transition-all duration-200 ${isOpen ? "opacity-0 rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"}`} />
              <X className={`h-5 w-5 text-foreground absolute transition-all duration-200 ${isOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-75"}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── MOBILE MENU — Compact floating card ──────────────────────── */}
      {/* Invisible backdrop to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={close} />
      )}

      {/* Floating dropdown card */}
      <div
        className={`md:hidden absolute right-4 top-[calc(100%+8px)] z-50 transition-all duration-200 origin-top-right ${isOpen
          ? "opacity-100 scale-100 translate-y-0"
          : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
          }`}
      >
        <div
          className="rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          style={{ background: "linear-gradient(160deg, #1c3529 0%, #122319 100%)", minWidth: "180px" }}
        >
          {/* Links */}
          <div className="py-2">
            {navLinks.map(({ name, href, icon: Icon }) => (
              <Link
                key={name}
                to={href}
                onClick={close}
                className="flex items-center gap-3 px-4 py-3 text-white/65 hover:text-white hover:bg-white/8 transition-all group"
              >
                <Icon className="h-4 w-4 text-emerald-400/80 group-hover:text-emerald-300 flex-shrink-0 transition-colors" />
                <span className="font-display font-semibold text-sm tracking-wide">{name}</span>
              </Link>
            ))}
          </div>

          {/* Divider + auth action */}
          <div className="border-t border-white/8 px-3 py-2.5">
            {isLoggedIn ? (
              <button
                onClick={() => { logout?.(); close(); }}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-xl text-white/40 hover:text-white/70 transition-all text-left"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="font-display text-xs tracking-wide">Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => { navigate("/auth"); close(); }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white font-display font-bold text-xs tracking-wider transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #2a6349, #1e4d36)" }}
              >
                <LogIn className="h-3.5 w-3.5" /> Sign In
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
