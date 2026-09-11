"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Camera,
  ImagePlus,
  Pencil,
  Trash2,
  Power,
  X,
  Save,
  Megaphone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type Banner = {
  id: string;
  image_url: string | null;
  title: string | null;
  description: string | null;
  link_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  storage_path: string | null;
};

type FormData = {
  title: string;
  description: string;
  link_url: string;
};

export default function AdminBannerPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  const [editingBanner, setEditingBanner] =
    useState<Banner | null>(null);

  const [form, setForm] = useState<FormData>({
    title: "",
    description: "",
    link_url: "",
  });

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    checkAccess();
  }, []);

  async function checkAccess() {
    try {
      const { supabase } =
        await import("../../../lib/supabase");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const { data: profile, error } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

      if (error || !profile) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      const canAccess =
        profile.role === "lider" ||
        profile.role === "admin";

      setAuthorized(canAccess);

      if (canAccess) {
        await loadBanners();
      }
    } catch (error) {
      console.error(
        "ERROR CHECK ACCESS:",
        error
      );

      setAuthorized(false);
    } finally {
      setLoading(false);
    }
  }

  async function loadBanners() {
    try {
      const { supabase } =
        await import("../../../lib/supabase");

      const { data, error } =
        await supabase
          .from("home_banners")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (error) {
        console.error(
          "Error cargando banners:",
          error
        );

        setErrorMessage(
          "No se pudieron cargar los banners."
        );

        return;
      }

      const normalizedBanners: Banner[] =
        (data || []).map((banner: any) => {
          let imageUrl =
            banner.image_url || null;

          if (
            !imageUrl &&
            banner.storage_path
          ) {
            const { data: publicUrlData } =
              supabase.storage
                .from("home-banners")
                .getPublicUrl(
                  banner.storage_path
                );

            imageUrl =
              publicUrlData.publicUrl;
          }

          return {
            ...banner,
            image_url: imageUrl,
          };
        });

      setBanners(normalizedBanners);
    } catch (error) {
      console.error(
        "ERROR CARGANDO BANNERS:",
        error
      );

      setErrorMessage(
        "No se pudieron cargar los banners."
      );
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    if (
      ![
        "image/png",
        "image/jpeg",
        "image/webp",
      ].includes(file.type)
    ) {
      setErrorMessage(
        "Solo se permiten imágenes PNG, JPG o WEBP."
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setErrorMessage(
        "La imagen no puede superar los 5 MB."
      );

      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    const objectUrl =
      URL.createObjectURL(file);

    setPreviewUrl(objectUrl);
  }

  function openCreateForm() {
    setEditingBanner(null);

    setForm({
      title: "",
      description: "",
      link_url: "",
    });

    setSelectedFile(null);
    setPreviewUrl(null);

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);
  }

  function openEditForm(
    banner: Banner
  ) {
    console.log(
      "========== EDITAR BANNER =========="
    );
    console.log(
      "ID:",
      banner.id
    );
    console.log(
      "image_url:",
      banner.image_url
    );
    console.log(
      "storage_path:",
      banner.storage_path
    );
    console.log(
      "==================================="
    );

    setEditingBanner(banner);

    setForm({
      title: banner.title || "",
      description:
        banner.description || "",
      link_url:
        banner.link_url || "",
    });

    setSelectedFile(null);

    setPreviewUrl(
      banner.image_url || null
    );

    setErrorMessage("");
    setSuccessMessage("");

    setShowForm(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingBanner(null);
    setSelectedFile(null);
    setPreviewUrl(null);

    setForm({
      title: "",
      description: "",
      link_url: "",
    });

    setErrorMessage("");
  }

  async function uploadImage(
    file: File
  ) {
    const { supabase } =
      await import("../../../lib/supabase");

    const extension =
      file.name
        .split(".")
        .pop()
        ?.toLowerCase() || "jpg";

    const storagePath =
      `banners/${crypto.randomUUID()}.${extension}`;

    const { error } =
      await supabase.storage
        .from("home-banners")
        .upload(
          storagePath,
          file,
          {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type,
          }
        );

    if (error) {
      throw error;
    }

    const { data } =
      supabase.storage
        .from("home-banners")
        .getPublicUrl(
          storagePath
        );

    return {
      publicUrl:
        data.publicUrl,
      storagePath,
    };
  }

  async function deleteStorageFile(
    storagePath: string | null
  ) {
    if (!storagePath) {
      return;
    }

    try {
      const { supabase } =
        await import("../../../lib/supabase");

      const { error } =
        await supabase.storage
          .from("home-banners")
          .remove([
            storagePath,
          ]);

      if (error) {
        console.error(
          "Error eliminando imagen:",
          error
        );
      }
    } catch (error) {
      console.error(
        "No se pudo eliminar la imagen:",
        error
      );
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { supabase } =
        await import("../../../lib/supabase");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "No estás autenticado."
        );
      }

      let imageUrl =
        editingBanner?.image_url || "";

      let storagePath =
        editingBanner?.storage_path ||
        null;

      if (
        !imageUrl &&
        storagePath
      ) {
        const { data: publicUrlData } =
          supabase.storage
            .from("home-banners")
            .getPublicUrl(
              storagePath
            );

        imageUrl =
          publicUrlData.publicUrl;
      }

      if (
        !editingBanner &&
        !selectedFile
      ) {
        throw new Error(
          "Tenés que seleccionar una imagen."
        );
      }

      if (selectedFile) {
        const uploaded =
          await uploadImage(
            selectedFile
          );

        imageUrl =
          uploaded.publicUrl;

        storagePath =
          uploaded.storagePath;
      }

      if (!imageUrl) {
        throw new Error(
          "El banner necesita una imagen."
        );
      }

      if (editingBanner) {
        const { error } =
          await supabase
            .from("home_banners")
            .update({
              image_url:
                imageUrl,
              storage_path:
                storagePath,
              title:
                form.title.trim() ||
                null,
              description:
                form.description.trim() ||
                null,
              link_url:
                form.link_url.trim() ||
                null,
              updated_by:
                user.id,
            })
            .eq(
              "id",
              editingBanner.id
            );

        if (error) {
          if (
            selectedFile &&
            storagePath
          ) {
            await deleteStorageFile(
              storagePath
            );
          }

          throw error;
        }

        if (
          selectedFile &&
          editingBanner.storage_path &&
          editingBanner.storage_path !==
            storagePath
        ) {
          await deleteStorageFile(
            editingBanner.storage_path
          );
        }

        setSuccessMessage(
          "Banner actualizado correctamente."
        );
      } else {
        const { error } =
          await supabase
            .from("home_banners")
            .insert({
              image_url:
                imageUrl,
              storage_path:
                storagePath,
              title:
                form.title.trim() ||
                null,
              description:
                form.description.trim() ||
                null,
              link_url:
                form.link_url.trim() ||
                null,
              is_active: true,
              created_by:
                user.id,
              updated_by:
                user.id,
            });

        if (error) {
          if (storagePath) {
            await deleteStorageFile(
              storagePath
            );
          }

          throw error;
        }

        setSuccessMessage(
          "Banner creado correctamente."
        );
      }

      await loadBanners();

      setShowForm(false);
      setEditingBanner(null);
      setSelectedFile(null);
      setPreviewUrl(null);

      setForm({
        title: "",
        description: "",
        link_url: "",
      });
    } catch (error: any) {
      console.error(
        "ERROR GUARDANDO BANNER:",
        error
      );

      setErrorMessage(
        error?.message ||
          "No se pudo guardar el banner."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleBanner(
    banner: Banner
  ) {
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { supabase } =
        await import("../../../lib/supabase");

      const { error } =
        await supabase
          .from("home_banners")
          .update({
            is_active:
              !banner.is_active,
          })
          .eq(
            "id",
            banner.id
          );

      if (error) {
        throw error;
      }

      await loadBanners();

      setSuccessMessage(
        banner.is_active
          ? "Banner desactivado."
          : "Banner activado."
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "No se pudo cambiar el estado del banner."
      );
    }
  }

  async function deleteBanner(
    banner: Banner
  ) {
    const confirmed =
      window.confirm(
        "¿Seguro que querés eliminar este banner? Esta acción no se puede deshacer."
      );

    if (!confirmed) {
      return;
    }

    setErrorMessage("");
    setSuccessMessage("");

    try {
      const { supabase } =
        await import("../../../lib/supabase");

      const { error } =
        await supabase
          .from("home_banners")
          .delete()
          .eq(
            "id",
            banner.id
          );

      if (error) {
        throw error;
      }

      await deleteStorageFile(
        banner.storage_path
      );

      await loadBanners();

      setSuccessMessage(
        "Banner eliminado correctamente."
      );
    } catch (error) {
      console.error(error);

      setErrorMessage(
        "No se pudo eliminar el banner."
      );
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0f0f0f] text-white">
        <div className="text-gray-400">
          Cargando...
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#0f0f0f] text-white">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft size={18} />
            Volver a administración
          </Link>

          <div className="mt-12 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#303030] bg-[#1b1b1b]">
              <Megaphone
                size={28}
                className="text-gray-500"
              />
            </div>

            <h1 className="mt-5 text-2xl font-bold">
              Acceso restringido
            </h1>

            <p className="mt-2 text-gray-500">
              No tenés permisos para administrar los banners.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0f0f0f] text-white">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">

        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
            >
              <ArrowLeft size={17} />
              Administración
            </Link>

            <div className="mt-5 flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#303030] bg-[#1b1b1b]">
                <Megaphone
                  size={21}
                  className="text-[#B4232D]"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  Banners del inicio
                </h1>

                <p className="mt-1 text-sm text-gray-500">
                  Administrá las imágenes que aparecen en el carrusel de Home.
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B4232D] px-5 py-3 font-bold text-white transition-colors hover:bg-[#96202A] sm:w-auto"
          >
            <ImagePlus size={18} />
            Nuevo banner
          </button>
        </div>

        {/* MENSAJES */}
        {errorMessage && !showForm && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-900/50 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {errorMessage}
            </span>
          </div>
        )}

        {successMessage && !showForm && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-green-900/50 bg-green-950/30 px-4 py-3 text-sm text-green-300">
            <CheckCircle2
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>
              {successMessage}
            </span>
          </div>
        )}

        {/* LISTA */}
        <div className="mt-8">
          {banners.length === 0 ? (
            <div className="rounded-2xl border border-[#292929] bg-[#151515] px-6 py-16 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1d1d1d]">
                <ImagePlus
                  size={28}
                  className="text-gray-500"
                />
              </div>

              <h2 className="mt-5 text-lg font-bold">
                Todavía no hay banners
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Creá el primer banner para mostrarlo en el inicio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {banners.map((banner) => (
                <div
                  key={banner.id}
                  className={`overflow-hidden rounded-2xl border transition-all ${
                    banner.is_active
                      ? "border-[#303030] bg-[#151515]"
                      : "border-[#242424] bg-[#121212] opacity-70"
                  }`}
                >

                  {/* IMAGEN CARD */}
                  <div className="relative overflow-hidden bg-[#0d0d0d]">
                    {banner.image_url ? (
                      <img
                        src={
                          banner.image_url
                        }
                        alt={
                          banner.title ||
                          "Banner del inicio"
                        }
                        className="block aspect-[16/7] h-auto w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
                        onError={(event) => {
                          console.error(
                            "ERROR IMAGEN CARD:",
                            banner.image_url
                          );

                          console.error(
                            event.currentTarget
                          );
                        }}
                      />
                    ) : (
                      <div className="flex aspect-[16/7] flex-col items-center justify-center">
                        <ImagePlus
                          size={32}
                          className="text-gray-600"
                        />

                        <span className="mt-2 text-xs text-gray-600">
                          Imagen no disponible
                        </span>
                      </div>
                    )}

                    <div className="absolute left-3 top-3">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                          banner.is_active
                            ? "bg-green-500/90 text-white"
                            : "bg-gray-700/90 text-gray-200"
                        }`}
                      >
                        {banner.is_active
                          ? "Activo"
                          : "Inactivo"}
                      </span>
                    </div>
                  </div>

                  {/* INFORMACIÓN */}
                  <div className="p-5">
                    <h2 className="text-lg font-bold">
                      {banner.title ||
                        "Sin título"}
                    </h2>

                    {banner.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-gray-500">
                        {
                          banner.description
                        }
                      </p>
                    )}

                    {banner.link_url && (
                      <div className="mt-3 flex items-center gap-2">
                        <ExternalLink
                          size={13}
                          className="shrink-0 text-gray-600"
                        />

                        <p className="truncate text-xs text-gray-600">
                          {
                            banner.link_url
                          }
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(
                            banner
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-[#222222] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#2c2c2c]"
                      >
                        <Pencil size={15} />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleBanner(
                            banner
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-[#222222] px-3 py-2 text-sm font-semibold transition-colors hover:bg-[#2c2c2c]"
                      >
                        <Power size={15} />

                        {banner.is_active
                          ? "Desactivar"
                          : "Activar"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteBanner(
                            banner
                          )
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-red-950/30 px-3 py-2 text-sm font-semibold text-red-300 transition-colors hover:bg-red-950/60"
                      >
                        <Trash2 size={15} />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MODAL
      ===================================================== */}

      {showForm && (
        <div
          className="
            fixed
            inset-0
            z-50

            flex
            items-start
            justify-center

            overflow-y-auto
            overscroll-contain

            bg-black/75
            px-2
            py-3
            pb-24

            backdrop-blur-sm

            sm:px-4
            sm:py-10
          "
          style={{
            WebkitOverflowScrolling: "touch",
          }}
          onMouseDown={(event) => {
            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              closeForm();
            }
          }}
        >
          {/* =================================================
              CONTENEDOR MODAL

              IMPORTANTE:
              min-h-0 + max-h permite que el formulario
              interno sea realmente desplazable en móvil.
          ================================================= */}

          <div
            className="
              flex
              w-full
              max-w-[1000px]
              min-h-0
              flex-col

              overflow-hidden

              rounded-2xl
              border
              border-[#303030]
              bg-[#111111]
              shadow-2xl

              max-h-[calc(100dvh-1.5rem)]

              sm:max-h-[calc(100dvh-5rem)]
            "
            onMouseDown={(event) => {
              event.stopPropagation();
            }}
          >
            {/* =================================================
                HEADER MODAL
            ================================================= */}

            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#292929] bg-[#111111] px-4 py-3 sm:px-5 sm:py-3.5">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-bold sm:text-xl">
                  {editingBanner
                    ? "Editar banner"
                    : "Nuevo banner"}
                </h2>

                <p className="mt-0.5 text-xs text-gray-500 sm:text-sm">
                  Configurá la imagen y la información.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1d1d1d] transition-colors hover:bg-[#292929] disabled:opacity-50"
                aria-label="Cerrar"
              >
                <X size={18} />
              </button>
            </div>

            {/* =================================================
                FORMULARIO

                ESTE ES EL ÁREA QUE HACE SCROLL.
            ================================================= */}

            <form
              id="banner-form"
              onSubmit={handleSubmit}
              className="
                min-h-0
                flex-1

                overflow-y-auto
                overflow-x-hidden

                overscroll-y-contain

                p-4
                sm:p-5
              "
              style={{
                WebkitOverflowScrolling: "touch",
                touchAction: "pan-y",
              }}
            >
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-6">

                {/* =================================================
                    COLUMNA IZQUIERDA
                    IMAGEN
                ================================================= */}

                <section>
                  <div className="mb-2.5">
                    <h3 className="text-sm font-bold">
                      Imagen del banner
                    </h3>

                    <p className="mt-1 text-xs text-gray-600">
                      Elegí la imagen que se mostrará en el carrusel.
                    </p>
                  </div>

                  <input
                    id="banner-image"
                    name="banner-image"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={
                      handleFileChange
                    }
                    disabled={saving}
                    className="sr-only"
                  />

                  {/* SELECTOR DE IMAGEN */}

                  <label
                    htmlFor="banner-image"
                    className={`block w-full cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-[#3a3a3a] bg-[#171717] transition-all ${
                      saving
                        ? "cursor-not-allowed opacity-50"
                        : "hover:border-[#B4232D] hover:bg-[#1c1c1c]"
                    }`}
                  >
                    {previewUrl ||
                    editingBanner?.image_url ? (
                      <div className="relative">
                        <img
                          src={
                            previewUrl ||
                            editingBanner?.image_url ||
                            ""
                          }
                          alt="Vista previa del banner"
                          className="block aspect-[16/7] h-auto w-full object-cover"
                          onLoad={() => {
                            console.log(
                              "✅ IMAGEN DEL MODAL CARGÓ:",
                              previewUrl ||
                                editingBanner?.image_url
                            );
                          }}
                          onError={(event) => {
                            console.error(
                              "❌ ERROR IMAGEN DEL MODAL:",
                              previewUrl ||
                                editingBanner?.image_url
                            );

                            console.error(
                              event.currentTarget
                            );
                          }}
                        />

                        <div className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/75 px-3 py-2 text-center text-xs font-semibold text-white">
                          Tocar para cambiar imagen
                        </div>
                      </div>
                    ) : (
                      <div className="flex aspect-[16/7] w-full flex-col items-center justify-center px-4 text-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#333333] bg-[#202020]">
                          <Camera
                            size={22}
                            className="text-gray-400"
                          />
                        </div>

                        <span className="mt-3 text-sm font-bold text-white">
                          Agregar imagen
                        </span>

                        <span className="mt-1 text-xs text-gray-600">
                          Tocá para seleccionar
                        </span>
                      </div>
                    )}
                  </label>
                </section>

                {/* =================================================
                    COLUMNA DERECHA
                    INFORMACIÓN
                ================================================= */}

                <div className="space-y-5">

                  {/* TITULO */}

                  <div>
                    <label
                      htmlFor="banner-title"
                      className="mb-2 block text-sm font-bold"
                    >
                      Título
                      <span className="ml-1 font-normal text-gray-600">
                        (opcional)
                      </span>
                    </label>

                    <input
                      id="banner-title"
                      type="text"
                      value={form.title}
                      onChange={(event) =>
                        setForm({
                          ...form,
                          title:
                            event.target.value,
                        })
                      }
                      maxLength={100}
                      placeholder="Ej: Descubrí los emprendimientos de Rafaela"
                      disabled={saving}
                      className="w-full rounded-xl border border-[#303030] bg-[#171717] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#B4232D] disabled:opacity-50"
                    />

                    <div className="mt-1 text-right text-[10px] text-gray-600">
                      {form.title.length}/100
                    </div>
                  </div>

                  {/* DESCRIPCIÓN */}

                  <div>
                    <label
                      htmlFor="banner-description"
                      className="mb-2 block text-sm font-bold"
                    >
                      Descripción
                      <span className="ml-1 font-normal text-gray-600">
                        (opcional)
                      </span>
                    </label>

                    <textarea
                      id="banner-description"
                      value={
                        form.description
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          description:
                            event.target.value,
                        })
                      }
                      maxLength={500}
                      rows={5}
                      placeholder="Texto opcional que aparecerá sobre la imagen."
                      disabled={saving}
                      className="w-full resize-none rounded-xl border border-[#303030] bg-[#171717] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#B4232D] disabled:opacity-50"
                    />

                    <div className="mt-1 text-right text-[10px] text-gray-600">
                      {
                        form.description
                          .length
                      }
                      /500
                    </div>
                  </div>

                  {/* LINK */}

                  <div>
                    <label
                      htmlFor="banner-link"
                      className="mb-2 block text-sm font-bold"
                    >
                      Enlace
                      <span className="ml-1 font-normal text-gray-600">
                        (opcional)
                      </span>
                    </label>

                    <input
                      id="banner-link"
                      type="url"
                      value={
                        form.link_url
                      }
                      onChange={(event) =>
                        setForm({
                          ...form,
                          link_url:
                            event.target.value,
                        })
                      }
                      placeholder="https://ejemplo.com"
                      disabled={saving}
                      className="w-full rounded-xl border border-[#303030] bg-[#171717] px-3.5 py-2.5 text-sm text-white outline-none transition-colors placeholder:text-gray-600 focus:border-[#B4232D] disabled:opacity-50"
                    />

                    <p className="mt-2 text-xs leading-relaxed text-gray-600">
                      Si agregás un enlace, al tocar el banner se abrirá esa dirección.
                    </p>
                  </div>

                  {/* ERROR */}

                  {errorMessage && (
                    <div className="flex items-start gap-2.5 rounded-xl border border-red-900/50 bg-red-950/30 px-3.5 py-3 text-sm text-red-300">
                      <AlertCircle
                        size={17}
                        className="mt-0.5 shrink-0"
                      />

                      <span>
                        {errorMessage}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* ESPACIO INFERIOR PARA QUE EL ÚLTIMO ELEMENTO
                  NO QUEDE PEGADO AL BORDE DEL SCROLL */}

              <div className="h-2 shrink-0 sm:h-0" />
            </form>

            {/* =================================================
                BOTÓN GUARDAR
            ================================================= */}

            <div className="flex shrink-0 justify-center border-t border-[#292929] bg-[#111111] p-3.5 sm:px-5 sm:py-3.5">
              <button
                type="submit"
                form="banner-form"
                disabled={saving}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#B4232D] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#96202A] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[180px]"
              >
                <Save size={17} />

                {saving
                  ? "Guardando..."
                  : editingBanner
                  ? "Guardar cambios"
                  : "Crear banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}