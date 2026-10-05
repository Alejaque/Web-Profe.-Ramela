"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import { CartIcon, CloseIcon } from "@/components/icons";

const links = [
  { href: "#niveles", label: "Niveles" },
  { href: "#cursos", label: "Cursos" },
  { href: "#planificador-ia", label: "Planificador IA" },
  { href: "#profe", label: "El Profe" },
  { href: "#preguntas", label: "Preguntas" },
];

export function Header() {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050f26]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 lg:px-8">
        <a href="#inicio" className="flex items-center gap-3" aria-label="Profe. Alejandro Ramela - Inicio">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-500 font-display text-lg font-extrabold text-white">
            AR
          </span>
          <span className="font-display text-xl font-bold uppercase leading-none tracking-wide text-white">
            Profe. <span className="text-sky-400">Alejandro Ramela</span>
          </span>
        </a>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="Principal">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={openCart}
            className="relative inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/15 transition hover:bg-white/20"
            aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
          >
            <CartIcon className="h-5 w-5" />
            <span className="hidden sm:inline">Carrito</span>
            <span
              className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-xs font-bold ${
                count > 0 ? "bg-sky-500 text-white" : "bg-white/15 text-slate-300"
              }`}
            >
              {count}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/15 lg:hidden"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <CloseIcon className="h-5 w-5" />
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <nav className="border-t border-white/10 bg-[#050f26] px-5 py-3 lg:hidden" aria-label="Menú móvil">
          <ul className="space-y-1">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-slate-200 transition hover:bg-white/10"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
