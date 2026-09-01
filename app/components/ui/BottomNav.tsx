"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Heart, SlidersHorizontal, User } from "lucide-react";

const items = [
  {
    href: "/",
    label: "Inicio",
    icon: Home,
  },
  {
    href: "/favorites",
    label: "Favoritos",
    icon: Heart,
  },
  {
    href: "/filter",
    label: "Filtrar",
    icon: SlidersHorizontal,
  },
  {
    href: "/account",
    label: "Cuenta",
    icon: User,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  // No mostrar navegación inferior en login/registro.
  if (pathname.startsWith("/auth")) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--color-border)] bg-[var(--color-surface)]/95 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-1 min-w-16 h-full no-underline transition-colors ${
                isActive
                  ? "text-[var(--color-brand)]"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)]"
              }`}
            >
              <Icon size={21} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[11px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
