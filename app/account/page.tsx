"use client";

import Link from "next/link";
import {
  User,
  Package,
  ChevronRight,
} from "lucide-react";

import BottomNav from "../components/ui/BottomNav";

export default function AccountPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">
            Cuenta
          </h1>
        </div>
      </header>

      {/* CONTENIDO */}

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">

          {/* MI PERFIL */}

          <Link
            href="/profile/edit"
            className="group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <User
                size={24}
                className="text-red-500"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold">
                Mi perfil
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Editá la información de tu emprendimiento
              </p>
            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />
          </Link>

          {/* MIS PUBLICACIONES */}

          <Link
            href="/account/listings"
            className="group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Package
                size={24}
                className="text-red-500"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold">
                Mis publicaciones
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Gestioná tus productos y publicaciones
              </p>
            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />
          </Link>

        </div>
      </main>

      {/* BOTTOM NAV */}

      <BottomNav />
    </div>
  );
}