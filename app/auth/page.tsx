"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      // ============================
      // REGISTRO
      // ============================

      if (mode === "signup") {
        if (password.length < 6) {
          throw new Error(
            "La contraseña debe tener al menos 6 caracteres."
          );
        }

        if (password !== confirmPassword) {
          throw new Error("Las contraseñas no coinciden.");
        }

        await signUp(email, password);

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
       * todavía no configuró su perfil.
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

          {/* EMAIL */}
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

          {/* CONTRASEÑA */}
          <div>
            <label className={labelClass}>
              Contraseña
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="••••••••"
                className={`${inputClass} pr-11`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                aria-label={
                  showPassword
                    ? "Ocultar contraseña"
                    : "Mostrar contraseña"
                }
              >
                {showPassword ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>

            {!isLogin && (
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Mínimo 6 caracteres.
              </p>
            )}
          </div>

          {/* REPETIR CONTRASEÑA */}
          {!isLogin && (
            <div>
              <label className={labelClass}>
                Repetir contraseña
              </label>

              <div className="relative">
                <input
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className={`${inputClass} pr-11`}
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
                  aria-label={
                    showConfirmPassword
                      ? "Ocultar confirmación de contraseña"
                      : "Mostrar confirmación de contraseña"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* MENSAJE */}
          {error && (
            <p
              className={`text-sm ${
                error.startsWith("Cuenta creada")
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {error}
            </p>
          )}

          {/* BOTÓN */}
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

        {/* CAMBIAR LOGIN / REGISTRO */}
        <p className="text-center text-sm text-[var(--color-muted)] mt-4">
          {isLogin
            ? "¿No tenés una cuenta?"
            : "¿Ya tenés una cuenta?"}{" "}

          <button
            type="button"
            onClick={() => {
              setError("");
              setPassword("");
              setConfirmPassword("");
              setShowPassword(false);
              setShowConfirmPassword(false);
              setMode(
                isLogin ? "signup" : "login"
              );
            }}
            className="text-[var(--color-brand)] font-semibold"
          >
            {isLogin
              ? "Registrarse"
              : "Iniciar sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
