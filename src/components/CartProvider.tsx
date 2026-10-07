"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  getCartSnapshot,
  getServerCartSnapshot,
  setCart,
  subscribeToCart,
} from "@/lib/cart-store";
import { isAvailable } from "@/lib/availability";
import type { Product } from "@/lib/types";

type CartContextValue = {
  products: Product[];
  lines: Product[];
  count: number;
  total: number;
  isOpen: boolean;
  toast: string | null;
  openCart: () => void;
  closeCart: () => void;
  dismissToast: () => void;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  inCart: (slug: string) => boolean;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({
  products,
  children,
}: {
  products: Product[];
  children: ReactNode;
}) {
  const slugs = useSyncExternalStore(
    subscribeToCart,
    getCartSnapshot,
    getServerCartSnapshot,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bySlug = useMemo(
    () => new Map(products.map((product) => [product.slug, product])),
    [products],
  );

  // Productos válidos del carrito (sin los que ya incluye un pack).
  const lines = useMemo(() => {
    const present = slugs
      .filter(isAvailable)
      .map((slug) => bySlug.get(slug))
      .filter((product): product is Product => Boolean(product));
    const covered = new Set(present.flatMap((product) => product.includesSlugs));
    return present.filter((product) => !covered.has(product.slug));
  }, [slugs, bySlug]);

  const total = useMemo(
    () => lines.reduce((sum, product) => sum + product.priceArs, 0),
    [lines],
  );

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const dismissToast = useCallback(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(null);
  }, []);

  const add = useCallback(
    (slug: string) => {
      const product = bySlug.get(slug);
      if (!product || !isAvailable(slug)) return;

      const current = getCartSnapshot();
      if (current.includes(slug)) {
        showToast("Ese curso ya está en tu carrito.");
        return;
      }

      const alreadyCovered = current.some((existing) =>
        bySlug.get(existing)?.includesSlugs.includes(slug),
      );
      if (alreadyCovered) {
        showToast("Ya está incluido en el Pack Completo de tu carrito.");
        return;
      }

      const next = current.filter((existing) => !product.includesSlugs.includes(existing));
      const replaced = next.length < current.length;
      next.push(slug);
      setCart(next);
      showToast(
        replaced
          ? "Pack agregado. Quitamos los cursos que ya incluye."
          : `${product.name} se agregó al carrito.`,
      );
    },
    [bySlug, showToast],
  );

  const remove = useCallback((slug: string) => {
    setCart(getCartSnapshot().filter((existing) => existing !== slug));
  }, []);

  const clear = useCallback(() => setCart([]), []);

  const inCart = useCallback(
    (slug: string) => {
      if (lines.some((line) => line.slug === slug)) return true;
      return lines.some((line) => line.includesSlugs.includes(slug));
    },
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      products,
      lines,
      count: lines.length,
      total,
      isOpen,
      toast,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      dismissToast,
      add,
      remove,
      clear,
      inCart,
    }),
    [products, lines, total, isOpen, toast, dismissToast, add, remove, clear, inCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe usarse dentro de <CartProvider>");
  }
  return context;
}
