"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Store,
  ShieldCheck,
  LoaderCircle,
  CheckCircle2,
  Ban,
  Trash2,
  ExternalLink,
  User,
  Calendar,
  AlertTriangle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type UserRole = "lider" | "admin" | "user";

type StoreProfile = {
  id: string;
  username: string;
  business_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  role: UserRole;
  status: "activo" | "bloqueado";
  blocked_by: string | null;
  blocked_at: string | null;
  blocked_reason: string | null;
  created_at: string;
};

type Profile = {
  id: string;
  username: string;
  business_name: string | null;
};

function formatDate(date: string | null) {
  if (!date) return "";

  return new Date(date).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminStoresPage() {
  const router = useRouter();

  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const [stores, setStores] = useState<StoreProfile[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>(
    {}
  );

  const [filter, setFilter] = useState<
    "todos" | "activo" | "bloqueado"
  >("todos");

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [blockModal, setBlockModal] = useState<{
    store: StoreProfile;
  } | null>(null);

  const [blockReason, setBlockReason] = useState("");

  const [deleteModal, setDeleteModal] = useState<{
    store: StoreProfile;
  } | null>(null);

  useEffect(() => {
    loadStores();
  }, []);

  async function loadStores() {
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

      const { data: currentProfile, error: roleError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (roleError) {
        console.error(
          "Error obteniendo el rol:",
          roleError
        );

        router.push("/");
        return;
      }

      const userRole = currentProfile?.role as UserRole;

      if (
        userRole !== "lider" &&
        userRole !== "admin"
      ) {
        router.push("/");
        return;
      }

      setRole(userRole);

      // ---------------------------------------------------
      // OBTENER EMPRENDIMIENTOS
      // ---------------------------------------------------

      const {
        data: storesData,
        error: storesError,
      } = await supabase
        .from("profiles")
        .select(
          `
          id,
          username,
          business_name,
          avatar_url,
          bio,
          city,
          role,
          status,
          blocked_by,
          blocked_at,
          blocked_reason,
          created_at
        `
        )
        .order("created_at", {
          ascending: false,
        });

      if (storesError) {
        console.error(
          "Error obteniendo emprendimientos:",
          storesError
        );

        setStores([]);
        return;
      }

      const loadedStores =
        (storesData as StoreProfile[]) || [];

      setStores(loadedStores);

      // ---------------------------------------------------
      // OBTENER INFORMACIÓN DE QUIEN BLOQUEÓ
      // ---------------------------------------------------

      const blockedByIds = Array.from(
        new Set(
          loadedStores
            .map((store) => store.blocked_by)
            .filter(Boolean)
        )
      ) as string[];

      if (blockedByIds.length === 0) {
        setProfiles({});
        return;
      }

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from("profiles")
        .select(
          "id, username, business_name"
        )
        .in("id", blockedByIds);

      if (profileError) {
        console.error(
          "Error obteniendo perfiles de administradores:",
          profileError
        );

        setProfiles({});
        return;
      }

      const profileMap: Record<string, Profile> = {};

      (profileData as Profile[]).forEach(
        (profile) => {
          profileMap[profile.id] = profile;
        }
      );

      setProfiles(profileMap);
    } finally {
      setLoading(false);
    }
  }

  // -------------------------------------------------------
  // BLOQUEAR
  // -------------------------------------------------------

  async function blockStore() {
    if (!blockModal) return;

    const reason = blockReason.trim();

    if (reason.length < 5) {
      alert(
        "Ingresá un motivo de al menos 5 caracteres."
      );
      return;
    }

    const storeId = blockModal.store.id;

    setUpdatingId(storeId);

    try {
      const { data, error } =
        await supabase.rpc(
          "admin_update_store_status",
          {
            p_profile_id: storeId,
            p_status: "bloqueado",
            p_reason: reason,
          }
        );

      if (error) {
        console.error(
          "Error bloqueando emprendimiento:",
          error
        );

        alert(
          error.message ||
            "No se pudo bloquear el emprendimiento."
        );

        return;
      }

      if (!data) {
        alert(
          "No se recibió información del emprendimiento."
        );

        return;
      }

      const updatedStore =
        data as StoreProfile;

      setStores((current) =>
        current.map((store) =>
          store.id === storeId
            ? updatedStore
            : store
        )
      );

      setBlockModal(null);
      setBlockReason("");
    } finally {
      setUpdatingId(null);
    }
  }

  // -------------------------------------------------------
  // REACTIVAR
  // -------------------------------------------------------

  async function activateStore(
    store: StoreProfile
  ) {
    const confirmed = window.confirm(
      `¿Querés reactivar "${store.business_name || store.username}"?`
    );

    if (!confirmed) return;

    setUpdatingId(store.id);

    try {
      const { data, error } =
        await supabase.rpc(
          "admin_update_store_status",
          {
            p_profile_id: store.id,
            p_status: "activo",
            p_reason: null,
          }
        );

      if (error) {
        console.error(
          "Error reactivando emprendimiento:",
          error
        );

        alert(
          error.message ||
            "No se pudo reactivar el emprendimiento."
        );

        return;
      }

      if (!data) {
        alert(
          "No se recibió información del emprendimiento."
        );

        return;
      }

      const updatedStore =
        data as StoreProfile;

      setStores((current) =>
        current.map((item) =>
          item.id === store.id
            ? updatedStore
            : item
        )
      );
    } finally {
      setUpdatingId(null);
    }
  }

  // -------------------------------------------------------
  // ELIMINAR
  // -------------------------------------------------------

  async function deleteStore() {
    if (!deleteModal) return;

    if (role !== "lider") {
      alert(
        "Solo el líder puede eliminar emprendimientos."
      );
      return;
    }

    const storeId = deleteModal.store.id;

    setUpdatingId(storeId);

    try {
      const { error } =
        await supabase.rpc(
          "lider_delete_store",
          {
            p_profile_id: storeId,
          }
        );

      if (error) {
        console.error(
          "Error eliminando emprendimiento:",
          error
        );

        alert(
          error.message ||
            "No se pudo eliminar el emprendimiento."
        );

        return;
      }

      setStores((current) =>
        current.filter(
          (store) => store.id !== storeId
        )
      );

      setDeleteModal(null);
    } finally {
      setUpdatingId(null);
    }
  }

  // -------------------------------------------------------
  // FILTRO
  // -------------------------------------------------------

  const filteredStores =
    filter === "todos"
      ? stores
      : stores.filter(
          (store) =>
            store.status === filter
        );

  const activeCount = stores.filter(
    (store) =>
      store.status === "activo"
  ).length;

  const blockedCount = stores.filter(
    (store) =>
      store.status === "bloqueado"
  ).length;

  // -------------------------------------------------------
  // LOADING
  // -------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <LoaderCircle
            size={22}
            className="animate-spin"
          />

          <span>
            Cargando emprendimientos...
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

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#222]">

        <div className="max-w-6xl mx-auto px-4 py-4">

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
                  Emprendimientos
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
                Administración de tiendas
              </p>

            </div>

            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Store
                size={20}
                className="text-red-500"
              />
            </div>

          </div>

        </div>

      </header>


      {/* ================================================= */}
      {/* CONTENIDO */}
      {/* ================================================= */}

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* ================================================= */}
        {/* RESUMEN */}
        {/* ================================================= */}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">

          <button
            onClick={() =>
              setFilter("todos")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "todos"
                ? "border-red-500/40 bg-red-500/10"
                : "border-[#2a2a2a] bg-[#111] hover:border-red-500/30"
            }`}
          >
            <p className="text-xs text-gray-500">
              Total
            </p>

            <p className="text-2xl font-bold mt-1">
              {stores.length}
            </p>
          </button>


          <button
            onClick={() =>
              setFilter("activo")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "activo"
                ? "border-green-500/40 bg-green-500/10"
                : "border-[#2a2a2a] bg-[#111] hover:border-green-500/30"
            }`}
          >
            <p className="text-xs text-gray-500">
              Activos
            </p>

            <p className="text-2xl font-bold mt-1 text-green-400">
              {activeCount}
            </p>
          </button>


          <button
            onClick={() =>
              setFilter("bloqueado")
            }
            className={`rounded-2xl border p-4 text-left transition ${
              filter === "bloqueado"
                ? "border-red-500/40 bg-red-500/10"
                : "border-[#2a2a2a] bg-[#111] hover:border-red-500/30"
            }`}
          >
            <p className="text-xs text-gray-500">
              Bloqueados
            </p>

            <p className="text-2xl font-bold mt-1 text-red-400">
              {blockedCount}
            </p>
          </button>

        </div>


        {/* ================================================= */}
        {/* FILTROS */}
        {/* ================================================= */}

        <div className="flex flex-wrap gap-2 mb-6">

          {(
            [
              ["todos", "Todos"],
              ["activo", "Activos"],
              ["bloqueado", "Bloqueados"],
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


        {/* ================================================= */}
        {/* LISTADO */}
        {/* ================================================= */}

        {filteredStores.length === 0 ? (

          <div className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-10 text-center">

            <Store
              size={40}
              className="mx-auto text-gray-600 mb-4"
            />

            <h2 className="font-semibold text-lg">
              No hay emprendimientos
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              No hay emprendimientos que
              coincidan con el filtro.
            </p>

          </div>

        ) : (

          <div className="space-y-4">

            {filteredStores.map(
              (store) => {

                const isUpdating =
                  updatingId === store.id;

                const blockedBy =
                  store.blocked_by
                    ? profiles[
                        store.blocked_by
                      ]
                    : null;

                return (
                  <div
                    key={store.id}
                    className="bg-[#111] border border-[#2a2a2a] rounded-2xl p-5"
                  >

                    {/* ===================================== */}
                    {/* INFORMACIÓN */}
                    {/* ===================================== */}

                    <div className="flex flex-col lg:flex-row gap-5">

                      <div className="flex-1 min-w-0">

                        <div className="flex items-start gap-4">

                          {/* LOGO */}

                          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#2a2a2a] overflow-hidden shrink-0">

                            {store.avatar_url ? (

                              <img
                                src={
                                  store.avatar_url
                                }
                                alt={
                                  store.business_name ||
                                  store.username
                                }
                                className="w-full h-full object-cover"
                              />

                            ) : (

                              <div className="w-full h-full flex items-center justify-center">

                                <Store
                                  size={25}
                                  className="text-gray-600"
                                />

                              </div>

                            )}

                          </div>


                          {/* DATOS */}

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <h2 className="font-bold text-lg truncate">

                                {store.business_name ||
                                  "Sin nombre"}

                              </h2>

                              {store.status ===
                              "activo" ? (

                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-green-400 bg-green-500/10 border border-green-500/20">

                                  <CheckCircle2
                                    size={11}
                                  />

                                  ACTIVA

                                </span>

                              ) : (

                                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-red-400 bg-red-500/10 border border-red-500/20">

                                  <Ban
                                    size={11}
                                  />

                                  BLOQUEADA

                                </span>

                              )}

                            </div>


                            <p className="text-sm text-gray-500 mt-1">
                              @{store.username}
                            </p>


                            {store.bio && (
                              <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                                {store.bio}
                              </p>
                            )}


                            <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-500">

                              {store.city && (
                                <span className="flex items-center gap-1.5">
                                  <Store
                                    size={13}
                                  />
                                  {store.city}
                                </span>
                              )}

                              <span className="flex items-center gap-1.5">
                                <Calendar
                                  size={13}
                                />
                                Registrado{" "}
                                {formatDate(
                                  store.created_at
                                )}
                              </span>

                            </div>

                          </div>

                        </div>


                        {/* ================================= */}
                        {/* INFORMACIÓN DEL BLOQUEO */}
                        {/* ================================= */}

                        {store.status ===
                          "bloqueado" && (
                          <div className="mt-5 bg-red-500/5 border border-red-500/15 rounded-xl p-4">

                            <div className="flex items-start gap-3">

                              <AlertTriangle
                                size={18}
                                className="text-red-400 mt-0.5 shrink-0"
                              />

                              <div className="min-w-0">

                                <p className="text-sm font-semibold text-red-300">
                                  Emprendimiento bloqueado
                                </p>

                                {store.blocked_reason && (
                                  <p className="text-sm text-gray-400 mt-1">
                                    Motivo:{" "}
                                    {
                                      store.blocked_reason
                                    }
                                  </p>
                                )}

                                {store.blocked_at && (
                                  <p className="text-xs text-gray-600 mt-2">
                                    {formatDate(
                                      store.blocked_at
                                    )}
                                  </p>
                                )}

                                {blockedBy && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    Bloqueado por{" "}
                                    <span className="text-gray-300">
                                      {blockedBy.business_name ||
                                        `@${blockedBy.username}`}
                                    </span>
                                  </p>
                                )}

                              </div>

                            </div>

                          </div>
                        )}

                      </div>


                      {/* ===================================== */}
                      {/* ACCIONES */}
                      {/* ===================================== */}

                      <div className="lg:w-52 shrink-0 flex flex-col gap-2">

                        {/* VER TIENDA */}

                        <Link
                          href={`/store/${store.id}`}
                          target="_blank"
                          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#181818] border border-[#2a2a2a] text-sm font-medium hover:border-red-500/40 transition"
                        >
                          <ExternalLink
                            size={16}
                          />
                          Ver emprendimiento
                        </Link>


                        {/* BLOQUEAR */}

                        {store.status ===
                          "activo" && (
                          <button
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              setBlockModal({
                                store,
                              })
                            }
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/20 transition disabled:opacity-50"
                          >
                            <Ban
                              size={16}
                            />
                            Bloquear
                          </button>
                        )}


                        {/* REACTIVAR */}

                        {store.status ===
                          "bloqueado" && (
                          <button
                            disabled={
                              isUpdating
                            }
                            onClick={() =>
                              activateStore(
                                store
                              )
                            }
                            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-semibold hover:bg-green-500/20 transition disabled:opacity-50"
                          >
                            {isUpdating ? (
                              <LoaderCircle
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <CheckCircle2
                                size={16}
                              />
                            )}

                            Reactivar
                          </button>
                        )}


                        {/* ELIMINAR - SOLO LÍDER */}

                        {role === "lider" &&
                          store.role !==
                            "lider" && (
                            <button
                              disabled={
                                isUpdating
                              }
                              onClick={() =>
                                setDeleteModal({
                                  store,
                                })
                              }
                              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-transparent border border-red-500/10 text-red-500/70 text-sm font-semibold hover:bg-red-500/10 hover:text-red-400 transition disabled:opacity-50"
                            >
                              <Trash2
                                size={16}
                              />
                              Eliminar
                            </button>
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


      {/* ================================================= */}
      {/* MODAL BLOQUEAR */}
      {/* ================================================= */}

      {blockModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-[#111] border border-[#2a2a2a] rounded-2xl p-6 shadow-2xl">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Ban
                  size={23}
                  className="text-red-400"
                />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Bloquear emprendimiento
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {
                    blockModal.store
                      .business_name ||
                    blockModal.store.username
                  }
                </p>
              </div>

            </div>


            <div className="mt-5">

              <label className="block text-sm font-medium mb-2">
                Motivo del bloqueo
              </label>

              <textarea
                value={blockReason}
                onChange={(event) =>
                  setBlockReason(
                    event.target.value
                  )
                }
                maxLength={500}
                rows={4}
                placeholder="Indicá por qué se bloquea este emprendimiento..."
                className="w-full bg-black border border-[#2a2a2a] rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none focus:border-red-500/50 resize-none"
              />

              <p className="text-xs text-gray-600 mt-1 text-right">
                {blockReason.length}/500
              </p>

            </div>


            <div className="mt-5 flex gap-2">

              <button
                onClick={() => {
                  setBlockModal(null);
                  setBlockReason("");
                }}
                disabled={
                  updatingId ===
                  blockModal.store.id
                }
                className="flex-1 px-4 py-3 rounded-xl bg-[#181818] border border-[#2a2a2a] text-sm font-semibold hover:border-[#444] transition"
              >
                Cancelar
              </button>

              <button
                onClick={blockStore}
                disabled={
                  updatingId ===
                  blockModal.store.id
                }
                className="flex-1 px-4 py-3 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition disabled:opacity-50"
              >
                {updatingId ===
                blockModal.store.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Bloqueando...
                  </span>
                ) : (
                  "Confirmar bloqueo"
                )}
              </button>

            </div>

          </div>

        </div>
      )}


      {/* ================================================= */}
      {/* MODAL ELIMINAR */}
      {/* ================================================= */}

      {deleteModal && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-[#111] border border-red-500/20 rounded-2xl p-6 shadow-2xl">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                <Trash2
                  size={23}
                  className="text-red-400"
                />
              </div>

              <div>
                <h2 className="font-bold text-lg">
                  Eliminar emprendimiento
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Esta acción es definitiva.
                </p>
              </div>

            </div>


            <div className="mt-5 bg-red-500/5 border border-red-500/10 rounded-xl p-4">

              <p className="text-sm text-gray-300">
                Estás a punto de eliminar:
              </p>

              <p className="font-semibold mt-1">
                {
                  deleteModal.store
                    .business_name ||
                  deleteModal.store.username
                }
              </p>

              <p className="text-xs text-red-400 mt-3">
                Esta acción no se puede deshacer.
                Las publicaciones relacionadas
                también pueden eliminarse si la
                base de datos tiene configurado
                CASCADE.
              </p>

            </div>


            <div className="mt-5 flex gap-2">

              <button
                onClick={() =>
                  setDeleteModal(null)
                }
                disabled={
                  updatingId ===
                  deleteModal.store.id
                }
                className="flex-1 px-4 py-3 rounded-xl bg-[#181818] border border-[#2a2a2a] text-sm font-semibold hover:border-[#444] transition"
              >
                Cancelar
              </button>

              <button
                onClick={deleteStore}
                disabled={
                  updatingId ===
                  deleteModal.store.id
                }
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition disabled:opacity-50"
              >
                {updatingId ===
                deleteModal.store.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                    Eliminando...
                  </span>
                ) : (
                  "Eliminar definitivamente"
                )}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
}
