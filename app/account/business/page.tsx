"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import BottomNav from "../../components/ui/BottomNav";

const MAX_LISTINGS = 5;
const MAX_SHOWCASE_IMAGES = 3;

type Listing = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  images: string[] | null;
  sold: boolean;
  type: string | null;
  created_at: string;
};

type ShowcaseImage = {
  id: number;
  profile_id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
};

export default function BusinessPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [showcaseImages, setShowcaseImages] = useState<ShowcaseImage[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingShowcase, setLoadingShowcase] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingShowcase, setDeletingShowcase] = useState<number | null>(
    null
  );
  const [deleting, setDeleting] = useState<number | null>(null);

  const [error, setError] = useState("");
  const [showcaseError, setShowcaseError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setLoadingShowcase(true);
    setError("");
    setShowcaseError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No se encontró el usuario.");
      setLoading(false);
      setLoadingShowcase(false);
      return;
    }

    await Promise.all([
      loadListings(user.id),
      loadShowcase(user.id),
    ]);

    setLoading(false);
    setLoadingShowcase(false);
  }

  async function loadListings(userId: string) {
    const { data, error: listingsError } = await supabase
      .from("listings")
      .select(`
        id,
        title,
        description,
        price,
        category,
        image_url,
        images,
        sold,
        type,
        created_at
      `)
      .eq("seller_id", userId)
      .order("created_at", {
        ascending: false,
      });

    if (listingsError) {
      console.error(
        "Error cargando publicaciones:",
        listingsError
      );

      setError(
        "No se pudieron cargar tus publicaciones."
      );

      return;
    }

    setListings((data || []) as Listing[]);
  }

  async function loadShowcase(userId: string) {
    const { data, error: showcaseLoadError } = await supabase
      .from("business_showcase")
      .select(`
        id,
        profile_id,
        image_url,
        storage_path,
        created_at
      `)
      .eq("profile_id", userId)
      .order("created_at", {
        ascending: true,
      });

    if (showcaseLoadError) {
      console.error(
        "Error cargando vidriera:",
        showcaseLoadError
      );

      setShowcaseError(
        "No se pudieron cargar las imágenes de tu vidriera."
      );

      return;
    }

    setShowcaseImages(
      (data || []) as ShowcaseImage[]
    );
  }

  async function handleShowcaseUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    setShowcaseError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setShowcaseError(
        "No se encontró el usuario."
      );

      e.target.value = "";
      return;
    }

    const availableSlots =
      MAX_SHOWCASE_IMAGES -
      showcaseImages.length;

    if (availableSlots <= 0) {
      setShowcaseError(
        `Ya tenés las ${MAX_SHOWCASE_IMAGES} imágenes permitidas.`
      );

      e.target.value = "";
      return;
    }

    const selectedFiles =
      files.slice(0, availableSlots);

    setUploading(true);

    try {
      const uploadedImages: ShowcaseImage[] = [];

      for (const file of selectedFiles) {
        if (!file.type.startsWith("image/")) {
          throw new Error(
            "Solo podés subir archivos de imagen."
          );
        }

        const extension =
          file.name
            .split(".")
            .pop()
            ?.toLowerCase() || "jpg";

        const uniqueName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 8)}.${extension}`;

        const storagePath =
          `${user.id}/${uniqueName}`;

        const { error: uploadError } =
          await supabase.storage
            .from("business-showcase")
            .upload(
              storagePath,
              file,
              {
                cacheControl: "3600",
                upsert: false,
              }
            );

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } =
          supabase.storage
            .from("business-showcase")
            .getPublicUrl(storagePath);

        const publicUrl =
          urlData.publicUrl;

        const { data: insertedImage, error: insertError } =
          await supabase
            .from("business_showcase")
            .insert({
              profile_id: user.id,
              image_url: publicUrl,
              storage_path: storagePath,
            })
            .select(`
              id,
              profile_id,
              image_url,
              storage_path,
              created_at
            `)
            .single();

        if (insertError) {
          // Si la tabla falla, intentamos eliminar
          // el archivo que acabamos de subir.
          await supabase.storage
            .from("business-showcase")
            .remove([storagePath]);

          throw insertError;
        }

        uploadedImages.push(
          insertedImage as ShowcaseImage
        );
      }

      setShowcaseImages((previous) =>
        [
          ...previous,
          ...uploadedImages,
        ].slice(0, MAX_SHOWCASE_IMAGES)
      );
    } catch (err: unknown) {
      console.error(
        "Error subiendo imagen de vidriera:",
        err
      );

      setShowcaseError(
        err instanceof Error
          ? err.message
          : "No se pudieron subir las imágenes."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleDeleteShowcase(
    image: ShowcaseImage
  ) {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar esta imagen de la vidriera?"
    );

    if (!confirmed) return;

    setDeletingShowcase(image.id);
    setShowcaseError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error(
          "No se encontró el usuario."
        );
      }

      // Primero eliminamos el registro
      // de la tabla.
      const { error: deleteDbError } =
        await supabase
          .from("business_showcase")
          .delete()
          .eq("id", image.id)
          .eq("profile_id", user.id);

      if (deleteDbError) {
        throw deleteDbError;
      }

      // Después eliminamos el archivo
      // físico de Storage.
      const { error: deleteStorageError } =
        await supabase.storage
          .from("business-showcase")
          .remove([
            image.storage_path,
          ]);

      if (deleteStorageError) {
        console.error(
          "No se pudo eliminar el archivo de Storage:",
          deleteStorageError
        );
      }

      setShowcaseImages((previous) =>
        previous.filter(
          (item) => item.id !== image.id
        )
      );
    } catch (err: unknown) {
      console.error(
        "Error eliminando imagen:",
        err
      );

      setShowcaseError(
        err instanceof Error
          ? err.message
          : "No se pudo eliminar la imagen."
      );
    } finally {
      setDeletingShowcase(null);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm(
      "¿Seguro que querés eliminar esta publicación?"
    );

    if (!confirmed) return;

    setDeleting(id);
    setError("");

    const { error: deleteError } =
      await supabase
        .from("listings")
        .delete()
        .eq("id", id);

    if (deleteError) {
      console.error(
        "Error eliminando publicación:",
        deleteError
      );

      setError(
        "No se pudo eliminar la publicación."
      );

      setDeleting(null);
      return;
    }

    setListings((previous) =>
      previous.filter(
        (listing) => listing.id !== id
      )
    );

    setDeleting(null);
  }

  const activeListings = listings.filter(
    (listing) => !listing.sold
  );

  const activeCount =
    activeListings.length;

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "es-AR"
    ).format(price);
  }

  function getMainImage(
    listing: Listing
  ) {
    if (
      listing.images &&
      listing.images.length > 0
    ) {
      return listing.images[0];
    }

    return listing.image_url;
  }

  function getType(listing: Listing) {
    return listing.type === "Servicio"
      ? "SERVICIO"
      : "PRODUCTO";
  }

  function getShortDescription(
    description: string | null
  ) {
    if (!description) {
      return "Sin descripción";
    }

    if (description.length <= 75) {
      return description;
    }

    return (
      description.substring(0, 75) +
      "..."
    );
  }

  const showcaseCount =
    showcaseImages.length;

  const canAddShowcaseImages =
    showcaseCount <
    MAX_SHOWCASE_IMAGES;

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-24">
        <div className="max-w-6xl mx-auto px-4 py-8">

          {/* HEADER */}
          <div className="h-8 w-64 bg-[var(--color-subtle)] rounded-lg animate-pulse" />

          <div className="h-4 w-80 bg-[var(--color-subtle)] rounded-lg animate-pulse mt-3" />

          {/* VIDRIERA */}
          <div className="mt-10">
            <div className="h-6 w-32 bg-[var(--color-subtle)] rounded-lg animate-pulse mx-auto" />

            <div className="mt-5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <div className="p-8">
                <div className="h-14 w-14 rounded-2xl bg-[var(--color-subtle)] animate-pulse mx-auto" />

                <div className="h-5 w-48 bg-[var(--color-subtle)] rounded-lg animate-pulse mx-auto mt-5" />

                <div className="h-4 w-72 bg-[var(--color-subtle)] rounded-lg animate-pulse mx-auto mt-3" />

                <div className="h-10 w-52 bg-[var(--color-subtle)] rounded-xl animate-pulse mx-auto mt-6" />
              </div>
            </div>
          </div>

          {/* PUBLICACIONES */}
          <div className="mt-12">
            <div className="h-6 w-52 bg-[var(--color-subtle)] rounded-lg animate-pulse mx-auto" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden animate-pulse"
                >
                  <div className="aspect-[4/3] bg-[var(--color-subtle)]" />

                  <div className="p-4 space-y-3">
                    <div className="h-3 w-20 bg-[var(--color-subtle)] rounded" />
                    <div className="h-5 w-40 bg-[var(--color-subtle)] rounded" />
                    <div className="h-4 w-full bg-[var(--color-subtle)] rounded" />
                    <div className="h-6 w-28 bg-[var(--color-subtle)] rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-24">

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* =========================================
            HEADER
        ========================================= */}

        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
            Mi emprendimiento
          </h1>

          <p className="text-sm text-[var(--color-muted)] mt-2 sm:text-base">
            Administrá la vidriera y las publicaciones de tu emprendimiento.
          </p>
        </div>

        {/* =========================================
            VIDRIERA
        ========================================= */}

        <section className="mt-10">

          {/* TÍTULO */}

          <div className="mb-6 flex items-center gap-4">

            <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-[0.12em] sm:text-2xl">
                Vidriera
              </h2>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#B4232D]">
                Mostrá tu emprendimiento
              </p>
            </div>

            <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

          </div>

          {/* CONTENEDOR */}

          <div className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)]">

            <div className="p-5 sm:p-7">

              {/* CABECERA DE VIDRIERA */}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                <div>
                  <h3 className="text-lg font-bold">
                    Imágenes de tu emprendimiento
                  </h3>

                  <p className="mt-1 text-sm text-[var(--color-muted)]">
                    Agregá hasta {MAX_SHOWCASE_IMAGES} imágenes para mostrar tu negocio.
                  </p>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center rounded-full bg-[#B4232D]/10 px-3 py-1.5 text-xs font-black text-[#B4232D]">
                    {showcaseCount}/{MAX_SHOWCASE_IMAGES}
                  </span>
                </div>

              </div>

              {/* ERROR VIDRIERA */}

              {showcaseError && (
                <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                  <p className="text-sm text-red-500">
                    {showcaseError}
                  </p>
                </div>
              )}

              {/* IMÁGENES */}

              {loadingShowcase ? (

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="aspect-[4/3] rounded-2xl bg-[var(--color-subtle)] animate-pulse"
                    />
                  ))}
                </div>

              ) : (

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">

                  {showcaseImages.map(
                    (image, index) => (

                      <div
                        key={image.id}
                        className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-subtle)]"
                      >

                        <img
                          src={image.image_url}
                          alt={`Imagen ${index + 1} de la vidriera`}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        />

                        {/* NÚMERO */}

                        <div className="absolute left-3 top-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black/70 text-xs font-bold text-white backdrop-blur-sm">
                            {index + 1}
                          </span>
                        </div>

                        {/* ELIMINAR */}

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteShowcase(
                              image
                            )
                          }
                          disabled={
                            deletingShowcase ===
                            image.id
                          }
                          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-red-600 disabled:opacity-50"
                          aria-label="Eliminar imagen"
                        >
                          {deletingShowcase ===
                          image.id ? (
                            <span className="text-xs">
                              ...
                            </span>
                          ) : (
                            <Trash2
                              size={16}
                            />
                          )}
                        </button>

                      </div>

                    )
                  )}

                  {/* BOTÓN AGREGAR */}

                  {canAddShowcaseImages && (
                    <label
                      className={`group relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-border)] bg-[var(--color-subtle)] transition-colors hover:border-[#B4232D] hover:bg-[#B4232D]/5 ${
                        uploading
                          ? "pointer-events-none opacity-60"
                          : ""
                      }`}
                    >

                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={
                          handleShowcaseUpload
                        }
                        disabled={uploading}
                        className="hidden"
                      />

                      {uploading ? (
                        <>
                          <span className="text-3xl animate-pulse">
                            ⏳
                          </span>

                          <span className="mt-3 text-sm font-bold">
                            Subiendo...
                          </span>
                        </>
                      ) : (
                        <>
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#B4232D]/10 text-[#B4232D] transition-transform group-hover:scale-105">
                            <Upload
                              size={22}
                            />
                          </div>

                          <span className="mt-3 text-sm font-bold">
                            Agregar imagen
                          </span>

                          <span className="mt-1 text-xs text-[var(--color-muted)]">
                            {MAX_SHOWCASE_IMAGES -
                              showcaseCount}{" "}
                            disponible
                            {MAX_SHOWCASE_IMAGES -
                              showcaseCount !==
                            1
                              ? "s"
                              : ""}
                          </span>
                        </>
                      )}

                    </label>
                  )}

                  {/* ESTADO VACÍO */}

                  {showcaseImages.length === 0 &&
                    !uploading && (
                      <div className="sm:col-span-3 py-8 text-center">

                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#B4232D]/10">
                          <ImageIcon
                            size={26}
                            className="text-[#B4232D]"
                          />
                        </div>

                        <h4 className="mt-4 font-bold">
                          Tu vidriera está vacía
                        </h4>

                        <p className="mt-1 text-sm text-[var(--color-muted)]">
                          Agregá imágenes para mostrar cómo es tu emprendimiento.
                        </p>

                      </div>
                    )}

                </div>

              )}

              {/* LÍMITE ALCANZADO */}

              {showcaseCount >=
                MAX_SHOWCASE_IMAGES && (
                <div className="mt-4 rounded-xl bg-[var(--color-subtle)] px-4 py-3 text-center">
                  <p className="text-xs font-medium text-[var(--color-muted)]">
                    Alcanzaste el máximo de{" "}
                    {MAX_SHOWCASE_IMAGES} imágenes.
                  </p>
                </div>
              )}

            </div>

          </div>

        </section>

        {/* =========================================
            MIS PUBLICACIONES
        ========================================= */}

        <section className="mt-14">

          {/* TÍTULO */}

          <div className="mb-6 flex items-center gap-4">

            <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

            <div className="text-center">
              <h2 className="text-xl font-black uppercase tracking-[0.12em] sm:text-2xl">
                Mis publicaciones
              </h2>

              <p className="mt-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#B4232D]">
                Productos y servicios
              </p>
            </div>

            <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

          </div>

          {/* HEADER PUBLICACIONES */}

          <div className="flex items-center justify-between gap-4">

            <p className="text-sm text-[var(--color-muted)]">
              Administrá tus publicaciones.
            </p>

            <Link
              href="/sell"
              className="shrink-0 inline-flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 transition-colors"
            >
              + Publicar
            </Link>

          </div>

          {/* CONTADOR */}

          <div className="mt-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">

            <div className="flex items-center justify-between mb-2">

              <span className="text-sm font-semibold">
                Publicaciones activas
              </span>

              <span
                className={`text-sm font-bold ${
                  activeCount >= MAX_LISTINGS
                    ? "text-red-500"
                    : "text-[var(--color-text)]"
                }`}
              >
                {activeCount}/{MAX_LISTINGS}
              </span>

            </div>

            <div className="w-full h-2 bg-[var(--color-subtle)] rounded-full overflow-hidden">

              <div
                className={`h-full rounded-full transition-all ${
                  activeCount >= MAX_LISTINGS
                    ? "bg-red-600"
                    : "bg-red-500"
                }`}
                style={{
                  width: `${Math.min(
                    (activeCount /
                      MAX_LISTINGS) *
                      100,
                    100
                  )}%`,
                }}
              />

            </div>

            {activeCount >= MAX_LISTINGS && (
              <p className="text-xs text-red-500 mt-2">
                Alcanzaste el máximo de publicaciones activas.
              </p>
            )}

          </div>

          {/* ERROR */}

          {error && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
              <p className="text-sm text-red-500">
                {error}
              </p>
            </div>
          )}

          {/* SIN PUBLICACIONES */}

          {listings.length === 0 ? (

            <div className="mt-8 text-center border border-dashed border-[var(--color-border)] rounded-2xl p-10">

              <div className="text-4xl mb-3">
                📦
              </div>

              <h2 className="text-lg font-bold">
                Todavía no tenés publicaciones
              </h2>

              <p className="text-sm text-[var(--color-muted)] mt-2 max-w-sm mx-auto">
                Publicá un producto o servicio para que aparezca
                dentro de tu emprendimiento.
              </p>

              <Link
                href="/sell"
                className="inline-flex mt-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
              >
                Crear publicación
              </Link>

            </div>

          ) : (

            /* GRID DE PUBLICACIONES */

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">

              {listings.map((listing) => {

                const image =
                  getMainImage(listing);

                const type =
                  getType(listing);

                return (
                  <article
                    key={listing.id}
                    className={`group bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5 ${
                      listing.sold
                        ? "opacity-60"
                        : ""
                    }`}
                  >

                    {/* IMAGEN */}

                    <div className="relative aspect-[4/3] bg-[var(--color-subtle)] overflow-hidden">

                      {image ? (

                        <img
                          src={image}
                          alt={listing.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        />

                      ) : (

                        <div className="w-full h-full flex items-center justify-center text-[var(--color-muted)]">
                          <span className="text-4xl">
                            📷
                          </span>
                        </div>

                      )}

                      {/* TIPO */}

                      <div className="absolute top-3 left-3">

                        <span className="inline-flex items-center rounded-full bg-black/75 backdrop-blur-sm px-3 py-1 text-[10px] font-bold tracking-wide text-white">
                          {type}
                        </span>

                      </div>

                      {/* ESTADO */}

                      {listing.sold && (

                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">

                          <span className="bg-black/80 text-white px-4 py-2 rounded-xl text-sm font-bold">
                            INACTIVA
                          </span>

                        </div>

                      )}

                    </div>

                    {/* CONTENIDO */}

                    <div className="p-4">

                      {/* CATEGORÍA */}

                      {listing.category && (

                        <p className="text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wide mb-1">
                          {listing.category}
                        </p>

                      )}

                      {/* NOMBRE */}

                      <h2 className="font-bold text-lg leading-tight line-clamp-2">
                        {listing.title}
                      </h2>

                      {/* DESCRIPCIÓN */}

                      <p className="text-sm text-[var(--color-muted)] mt-2 line-clamp-2 min-h-[40px]">
                        {getShortDescription(
                          listing.description
                        )}
                      </p>

                      {/* PRECIO */}

                      <p className="text-xl font-extrabold mt-3">
                        ${formatPrice(
                          listing.price
                        )}
                      </p>

                      {/* ACCIONES */}

                      <div className="flex gap-2 mt-4">

                        <Link
                          href={`/sell?id=${listing.id}`}
                          className="flex-1 flex items-center justify-center rounded-xl border border-[var(--color-border)] hover:border-red-500 hover:text-red-500 font-semibold text-sm py-2.5 transition-colors"
                        >
                          Editar
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(
                              listing.id
                            )
                          }
                          disabled={
                            deleting ===
                            listing.id
                          }
                          className="w-11 flex items-center justify-center rounded-xl border border-[var(--color-border)] text-[var(--color-muted)] hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-50"
                          aria-label="Eliminar publicación"
                        >
                          {deleting ===
                          listing.id
                            ? "..."
                            : "🗑"}
                        </button>

                      </div>

                    </div>

                  </article>
                );
              })}

            </div>

          )}

        </section>

      </div>

      <BottomNav />

    </main>
  );
}