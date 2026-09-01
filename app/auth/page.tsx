"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Button from "../components/ui/Button";
import { signIn, signUp } from "../../lib/auth";
import { supabase } from "../../lib/supabase";

export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm />
    </Suspense>
  );
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<"login" | "signup">(
    searchParams.get("mode") === "signup" ? "signup" : "login"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "signup") {
        await signUp(email, password, username);

        setError(
          "Cuenta creada. Revisá tu email para confirmar tu cuenta."
        );

        return;
      }

      // ============================
      // LOGIN
      // ============================

      const { user } = await signIn(email, password);

      if (!user) {
        throw new Error("No se pudo obtener el usuario.");
      }

      // Buscamos el perfil del usuario
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("business_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      /*
       * Si no tiene nombre de emprendimiento,
       * consideramos que todavía no configuró su perfil.
       */
      if (!profile?.business_name?.trim()) {
        router.push("/profile/edit");
        router.refresh();
        return;
      }

      // Perfil configurado
      router.push("/");
      router.refresh();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Ocurrió un error. Intentá nuevamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors";

  const labelClass =
    "block text-sm font-medium text-[var(--color-muted)] mb-1";

  const isLogin = mode === "login";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center px-4">
      <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card-hover)] p-8 w-full max-w-sm">

        <Link
          href="/"
          className="text-2xl font-extrabold text-[var(--color-brand)] block mb-6 no-underline tracking-tight"
        >
          AppEmprendedores
        </Link>

        <h1 className="text-xl font-bold mb-1">
          {isLogin ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        <p className="text-[var(--color-muted)] text-sm mb-6">
          {isLogin
            ? "Ingresá a tu cuenta"
            : "Creá tu cuenta para comenzar"}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {mode === "signup" && (
            <div>
              <label className={labelClass}>
                Nombre de usuario
              </label>

              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="miemprendimiento"
                className={inputClass}
              />
            </div>
          )}

          <div>
            <label className={labelClass}>
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="tu@email.com"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>
              Contraseña
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
          >
            {loading
              ? "Cargando..."
              : isLogin
              ? "Iniciar sesión"
              : "Crear cuenta"}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-muted)] mt-4">
          {isLogin
            ? "¿No tenés una cuenta?"
            : "¿Ya tenés una cuenta?"}{" "}

          <button
            type="button"
            onClick={() => {
              setError("");
              setMode(isLogin ? "signup" : "login");
            }}
            className="text-[var(--color-brand)] font-semibold"
          >
            {isLogin ? "Registrarse" : "Iniciar sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
