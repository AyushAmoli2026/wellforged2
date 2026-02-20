import { X, Plus, Minus, ShoppingBag, Truck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";

const CartDrawer = () => {
  const { items, isOpen, setIsOpen, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const shipping = 0;
  const total = subtotal + shipping;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col bg-background">
        <SheetHeader className="border-b border-border pb-[var(--space-sm)]">
          <SheetTitle className="flex items-center gap-2 font-display uppercase tracking-widest" style={{ fontSize: "var(--text-lg)" }}><ShoppingBag className="h-5 w-5" />Your Cart ({totalItems})</SheetTitle>
        </SheetHeader>
        {totalItems === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-[var(--space-2xl)] px-[var(--space-md)] text-center">
            <ShoppingBag className="h-[var(--space-3xl)] w-[var(--space-3xl)] text-muted-foreground/30 mb-[var(--space-md)]" />
            <p className="font-display text-[var(--text-2xl)] font-bold text-foreground mb-[var(--space-xs)]">Your cart is empty</p>
            <p className="font-body text-[var(--text-base)] text-muted-foreground mb-[var(--space-xl)]">Add some clean nutrition to your routine to get started.</p>
            <Link to="/product" className="w-full" onClick={() => setIsOpen(false)}>
              <Button variant="hero" size="lg" className="w-full gap-2 h-[var(--space-xl)] font-bold uppercase tracking-widest">
                Shop Now <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 p-3 bg-card rounded-xl border border-border">
                  <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.image || "/Packaging_Updated.png"}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/Packaging_Updated.png";
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1.5">
                      <div>
                        <h4 className="font-display font-semibold text-foreground text-sm leading-tight">{item.name}</h4>
                        <span className="inline-block px-1.5 py-0.5 bg-primary/10 text-primary-[10px] text-xs font-medium rounded-full mt-0.5">{item.size}</span>
                      </div>
                      <button onClick={() => removeItem(item.id)} className="text-muted-foreground hover:text-foreground transition-colors p-2.5 -mr-2.5"><X className="h-5 w-5" /></button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 bg-muted rounded-lg h-11">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 hover:bg-muted-foreground/10 rounded-l-lg transition-colors h-full flex items-center justify-center min-w-[44px]"><Minus className="h-4 w-4" /></button>
                        <span className="font-body text-sm font-medium w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 hover:bg-muted-foreground/10 rounded-r-lg transition-colors h-full flex items-center justify-center min-w-[44px]"><Plus className="h-4 w-4" /></button>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-semibold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</p>
                        {item.originalPrice && <p className="font-body text-xs text-muted-foreground line-through">₹{(item.originalPrice * item.quantity).toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-[var(--space-sm)] space-y-[var(--space-sm)] pb-[var(--space-md)]">
              <div className="flex justify-between font-display uppercase tracking-widest font-semibold pt-[var(--space-2xs)]" style={{ fontSize: "var(--text-base)" }}><span>Total</span><span>₹{total.toLocaleString()}</span></div>
              <Link to="/checkout" onClick={() => setIsOpen(false)}>
                <Button variant="hero" size="lg" className="w-full gap-2 h-[var(--space-xl)] font-bold uppercase tracking-widest">Proceed to Checkout<ArrowRight className="h-5 w-5" /></Button>
              </Link>
              <button onClick={() => setIsOpen(false)} className="w-full text-center font-body text-[var(--text-sm)] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-[0.1em]">Continue Shopping</button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
