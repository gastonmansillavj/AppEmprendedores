"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  HelpCircle,
  Send,
  Clock,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import BottomNav from "../components/ui/BottomNav";

type SupportRequest = {
  id: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
};

const typeLabels: Record<string, string> = {
  problema_cuenta: "Problema con mi cuenta",
  problema_emprendimiento: "Problema con mi emprendimiento",
  problema_publicacion: "Problema con una publicación",
  error_aplicacion: "Error en la aplicación",
  necesito_ayuda: "Necesito ayuda",
  otro: "Otro",
};

function getStatusInfo(status: string) {
  switch (status) {
    case "en_revision":
      return {
        label: "En revisión",
        icon: LoaderCircle,
        className:
          "text-blue-400 bg-blue-500/10 border-blue-500/20",
      };

    case "resuelto":
      return {
        label: "Resuelto",
        icon: CheckCircle2,
        className:
          "text-green-400 bg-green-500/10 border-green-500/20",
      };

    default:
      return {
        label: "Pendiente",
        icon: Clock,
        className:
          "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      };
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function SupportPage() {
  const router = useRouter();

  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  async function loadRequests() {
    setLoadingRequests(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRequests([]);
        return;
      }

      const { data, error } = await supabase
        .from("support_requests")
        .select(
          "id, type, message, status, created_at"
        )
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error(
          "Error al cargar consultas:",
          error
        );

        return;
      }

      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!type) {
      setError("Seleccioná el tipo de problema.");
      return;
    }

    if (!message.trim()) {
      setError(
        "Escribí un mensaje para poder ayudarte."
      );
      return;
    }

    if (message.trim().length < 10) {
      setError(
        "El mensaje debe tener al menos 10 caracteres."
      );
      return;
    }

    setSending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(
          "Tenés que iniciar sesión para enviar una consulta."
        );
        return;
      }

      const { error: insertError } = await supabase
        .from("support_requests")
        .insert({
          user_id: user.id,
          type,
          message: message.trim(),
          status: "pendiente",
        });

      if (insertError) {
        console.error(
          "Error al enviar consulta:",
          insertError
        );

        setError(
          "No pudimos enviar tu consulta. Intentá nuevamente."
        );

        return;
      }

      setType("");
      setMessage("");

      setSuccess(
        "Tu consulta fue enviada correctamente."
      );

      await loadRequests();
    } catch (err) {
      console.error(err);

      setError(
        "Ocurrió un error inesperado. Intentá nuevamente."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white pb-24">

      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#222]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">

          <button
            type="button"
            onClick={() => router.back()}
            className="w-10 h-10 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center hover:bg-[#181818] transition"
            aria-label="Volver"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-xl font-bold">
              Ayuda y soporte
            </h1>

            <p className="text-sm text-gray-500">
              Estamos para ayudarte
            </p>
          </div>

        </div>
      </header>

      {/* CONTENIDO */}

      <main className="max-w-2xl mx-auto px-4 py-6">

        {/* INTRODUCCIÓN */}

        <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 mb-5">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <HelpCircle
                size={24}
                className="text-red-500"
              />
            </div>

            <div>
              <h2 className="font-semibold">
                ¿Tuviste un problema?
              </h2>

              <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                Contanos qué pasó o qué necesitás y vamos
                a revisar tu consulta.
              </p>
            </div>

          </div>

        </div>

        {/* FORMULARIO */}

        <form
          onSubmit={handleSubmit}
          className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 space-y-5"
        >

          {/* TIPO */}

          <div>
            <label
              htmlFor="support-type"
              className="block text-sm font-medium mb-2"
            >
              ¿En qué podemos ayudarte?
            </label>

            <select
              id="support-type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white outline-none focus:border-red-500 transition"
            >
              <option value="">
                Seleccioná una opción
              </option>

              <option value="problema_cuenta">
                Problema con mi cuenta
              </option>

              <option value="problema_emprendimiento">
                Problema con mi emprendimiento
              </option>

              <option value="problema_publicacion">
                Problema con una publicación
              </option>

              <option value="error_aplicacion">
                Encontré un error en la aplicación
              </option>

              <option value="necesito_ayuda">
                Necesito ayuda
              </option>

              <option value="otro">
                Otro
              </option>
            </select>
          </div>

          {/* MENSAJE */}

          <div>
            <label
              htmlFor="support-message"
              className="block text-sm font-medium mb-2"
            >
              Contanos qué pasó
            </label>

            <textarea
              id="support-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribí acá tu consulta o explicanos el problema..."
              rows={7}
              maxLength={2000}
              className="w-full bg-black border border-[#333] rounded-xl px-4 py-3 text-white placeholder:text-gray-600 outline-none focus:border-red-500 transition resize-none"
            />

            <div className="text-right text-xs text-gray-600 mt-1">
              {message.length}/2000
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* ÉXITO */}

          {success && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
              {success}
            </div>
          )}

          {/* BOTÓN */}

          <button
            type="submit"
            disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl px-5 py-3 transition"
          >
            <Send size={18} />

            {sending
              ? "Enviando..."
              : "Enviar consulta"}
          </button>

        </form>

        {/* MIS CONSULTAS */}

        <section className="mt-8">

          <div className="mb-4">
            <h2 className="text-lg font-bold">
              Mis consultas
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Acá podés consultar el estado de los problemas
              que nos hayas enviado.
            </p>
          </div>

          {/* CARGANDO */}

          {loadingRequests && (
            <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5 text-sm text-gray-500">
              Cargando tus consultas...
            </div>
          )}

          {/* SIN CONSULTAS */}

          {!loadingRequests &&
            requests.length === 0 && (
              <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 text-center">

                <HelpCircle
                  size={32}
                  className="mx-auto text-gray-700 mb-3"
                />

                <p className="font-medium text-gray-300">
                  Todavía no tenés consultas
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Si tenés algún problema, podés enviarnos
                  una consulta desde el formulario.
                </p>

              </div>
            )}

          {/* LISTA DE CONSULTAS */}

          {!loadingRequests &&
            requests.length > 0 && (
              <div className="space-y-4">

                {requests.map((request) => {
                  const statusInfo =
                    getStatusInfo(request.status);

                  const StatusIcon =
                    statusInfo.icon;

                  return (
                    <div
                      key={request.id}
                      className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5"
                    >

                      <div className="flex items-start justify-between gap-4">

                        <div className="min-w-0">
                          <h3 className="font-semibold">
                            {typeLabels[request.type] ||
                              "Consulta"}
                          </h3>

                          <p className="text-xs text-gray-600 mt-1">
                            Enviada el{" "}
                            {formatDate(
                              request.created_at
                            )}
                          </p>
                        </div>

                        <div
                          className={`shrink-0 flex items-center gap-1.5 border rounded-full px-3 py-1.5 text-xs font-medium ${statusInfo.className}`}
                        >
                          <StatusIcon size={14} />

                          {statusInfo.label}
                        </div>

                      </div>

                      <div className="mt-4 pt-4 border-t border-[#222]">

                        <p className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                          {request.message}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

        </section>

      </main>

      {/* BOTTOM NAV */}

      <BottomNav />

    </div>
  );
}
