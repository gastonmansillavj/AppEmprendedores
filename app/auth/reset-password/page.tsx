"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import Button from "../../components/ui/Button";
import { supabase } from "../../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [loading, setLoading] =
    useState(false);

  const [checkingSession, setCheckingSession] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          "El enlace de recuperación no es válido o ya venció. Solicitá un nuevo enlace."
        );
      }

      setCheckingSession(false);
    };

    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "PASSWORD_RECOVERY" &&
          session
        ) {
          setError("");
          setCheckingSession(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");

    if (password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Las contraseñas no coinciden."
      );
      return;
    }

    setLoading(true);

    try {
      const { error } =
        await supabase.auth.updateUser({
          password,
        });

      if (error) {
        throw error;
      }

      setSuccess(true);

      await supabase.auth.signOut();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo cambiar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-[var(--color-border)] bg-[var(--color-subtle)] rounded-xl px-4 py-2 text-sm outline-none focus:border-[var(--color-brand)] transition-colors";

  const labelClass =
    "block text-sm font-medium text-[var(--color-muted)] mb-1";

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center px-4">
        <div className="text-sm text-[var(--color-muted)]">
          Verificando enlace...
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] flex items-center justify-center px-4">
        <div className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card-hover)] p-8 w-full max-w-sm">

          <Link
            href="/"
            className="text-2xl font-extrabold text-[var(--color-brand)] block mb-6 no-underline tracking-tight"
          >
            AppEmprendedores
          </Link>

          <h1 className="text-xl font-bold mb-2">
            Contraseña actualizada
          </h1>

          <p className="text-[var(--color-muted)] text-sm mb-6">
            Tu contraseña fue cambiada correctamente.
            Ya podés iniciar sesión con tu nueva
            contraseña.
          </p>

          <Button
            type="button"
            onClick={() =>
              router.push("/auth")
            }
            className="w-full py-3"
          >
            Iniciar sesión
          </Button>
        </div>
      </div>
    );
  }

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
          Nueva contraseña
        </h1>

        <p className="text-[var(--color-muted)] text-sm mb-6">
          Elegí una nueva contraseña para tu cuenta.
        </p>

        {error && (
          <p className="text-sm text-red-500 mb-4">
            {error}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          {/* NUEVA CONTRASEÑA */}

          <div>
            <label className={labelClass}>
              Nueva contraseña
            </label>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
                minLength={6}
                placeholder="••••••••"
                className={`${inputClass} pr-11`}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (value) => !value
                  )
                }
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

            <p className="text-xs text-[var(--color-muted)] mt-1">
              Mínimo 6 caracteres.
            </p>
          </div>

          {/* REPETIR CONTRASEÑA */}

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
                  setConfirmPassword(
                    e.target.value
                  )
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

          {/* BOTÓN */}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3"
          >
            {loading
              ? "Actualizando..."
              : "Cambiar contraseña"}
          </Button>
        </form>

        <p className="text-center text-sm text-[var(--color-muted)] mt-4">
          <Link
            href="/auth"
            className="text-[var(--color-brand)] font-semibold"
          >
            Volver al inicio de sesión
          </Link>
        </p>
      </div>
    </div>
  );
}