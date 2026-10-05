"use client";

import { useCart } from "@/components/CartProvider";
import { CartIcon, CheckIcon } from "@/components/icons";

type Props = {
  slug: string;
  variant?: "solid" | "light" | "outline";
  className?: string;
  label?: string;
};

const variants = {
  solid:
    "bg-sky-500 text-white shadow-lg shadow-sky-500/25 hover:bg-sky-400 focus-visible:outline-sky-500",
  light:
    "bg-white text-[#071634] shadow-lg shadow-black/20 hover:bg-sky-50 focus-visible:outline-white",
  outline:
    "bg-transparent text-white ring-1 ring-inset ring-white/30 hover:bg-white/10 focus-visible:outline-white",
} as const;

export function AddToCartButton({ slug, variant = "solid", className = "", label }: Props) {
  const { add, inCart, openCart } = useCart();
  const added = inCart(slug);

  return (
    <button
      type="button"
      onClick={() => (added ? openCart() : add(slug))}
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${className}`}
    >
      {added ? (
        <>
          <CheckIcon className="h-5 w-5" />
          En tu carrito · Ver
        </>
      ) : (
        <>
          <CartIcon className="h-5 w-5" />
          {label ?? "Agregar al carrito"}
        </>
      )}
    </button>
  );
}
