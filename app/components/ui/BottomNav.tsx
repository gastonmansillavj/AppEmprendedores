"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Heart,
  SlidersHorizontal,
  PackageSearch,
} from "lucide-react";
import { supabase } from "../../../lib/supabase";

const items = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/favorites", label: "Favoritos", icon: Heart },
  { href: "/filter", label: "Filtrar", icon: SlidersHorizontal },
  {
    href: "/account/listings",
    label: "Mis publicaciones",
    icon: PackageSearch,
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      setIsLoggedIn(!!user);
      setCheckingAuth(false);
    }

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      setIsLoggedIn(!!session?.user);
      setCheckingAuth(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // No mostrar la barra en autenticación ni durante la edición obligatoria del perfil
  if (
    pathname.startsWith("/auth") ||
    pathname.startsWith("/profile/edit")
  ) {
    return null;
  }

  // Mientras comprobamos la sesión no mostramos nada
  if (checkingAuth) return null;

  // Usuario no logueado: puede navegar, pero sin barra
  if (!isLoggedIn) return null;

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
              <Icon
                size={21}
                strokeWidth={isActive ? 2.5 : 2}
              />

              <span className="text-[11px] font-medium">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
