"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  ChevronRight,
  LogOut,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

import BottomNav from "../components/ui/BottomNav";
import { supabase } from "@/lib/supabase";

type UserRole = "lider" | "admin" | "user";

export default function AccountPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    async function loadRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingRole(false);
        return;
      }

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error obteniendo el rol:", error);
        setLoadingRole(false);
        return;
      }

      setRole(profile?.role as UserRole);
      setLoadingRole(false);
    }

    loadRole();
  }, []);

  async function handleLogout() {
    const confirmed = window.confirm(
      "¿Querés cerrar sesión?"
    );

    if (!confirmed) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error al cerrar sesión:", error);
      return;
    }

    router.push("/");
  }

  const canAccessAdmin =
    role === "lider" || role === "admin";

  return (
    <div className="min-h-screen bg-black text-white pb-24">

      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold">
            Mi perfil
          </h1>
        </div>
      </header>

      {/* CONTENIDO */}

      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">

          {/* EDITAR PERFIL */}

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
                Editar perfil
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


          {/* ADMINISTRACIÓN */}

          {!loadingRole && canAccessAdmin && (
            <Link
              href="/admin"
              className="group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck
                  size={24}
                  className="text-red-500"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">
                    Administración
                  </h2>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      role === "lider"
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                    }`}
                  >
                    {role === "lider" ? "LÍDER" : "ADMIN"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  Administrá la aplicación y atendé las consultas
                </p>
              </div>

              <ChevronRight
                size={20}
                className="text-gray-600 group-hover:text-red-500 transition"
              />
            </Link>
          )}


          {/* AYUDA Y SOPORTE */}

          <Link
            href="/support"
            className="group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <HelpCircle
                size={24}
                className="text-red-500"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold">
                Ayuda y soporte
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Reportá un problema o pedinos ayuda
              </p>
            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />
          </Link>


          {/* CERRAR SESIÓN */}

          <button
            onClick={handleLogout}
            className="w-full group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <LogOut
                size={24}
                className="text-red-500"
              />
            </div>

            <div className="flex-1 min-w-0">
              <h2 className="font-semibold">
                Cerrar sesión
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Salir de tu cuenta
              </p>
            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />
          </button>

        </div>
      </main>

      {/* BOTTOM NAV */}

      <BottomNav />

    </div>
  );
}
