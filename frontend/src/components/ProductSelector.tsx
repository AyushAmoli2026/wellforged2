import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, ShoppingBag, Truck, Shield, FlaskConical, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import productImage from "@/assets/Packaging_Updated.png";

interface SKU {
  id: string;
  size: string;
  price: number;
  originalPrice?: number;
  label?: string;
  stock?: number;
}

const ProductSelector = () => {
  const [skus, setSkus] = useState<SKU[]>([
    { id: "76d371e6-e301-42d4-8920-d110e4e1182e", size: "100g", price: 349 },
    { id: "3700f25c-5050-4679-a3ca-9b4e8ecd3daa", size: "250g", price: 549, originalPrice: 699, label: "Best Value" },
  ]);
  const [selectedSku, setSelectedSku] = useState<SKU>(skus[1]);
  const [isLoading, setIsLoading] = useState(true);

  const { addItem, totalItems, setIsOpen } = useCart();
  const { isLoggedIn, setPendingCartAction, setRedirectUrl } = useAuth();
  const navigate = useNavigate();

  // Fetch live stock for SKUs
  useEffect(() => {
    const fetchStock = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/products");
        if (response.ok) {
          const products = await response.json();
          const updatedSkus = skus.map(sku => {
            const foundProduct = products.find((p: any) => p.id === sku.id);
            return foundProduct ? { ...sku, stock: foundProduct.stock } : sku;
          });
          setSkus(updatedSkus);
          // Update selected SKU with stock
          const currentSelected = updatedSkus.find(s => s.id === selectedSku.id);
          if (currentSelected) setSelectedSku(currentSelected);
        }
      } catch (error) {
        console.error("Failed to fetch stock:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStock();
  }, []);

  const handleAddToCart = async () => {
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
      name: `Moringa Powder - ${selectedSku.size}`,
      size: selectedSku.size,
      price: selectedSku.price,
      originalPrice: selectedSku.originalPrice,
      image: productImage
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <label className="font-body text-sm font-medium text-foreground">Select Size</label>
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {skus.map((sku) => (
            <button
              key={sku.id}
              onClick={() => setSelectedSku(sku)}
              className={`relative p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 text-left min-h-[44px] ${selectedSku.id === sku.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/50"
                } ${sku.stock === 0 ? "opacity-60 grayscale-[0.5]" : ""}`}
            >
              {sku.label && <span className="absolute -top-2 left-2 sm:left-3 px-1.5 py-0.5 bg-gold text-[9px] sm:text-[10px] font-semibold rounded-full text-foreground whitespace-nowrap">{sku.label}</span>}
              <div className="font-display font-semibold text-foreground" style={{ fontSize: "var(--text-base)" }}>{sku.size}</div>
              <div className="flex items-center gap-2 mt-1">
                <span className="font-display font-bold text-primary" style={{ fontSize: "var(--text-lg)" }}>₹{sku.price}</span>
                {sku.originalPrice && <span className="font-body text-muted-foreground line-through" style={{ fontSize: "var(--text-xs)" }}>₹{sku.originalPrice}</span>}
              </div>

              {/* Stock Status */}
              {!isLoading && sku.stock !== undefined && (
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
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <Button
          variant="hero"
          size="xl"
          className="w-full h-11 sm:h-12 gap-2 text-sm"
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
          <Button variant="outline" size="xl" className="w-full h-11 sm:h-12 gap-2 text-sm" onClick={() => setIsOpen(true)}>
            <ShoppingBag className="h-4 w-4" /> Go to Cart ({totalItems})
          </Button>
        )}
      </div>

    </div>
  );
};

export default ProductSelector;
