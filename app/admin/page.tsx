"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  LifeBuoy,
  Store,
  Package,
  Users,
  Megaphone,
  ChevronRight,
  Lock,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type UserRole = "lider" | "admin" | "user";

export default function AdminPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // No hay sesión
        if (!user) {
          router.replace("/auth");
          return;
        }

        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error obteniendo el rol:", error);
          router.replace("/");
          return;
        }

        const userRole = profile?.role as UserRole;

        setRole(userRole);

        // Los usuarios normales no pueden acceder
        if (userRole !== "lider" && userRole !== "admin") {
          return;
        }
      } catch (error) {
        console.error("Error verificando acceso:", error);
        router.replace("/");
      } finally {
        setLoading(false);
      }
    }

    checkAccess();
  }, [router]);

  // =========================================================
  // CARGANDO
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <ShieldCheck
            size={32}
            className="mx-auto text-red-500 animate-pulse"
          />

          <p className="text-gray-500 text-sm mt-3">
            Verificando acceso...
          </p>
        </div>
      </div>
    );
  }

  // =========================================================
  // ACCESO DENEGADO
  // =========================================================

  if (role !== "lider" && role !== "admin") {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
            <Lock size={28} className="text-red-500" />
          </div>

          <h1 className="text-xl font-bold mt-5">
            Acceso restringido
          </h1>

          <p className="text-gray-500 text-sm mt-2">
            No tenés permisos para acceder al panel de administración.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-gray-200 transition"
          >
            <ArrowLeft size={18} />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isLeader = role === "lider";

  return (
    <div className="min-h-screen bg-black text-white pb-10">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#222]">
        <div className="max-w-5xl mx-auto px-4 py-4">

          <div className="flex items-center gap-3">

            <Link
              href="/account"
              className="w-10 h-10 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center hover:border-red-500/50 transition"
            >
              <ArrowLeft
                size={20}
                className="text-gray-400"
              />
            </Link>

            <div className="flex-1">
              <h1 className="text-xl font-bold">
                Administración
              </h1>

              <p className="text-xs text-gray-500 mt-0.5">
                AppEmprendedores
              </p>
            </div>

            <div
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border ${
                isLeader
                  ? "bg-red-500/10 border-red-500/20 text-red-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-400"
              }`}
            >
              {isLeader ? "LÍDER" : "ADMIN"}
            </div>

          </div>

        </div>
      </header>


      {/* =====================================================
          CONTENIDO
      ===================================================== */}

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* BIENVENIDA */}

        <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 mb-6">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <ShieldCheck
                size={24}
                className="text-red-500"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                Panel de administración
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Desde acá podés administrar y supervisar la aplicación.
              </p>
            </div>

          </div>

        </div>


        {/* =====================================================
            MÓDULOS
        ===================================================== */}

        <div className="space-y-3">

          {/* SOPORTE */}

          <Link
            href="/admin/support"
            className="group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition"
          >

            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <LifeBuoy
                size={24}
                className="text-red-500"
              />
            </div>

            <div className="flex-1 min-w-0">

              <h2 className="font-semibold">
                Ayuda y soporte
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Revisá y gestioná las consultas de los usuarios.
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />

          </Link>


          {/* EMPRENDIMIENTOS */}

          <Link
            href="/admin/stores"
            className="group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition"
          >

            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Store
                size={24}
                className="text-red-500"
              />
            </div>

            <div className="flex-1 min-w-0">

              <h2 className="font-semibold">
                Emprendimientos
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Supervisá los emprendimientos registrados.
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />

          </Link>


          {/* PUBLICACIONES */}

          <Link
            href="/admin/listings"
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
                Publicaciones
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Revisá las publicaciones de los emprendimientos.
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />

          </Link>


          {/* USUARIOS */}

          <Link
            href="/admin/users"
            className="group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition"
          >

            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Users
                size={24}
                className="text-red-500"
              />
            </div>

            <div className="flex-1 min-w-0">

              <h2 className="font-semibold">
                Usuarios
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Gestioná los usuarios y sus permisos.
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />

          </Link>


          {/* BANNER */}

          <Link
            href="/admin/banner"
            className="group flex items-center gap-4 bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 hover:border-red-500/60 hover:bg-[#151515] transition"
          >

            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <Megaphone
                size={24}
                className="text-red-500"
              />
            </div>

            <div className="flex-1 min-w-0">

              <h2 className="font-semibold">
                Banner de inicio
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Administrá el banner que aparece en Home.
              </p>

            </div>

            <ChevronRight
              size={20}
              className="text-gray-600 group-hover:text-red-500 transition"
            />

          </Link>


          {/* GESTIÓN DE ROLES — SOLO LÍDER */}

          {isLeader && (
            <Link
              href="/admin/users"
              className="group flex items-center gap-4 bg-red-500/5 border border-red-500/20 rounded-2xl p-5 hover:border-red-500/60 hover:bg-red-500/10 transition"
            >

              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <ShieldCheck
                  size={24}
                  className="text-red-500"
                />
              </div>

              <div className="flex-1 min-w-0">

                <h2 className="font-semibold">
                  Gestión de administradores
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Convertí usuarios en administradores o quitá permisos de administrador.
                </p>

              </div>

              <ChevronRight
                size={20}
                className="text-red-500/60 group-hover:text-red-500 transition"
              />

            </Link>
          )}

        </div>

      </main>

    </div>
  );
}
