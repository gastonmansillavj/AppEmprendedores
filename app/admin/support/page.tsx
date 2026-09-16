"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  HelpCircle,
  LoaderCircle,
  ShieldCheck,
  User,
  AlertCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type UserRole = "lider" | "admin" | "user";

type SupportRequest = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  status: "pendiente" | "en_revision" | "resuelto";
  created_at: string;
  resolved_by: string | null;
  resolved_at: string | null;
};

type Profile = {
  id: string;
  username: string;
  business_name: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  problema_cuenta: "Problema con mi cuenta",
  problema_emprendimiento: "Problema con mi emprendimiento",
  problema_publicacion: "Problema con una publicación",
  error_aplicacion: "Error en la aplicación",
  necesito_ayuda: "Necesito ayuda",
  otro: "Otro",
};

const STATUS_LABELS: Record<string, string> = {
  pendiente: "Pendiente",
  en_revision: "En revisión",
  resuelto: "Resuelto",
};

function formatDate(date: string) {
  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusStyles(status: SupportRequest["status"]) {
  switch (status) {
    case "pendiente":
      return {
        icon: Clock,
        className:
          "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
      };

    case "en_revision":
      return {
        icon: LoaderCircle,
        className:
          "text-blue-400 bg-blue-500/10 border-blue-500/20",
      };

    case "resuelto":
      return {
        icon: CheckCircle2,
        className:
          "text-green-400 bg-green-500/10 border-green-500/20",
      };

    default:
      return {
        icon: AlertCircle,
        className:
          "text-gray-400 bg-gray-500/10 border-gray-500/20",
      };
  }
}

export default function AdminSupportPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});

  const [filter, setFilter] = useState<
    "todos" | "pendiente" | "en_revision" | "resuelto"
  >("todos");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth");
        return;
      }

      // ---------------------------------------------------
      // OBTENER ROL
      // ---------------------------------------------------

      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (profileError) {
        console.error(
          "Error obteniendo el rol:",
          profileError
        );

        router.push("/");
        return;
      }

      const userRole = profile?.role as UserRole;

      if (
        userRole !== "lider" &&
        userRole !== "admin"
      ) {
        router.push("/");
        return;
      }

      setRole(userRole);

      // ---------------------------------------------------
      // OBTENER CONSULTAS
      // ---------------------------------------------------

      const {
        data: supportData,
        error: supportError,
      } = await supabase
        .from("support_requests")
        .select(
          "id, user_id, type, message, status, created_at, resolved_by, resolved_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (supportError) {
        console.error(
          "Error obteniendo consultas:",
          supportError
        );

        setRequests([]);
        return;
      }

      const loadedRequests =
        (supportData as SupportRequest[]) || [];

      setRequests(loadedRequests);

      // ---------------------------------------------------
      // OBTENER PERFILES NECESARIOS
      // ---------------------------------------------------

      const userIds = Array.from(
        new Set(
          loadedRequests.flatMap((request) =>
            [
              request.user_id,
              request.resolved_by,
            ].filter(Boolean)
          )
        )
      ) as string[];

      if (userIds.length === 0) {
        setProfiles({});
        return;
      }

      const {
        data: profilesData,
        error: profilesError,
      } = await supabase
        .from("profiles")
        .select(
          "id, username, business_name"
        )
        .in("id", userIds);

      if (profilesError) {
        console.error(
          "Error obteniendo perfiles:",
          profilesError
        );

        setProfiles({});
        return;
      }

      const profileMap: Record<string, Profile> = {};

      (profilesData as Profile[]).forEach(
        (profileItem) => {
          profileMap[profileItem.id] =
            profileItem;
        }
      );

      setProfiles(profileMap);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(
    requestId: string,
    newStatus: SupportRequest["status"]
  ) {
    setUpdatingId(requestId);

    try {
      const { data, error } =
        await supabase.rpc(
          "admin_update_support_request",
          {
            p_request_id: requestId,
            p_status: newStatus,
          }
        );

      if (error) {
        console.error(
          "Error actualizando consulta:",
          error
        );

        alert(
          "No se pudo actualizar la consulta."
        );

        return;
      }

      if (!data) {
        alert(
          "No se recibió información de la consulta."
        );

        return;
      }

      const updatedRequest =
        data as SupportRequest;

      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? updatedRequest
            : request
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredRequests =
    filter === "todos"
      ? requests
      : requests.filter(
          (request) =>
            request.status === filter
        );

  const pendingCount = requests.filter(
    (request) =>
      request.status === "pendiente"
  ).length;

  const reviewCount = requests.filter(
    (request) =>
      request.status === "en_revision"
  ).length;

  const resolvedCount = requests.filter(
    (request) =>
      request.status === "resuelto"
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <LoaderCircle
            size={22}
            className="animate-spin"
          />
          <span>
            Cargando administración...
          </span>
        </div>
      </div>
    );
  }

  if (!role) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* HEADER */}

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#222]">
        <div className="max-w-5xl mx-auto px-4 py-4">

          <div className="flex items-center gap-3">

            <Link
              href="/admin"
              className="w-10 h-10 rounded-xl bg-[#111] border border-[#2a2a2a] flex items-center justify-center hover:border-red-500/50 transition"
            >
              <ArrowLeft size={20} />
            </Link>

            <div className="flex-1 min-w-0">

              <div className="flex items-center gap-2">

                <h1 className="text-xl font-bold">
                  Soporte
                </h1>

                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    role === "lider"
                      ? "text-red-400 bg-red-500/10 border-red-500/20"
                      : "text-blue-400 bg-blue-500/10 border-blue-500/20"
                  }`}
                >
                  {role === "lider"
                    ? "LÍDER"
                    : "ADMIN"}
                </span>

              </div>

              <p className="text-sm text-gray-500 mt-0.5">
                Consultas y problemas de usuarios
              </p>

            </div>

            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <ShieldCheck
                size={20}
                className="text-red-500"
              />
            </div>

          </div>

        </div>
      </header>


      {/* CONTENIDO */}

      <main className="max-w-5xl mx-auto px-4 py-6">

        {/* RESUMEN */}

        <div className="grid grid-cols-3 gap-3 mb-6">

          <button
            onClick={() =>
              setFilter("pendiente")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "pendiente"
                ? "border-yellow-500/40 bg-yellow-500/10"
                : "border-[#2a2a2a] bg-[#111] hover:border-yellow-500/30"
            }`}
          >
            <p className="text-xs text-gray-500">
              Pendientes
            </p>

            <p className="text-2xl font-bold mt-1 text-yellow-400">
              {pendingCount}
            </p>
          </button>


          <button
            onClick={() =>
              setFilter("en_revision")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "en_revision"
                ? "border-blue-500/40 bg-blue-500/10"
                : "border-[#2a2a2a] bg-[#111] hover:border-blue-500/30"
            }`}
          >
            <p className="text-xs text-gray-500">
              En revisión
            </p>

            <p className="text-2xl font-bold mt-1 text-blue-400">
              {reviewCount}
            </p>
          </button>


          <button
            onClick={() =>
              setFilter("resuelto")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "resuelto"
                ? "border-green-500/40 bg-green-500/10"
                : "border-[#2a2a2a] bg-[#111] hover:border-green-500/30"
            }`}
          >
            <p className="text-xs text-gray-500">
              Resueltos
            </p>

            <p className="text-2xl font-bold mt-1 text-green-400">
              {resolvedCount}
            </p>
          </button>

        </div>


        {/* FILTROS */}

        <div className="flex flex-wrap gap-2 mb-6">

          {(
            [
              ["todos", "Todas"],
              ["pendiente", "Pendientes"],
              ["en_revision", "En revisión"],
              ["resuelto", "Resueltos"],
            ] as const
          ).map(([value, label]) => (

            <button
              key={value}
              onClick={() =>
                setFilter(value)
              }
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition ${
                filter === value
                  ? "bg-red-500 text-white border-red-500"
                  : "bg-[#111] text-gray-400 border-[#2a2a2a] hover:text-white hover:border-red-500/40"
              }`}
            >
              {label}
            </button>

          ))}

        </div>


        {/* LISTADO */}

        {filteredRequests.length === 0 ? (

          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-10 text-center">

            <HelpCircle
              size={40}
              className="mx-auto text-gray-600 mb-4"
            />

            <h2 className="font-semibold text-lg">
              No hay consultas
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              No hay consultas que coincidan con
              el filtro seleccionado.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredRequests.map(
              (request) => {

                const statusStyles =
                  getStatusStyles(
                    request.status
                  );

                const StatusIcon =
                  statusStyles.icon;

                const sender =
                  profiles[request.user_id];

                const resolver =
                  request.resolved_by
                    ? profiles[
                        request.resolved_by
                      ]
                    : null;

                return (
                  <div
                    key={request.id}
                    className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5"
                  >

                    {/* CABECERA */}

                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">

                      <div className="flex-1 min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <span
                            className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${statusStyles.className}`}
                          >
                            <StatusIcon
                              size={13}
                              className={
                                request.status ===
                                "en_revision"
                                  ? "animate-spin"
                                  : ""
                              }
                            />

                            {
                              STATUS_LABELS[
                                request.status
                              ]
                            }
                          </span>

                          <span className="text-xs text-gray-500">
                            {
                              TYPE_LABELS[
                                request.type
                              ] ||
                              request.type
                            }
                          </span>

                        </div>


                        {/* USUARIO */}

                        <div className="flex items-center gap-2 mt-3 text-sm">

                          <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                            <User
                              size={16}
                              className="text-red-400"
                            />
                          </div>

                          <div>

                            <p className="font-medium">
                              {sender?.business_name ||
                                sender?.username ||
                                "Usuario"}
                            </p>

                            {sender?.business_name &&
                              sender?.username && (
                                <p className="text-xs text-gray-500">
                                  @{sender.username}
                                </p>
                              )}

                          </div>

                        </div>

                      </div>


                      <div className="text-xs text-gray-600 shrink-0">
                        {formatDate(
                          request.created_at
                        )}
                      </div>

                    </div>


                    {/* MENSAJE */}

                    <div className="mt-5 bg-black/40 border border-[#222] rounded-xl p-4">

                      <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {request.message}
                      </p>

                    </div>


                    {/* RESOLUCIÓN */}

                    {request.status ===
                      "resuelto" &&
                      resolver && (
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-400">

                          <CheckCircle2
                            size={16}
                          />

                          <span>
                            Resuelto por{" "}
                            <strong>
                              {resolver.business_name ||
                                resolver.username}
                            </strong>

                            {request.resolved_at &&
                              ` · ${formatDate(
                                request.resolved_at
                              )}`}
                          </span>

                        </div>
                      )}


                    {/* ACCIONES */}

                    <div className="mt-5 pt-4 border-t border-[#222]">

                      <p className="text-xs text-gray-600 mb-2">
                        Cambiar estado
                      </p>

                      <div className="flex flex-wrap gap-2">

                        {(
                          [
                            [
                              "pendiente",
                              "Pendiente",
                            ],
                            [
                              "en_revision",
                              "En revisión",
                            ],
                            [
                              "resuelto",
                              "Resolver",
                            ],
                          ] as const
                        ).map(
                          ([status, label]) => {

                            const isCurrent =
                              request.status ===
                              status;

                            const isUpdating =
                              updatingId ===
                              request.id;

                            return (
                              <button
                                key={status}
                                disabled={
                                  isCurrent ||
                                  isUpdating
                                }
                                onClick={() =>
                                  updateStatus(
                                    request.id,
                                    status
                                  )
                                }
                                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                                  isCurrent
                                    ? "bg-white/5 text-gray-600 border-[#222] cursor-default"
                                    : status ===
                                      "resuelto"
                                    ? "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"
                                    : status ===
                                      "en_revision"
                                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20"
                                    : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20"
                                }`}
                              >
                                {isUpdating ? (
                                  <span className="flex items-center gap-1.5">
                                    <LoaderCircle
                                      size={13}
                                      className="animate-spin"
                                    />
                                    Guardando...
                                  </span>
                                ) : (
                                  label
                                )}
                              </button>
                            );
                          }
                        )}

                      </div>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </main>

    </div>
  );
}
