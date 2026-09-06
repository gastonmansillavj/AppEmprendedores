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

  // No mostrar la barra en autenticación
  // ni durante la edición obligatoria del perfil
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#242424] bg-black/95 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto h-[72px] px-3 sm:px-4 flex items-center justify-around">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

          return (
            <Link
              key={href}
              href={href}
              className={`relative flex flex-col items-center justify-center gap-1.5 min-w-[72px] h-full no-underline transition-all duration-200 ${
                isActive
                  ? "text-[#B4232D]"
                  : "text-gray-500 hover:text-white"
              }`}
            >
              {/* Indicador superior */}
              <span
                className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] rounded-b-full transition-all duration-200 ${
                  isActive
                    ? "w-10 bg-[#B4232D]"
                    : "w-0 bg-transparent"
                }`}
              />

              {/* Icono */}
              <span
                className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#B4232D]/10"
                    : "bg-transparent"
                }`}
              >
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 1.9}
                />
              </span>

              {/* Texto */}
              <span
                className={`text-[10px] sm:text-[11px] leading-none transition-all duration-200 ${
                  isActive
                    ? "font-bold text-[#B4232D]"
                    : "font-medium text-gray-500"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}