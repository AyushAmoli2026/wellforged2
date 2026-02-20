import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { trackEvent } from "@/utils/analytics";
import { API_BASE_URL } from "@/config";

export interface CartItem {
  id: string;
  name: string;
  size: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  hasItem: (id: string) => boolean;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn, token } = useAuth();

  // Load local cart on mount
  useEffect(() => {
    const localCart = localStorage.getItem("wellforged_cart");
    if (localCart) {
      try {
        const parsed = JSON.parse(localCart);
        if (Array.isArray(parsed) && !isLoggedIn) {
          setItems(parsed);
        }
      } catch (e) {
        console.error("Failed to parse local cart:", e);
      }
    }
  }, [isLoggedIn]);

  // Persist to localStorage on change (only if not logged in)
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("wellforged_cart", JSON.stringify(items));
    }
  }, [items, isLoggedIn]);

  // Sync with backend on login
  useEffect(() => {
    if (isLoggedIn && token) {
      syncCartWithBackend();
    }
  }, [isLoggedIn, token]);

  const syncCartWithBackend = async () => {
    setIsLoading(true);
    try {
      // 1. Get current backend cart
      const response = await fetch(`${API_BASE_URL}/api/cart`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();

      if (response.ok) {
        // 2. If local cart has items, merge them
        const localCart = localStorage.getItem("wellforged_cart");
        let itemsToMerge = items;

        if (localCart && items.length === 0) {
          itemsToMerge = JSON.parse(localCart);
        }

        if (itemsToMerge.length > 0) {
          const bulkItems = itemsToMerge.map(item => ({ product_id: item.id, quantity: item.quantity }));
          await fetch(`${API_BASE_URL}/api/cart/bulk-add`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ items: bulkItems })
          });

          // Clear local guest cart after merge
          localStorage.removeItem("wellforged_cart");

          // Re-fetch after merge
          const finalResponse = await fetch(`${API_BASE_URL}/api/cart`, {
            headers: { "Authorization": `Bearer ${token}` }
          });
          const finalData = await finalResponse.json();
          updateItemsFromBackend(finalData.items);
        } else {
          updateItemsFromBackend(data.items);
        }
      }
    } catch (error) {
      console.error("Cart sync failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateItemsFromBackend = (backendItems: any[]) => {
    const formattedItems: CartItem[] = backendItems.map(item => ({
      id: item.product_id,
      name: item.name,
      size: item.name.split("-").pop()?.trim() || "Unit",
      price: parseFloat(item.price),
      quantity: item.quantity,
      image: item.image_url || "" // Handle missing images
    }));
    setItems(formattedItems);
  };

  const addItem = async (newItem: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find((item) => item.id === newItem.id);
      let updatedItems;
      if (existingItem) {
        updatedItems = prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedItems = [...prev, { ...newItem, quantity }];
      }
      return updatedItems;
    });

    trackEvent("add_to_cart", {
      item_id: newItem.id,
      item_name: newItem.name,
      price: newItem.price,
      quantity
    });

    if (isLoggedIn && token) {
      try {
        await fetch(`${API_BASE_URL}/api/cart/add`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ product_id: newItem.id, quantity })
        });
      } catch (error) {
        console.error("Failed to add item to backend cart:", error);
      }
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );

    if (isLoggedIn && token) {
      try {
        const currentItem = items.find(i => i.id === id);
        if (currentItem) {
          const diff = quantity - currentItem.quantity;
          if (diff !== 0) {
            await fetch("http://localhost:5000/api/cart/add", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              },
              body: JSON.stringify({ product_id: id, quantity: diff })
            });
          }
        }
      } catch (error) {
        console.error("Failed to update quantity in backend:", error);
      }
    }
  };

  const removeItem = async (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));

    if (isLoggedIn && token) {
      try {
        await fetch(`${API_BASE_URL}/api/cart/product/${id}`, {
          method: "DELETE",
          headers: { "Authorization": `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Failed to remove item from backend:", error);
      }
    }
  };

  const clearCart = () => {
    setItems([]);
    if (!isLoggedIn) {
      localStorage.removeItem("wellforged_cart");
    }
  };

  const hasItem = (id: string) => items.some((item) => item.id === id);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        setIsOpen,
        addItem,
        hasItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
