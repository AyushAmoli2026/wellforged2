import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ShoppingBag, Truck, Shield, FlaskConical, AlertCircle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { API_BASE_URL } from "@/config";
import productImage from "@/assets/Packaging_Updated.png";

interface SKU {
  id: string;
  size: string;
  price: number;
  originalPrice?: number;
  label?: string;
  stock?: number;
}

const ProductSelector = ({ product }: { product: any }) => {
  const [selectedSku, setSelectedSku] = useState<any>(null);

  useEffect(() => {
    if (product?.variants?.length > 0) {
      setSelectedSku(product.variants[0]);
    }
  }, [product]);

  const { addItem, totalItems, setIsOpen } = useCart();
  const { isLoggedIn, setPendingCartAction, setRedirectUrl } = useAuth();
  const navigate = useNavigate();

  const handleAddToCart = async () => {
    if (!selectedSku) return;

    if (selectedSku.stock !== undefined && selectedSku.stock <= 0) {
      toast.error("This size is currently out of stock");
      return;
    }

    if (!isLoggedIn) {
      setPendingCartAction({ sku: selectedSku.id, action: "add" });
      setRedirectUrl("/product");
      navigate("/auth");
      return;
    }

    await addItem({
      id: selectedSku.id,
      name: `${product.name} - ${selectedSku.label}`,
      size: selectedSku.label,
      price: selectedSku.price,
      originalPrice: selectedSku.original_price,
      image: product.images?.[0]?.image_url || productImage
    });
  };

  if (!product || !selectedSku) return null;

  return (
    <div className="space-y-[var(--space-md)]">
      <div className="space-y-[var(--space-xs)]">
        <label className="font-body text-[var(--text-sm)] font-medium text-foreground uppercase tracking-widest">Select Size</label>
        <div className="grid grid-cols-2 gap-[var(--space-xs)]">
          {product.variants.map((sku: any) => (
            <button
              key={sku.id}
              onClick={() => setSelectedSku(sku)}
              className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left min-h-[44px] ${selectedSku.id === sku.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                } ${sku.stock === 0 ? "opacity-60 grayscale-[0.5]" : ""}`}
            >
              <div className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-base)" }}>{sku.label}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-display font-bold text-primary" style={{ fontSize: "var(--text-lg)" }}>₹{sku.price}</span>
                {sku.original_price && <span className="font-body text-muted-foreground line-through" style={{ fontSize: "var(--text-xs)" }}>₹{sku.original_price}</span>}
              </div>

              {/* Stock Status */}
              <div className="mt-2">
                {sku.stock === 0 ? (
                  <span className="text-[10px] sm:text-xs font-bold text-destructive uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Out of Stock
                  </span>
                ) : sku.stock < 20 ? (
                  <span className="text-[10px] sm:text-xs font-bold text-gold uppercase tracking-wider flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Only {sku.stock} left
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-medium text-primary uppercase tracking-wider">In Stock</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-[var(--space-xs)]">
        <Button
          variant="hero"
          size="xl"
          className="w-full h-[var(--space-xl)] gap-2 text-[var(--text-base)] font-bold uppercase tracking-widest"
          onClick={handleAddToCart}
          disabled={selectedSku.stock === 0}
        >
          {selectedSku.stock === 0 ? (
            "Out of Stock"
          ) : (
            <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
          )}
        </Button>
        {totalItems > 0 && (
          <Button variant="outline" size="xl" className="w-full h-[var(--space-xl)] gap-2 text-[var(--text-base)] font-bold uppercase tracking-widest hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all duration-300" onClick={() => setIsOpen(true)}>
            <ShoppingBag className="h-4 w-4" /> Go to Cart ({totalItems})
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductSelector;
