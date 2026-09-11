"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Store,
  ChevronLeft,
  ChevronRight,
  Flag,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Listing = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  images: string[] | null;
  created_at: string;
  sold: boolean;
  seller_id: string;
  type: string | null;
};

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  business_name: string | null;
  whatsapp: string | null;
  city: string | null;
};

const REPORT_REASONS = [
  "Posible estafa",
  "Información falsa o engañosa",
  "Contenido inapropiado",
  "El producto o servicio no corresponde",
  "Otro",
];

export default function ListingPage() {
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);

  // ============================================================
  // REPORTES
  // ============================================================

  const [showReportModal, setShowReportModal] =
    useState(false);

  const [selectedReason, setSelectedReason] =
    useState("");

  const [reportDescription, setReportDescription] =
    useState("");

  const [reportLoading, setReportLoading] =
    useState(false);

  const [reportSuccess, setReportSuccess] =
    useState(false);

  const [reportError, setReportError] =
    useState("");

  // ============================================================
  // CARGAR PUBLICACIÓN
  // ============================================================

  useEffect(() => {
    if (!listingId) return;

    fetchListing();
  }, [listingId]);

  async function fetchListing() {
    setLoading(true);

    const { data: listingData, error: listingError } =
      await supabase
        .from("listings")
        .select(
          `
          id,
          title,
          description,
          price,
          category,
          image_url,
          images,
          created_at,
          sold,
          seller_id,
          type
        `
        )
        .eq("id", listingId)
        .single();

    if (listingError || !listingData) {
      console.error(
        "Error obteniendo publicación:",
        listingError
      );

      setListing(null);
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } =
      await supabase
        .from("profiles")
        .select(
          `
          id,
          username,
          avatar_url,
          business_name,
          whatsapp,
          city
        `
        )
        .eq("id", listingData.seller_id)
        .single();

    if (profileError) {
      console.error(
        "Error obteniendo emprendimiento:",
        profileError
      );
    }

    setListing(listingData as Listing);
    setProfile(profileData as Profile);

    setSelectedImage(0);

    setLoading(false);
  }

  // ============================================================
  // IMÁGENES
  // ============================================================

  function getImages() {
    if (!listing) return [];

    const gallery: string[] = [];

    if (
      listing.images &&
      listing.images.length > 0
    ) {
      gallery.push(...listing.images);
    }

    if (
      listing.image_url &&
      !gallery.includes(listing.image_url)
    ) {
      gallery.unshift(listing.image_url);
    }

    return gallery;
  }

  function nextImage() {
    const images = getImages();

    if (images.length <= 1) return;

    setSelectedImage((current) =>
      current >= images.length - 1
        ? 0
        : current + 1
    );
  }

  function previousImage() {
    const images = getImages();

    if (images.length <= 1) return;

    setSelectedImage((current) =>
      current <= 0
        ? images.length - 1
        : current - 1
    );
  }

  // ============================================================
  // WHATSAPP
  // ============================================================

  function getWhatsAppUrl(number: string) {
    const cleanNumber =
      number.replace(/\D/g, "");

    const message = encodeURIComponent(
      `Hola, me interesa "${listing?.title}".`
    );

    return `https://wa.me/${cleanNumber}?text=${message}`;
  }

  // ============================================================
  // PRECIO
  // ============================================================

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "es-AR"
    ).format(price);
  }

  // ============================================================
  // ABRIR MODAL DE REPORTE
  // ============================================================

  function openReportModal() {
    setSelectedReason("");
    setReportDescription("");
    setReportError("");
    setReportSuccess(false);
    setShowReportModal(true);
  }

  // ============================================================
  // CERRAR MODAL
  // ============================================================

  function closeReportModal() {
    if (reportLoading) return;

    setShowReportModal(false);
    setSelectedReason("");
    setReportDescription("");
    setReportError("");
    setReportSuccess(false);
  }

  // ============================================================
  // ENVIAR REPORTE
  // ============================================================

  async function submitReport() {
    if (!listing) return;

    setReportError("");

    // ----------------------------------------------------------
    // Validar motivo
    // ----------------------------------------------------------

    if (!selectedReason) {
      setReportError(
        "Seleccioná un motivo para realizar el reporte."
      );

      return;
    }

    // ----------------------------------------------------------
    // Obtener usuario actual
    // ----------------------------------------------------------

    setReportLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setReportError(
        "Tenés que iniciar sesión para reportar una publicación."
      );

      setReportLoading(false);

      return;
    }

    // ----------------------------------------------------------
    // Evitar autorreporte
    // ----------------------------------------------------------

    if (user.id === listing.seller_id) {
      setReportError(
        "No podés reportar tu propia publicación."
      );

      setReportLoading(false);

      return;
    }

    // ----------------------------------------------------------
    // Verificar si ya reportó esta publicación
    // ----------------------------------------------------------

    const {
      data: existingReport,
      error: existingReportError,
    } = await supabase
      .from("reports")
      .select("id")
      .eq("reporter_id", user.id)
      .eq("reported_listing_id", listing.id)
      .maybeSingle();

    if (existingReportError) {
      console.error(
        "Error verificando reporte existente:",
        existingReportError
      );

      setReportError(
        "No pudimos comprobar el reporte. Intentá nuevamente."
      );

      setReportLoading(false);

      return;
    }

    if (existingReport) {
      setReportError(
        "Ya reportaste esta publicación anteriormente."
      );

      setReportLoading(false);

      return;
    }

    // ----------------------------------------------------------
    // Crear reporte
    // ----------------------------------------------------------

    const { error: insertError } =
      await supabase
        .from("reports")
        .insert({
          reporter_id: user.id,
          reported_listing_id: listing.id,
          reported_profile_id: null,
          reason: selectedReason,
          description:
            reportDescription.trim() || null,
          status: "pending",
        });

    if (insertError) {
      console.error(
        "Error creando reporte:",
        insertError
      );

      // --------------------------------------------------------
      // Por si la base detecta que ya existe
      // --------------------------------------------------------

      if (
        insertError.code === "23505"
      ) {
        setReportError(
          "Ya reportaste esta publicación anteriormente."
        );
      } else {
        setReportError(
          "No pudimos enviar el reporte. Intentá nuevamente."
        );
      }

      setReportLoading(false);

      return;
    }

    // ----------------------------------------------------------
    // ÉXITO
    // ----------------------------------------------------------

    setReportSuccess(true);
    setReportLoading(false);
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <main className="mx-auto max-w-[1200px] px-4 py-8 md:px-8">
          <div className="mb-8 h-6 w-36 animate-pulse rounded bg-[var(--color-subtle)]" />

          <div className="grid gap-8 md:grid-cols-2">
            <div className="aspect-square animate-pulse rounded-3xl bg-[var(--color-subtle)]" />

            <div className="space-y-5">
              <div className="h-4 w-24 animate-pulse rounded bg-[var(--color-subtle)]" />

              <div className="h-10 w-3/4 animate-pulse rounded bg-[var(--color-subtle)]" />

              <div className="h-8 w-40 animate-pulse rounded bg-[var(--color-subtle)]" />

              <div className="h-28 w-full animate-pulse rounded bg-[var(--color-subtle)]" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ============================================================
  // PUBLICACIÓN NO ENCONTRADA
  // ============================================================

  if (!listing) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <main className="mx-auto max-w-[1200px] px-4 py-10 md:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] no-underline hover:text-red-500"
          >
            <ArrowLeft size={17} />
            Volver
          </Link>

          <div className="py-24 text-center">
            <Store
              size={42}
              className="mx-auto mb-4 text-[var(--color-muted)]"
            />

            <h1 className="text-2xl font-black">
              Publicación no encontrada
            </h1>

            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Esta publicación no existe o ya no está disponible.
            </p>
          </div>
        </main>
      </div>
    );
  }

  const images = getImages();

  const currentImage =
    images[selectedImage] || null;

  const businessName =
    profile?.business_name?.trim() ||
    profile?.username?.trim() ||
    "Emprendimiento";

  const isService =
    listing.type === "Servicio";

  // ============================================================
  // PÁGINA
  // ============================================================

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

      {/* ====================================================== */}
      {/* HEADER */}
      {/* ====================================================== */}

      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 md:px-8">

          <Link
            href={`/store/${listing.seller_id}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-white no-underline"
          >
            <ArrowLeft size={18} />

            <span>
              Volver al emprendimiento
            </span>
          </Link>

        </div>
      </nav>

      {/* ====================================================== */}
      {/* CONTENIDO */}
      {/* ====================================================== */}

      <main className="mx-auto max-w-[1200px] px-4 py-8 pb-24 md:px-8">

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12">

          {/* ================================================== */}
          {/* GALERÍA */}
          {/* ================================================== */}

          <div>

            <div className="relative aspect-square overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-subtle)]">

              {currentImage ? (
                <img
                  src={currentImage}
                  alt={listing.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Store
                    size={50}
                    className="text-[var(--color-muted)]"
                  />
                </div>
              )}

              {/* FLECHAS */}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Imagen anterior"
                    className="absolute left-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  >
                    <ChevronLeft size={21} />
                  </button>

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Imagen siguiente"
                    className="absolute right-4 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
                  >
                    <ChevronRight size={21} />
                  </button>

                  <div className="absolute bottom-4 right-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {selectedImage + 1}/{images.length}
                  </div>
                </>
              )}

            </div>

            {/* MINIATURAS */}

            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">

                {images.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setSelectedImage(index)
                      }
                      className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                        selectedImage === index
                          ? "border-red-600"
                          : "border-[var(--color-border)]"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${listing.title} ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  )
                )}

              </div>
            )}

          </div>

          {/* ================================================== */}
          {/* INFORMACIÓN */}
          {/* ================================================== */}

          <div className="flex flex-col">

            {/* TIPO */}

            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              {isService
                ? "Servicio"
                : "Producto"}
            </span>

            {/* TÍTULO */}

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              {listing.title}
            </h1>

            {/* PRECIO */}

            <p className="mt-5 text-3xl font-black">
              ${formatPrice(listing.price)}
            </p>

            {/* CATEGORÍA */}

            {listing.category && (
              <p className="mt-2 text-sm text-[var(--color-muted)]">
                {listing.category}
              </p>
            )}

            {/* DESCRIPCIÓN */}

            {listing.description && (
              <div className="mt-8">
                <h2 className="text-lg font-bold">
                  Descripción
                </h2>

                <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--color-muted)]">
                  {listing.description}
                </p>
              </div>
            )}

            {/* NO DISPONIBLE */}

            {listing.sold && (
              <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">
                <p className="text-sm font-semibold text-red-500">
                  Esta publicación ya no está disponible.
                </p>
              </div>
            )}

            {/* ================================================== */}
            {/* EMPRENDIMIENTO */}
            {/* ================================================== */}

            <div className="mt-8 border-t border-[var(--color-border)] pt-6">

              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                {isService
                  ? "Ofrecido por"
                  : "Publicado por"}
              </p>

              <Link
                href={`/store/${listing.seller_id}`}
                className="group mt-4 flex items-center gap-3 no-underline"
              >

                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-white">

                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={businessName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Store
                      size={24}
                      className="text-red-600"
                    />
                  )}

                </div>

                <div className="min-w-0">

                  <p className="truncate font-bold transition-colors group-hover:text-red-600">
                    {businessName}
                  </p>

                  {profile?.city && (
                    <p className="text-xs text-[var(--color-muted)]">
                      📍 {profile.city}
                    </p>
                  )}

                  <p className="mt-0.5 text-xs text-red-600">
                    Ver emprendimiento →
                  </p>

                </div>

              </Link>

            </div>

            {/* ================================================== */}
            {/* WHATSAPP */}
            {/* ================================================== */}

            {profile?.whatsapp &&
              !listing.sold && (
                <a
                  href={getWhatsAppUrl(
                    profile.whatsapp
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 flex min-h-12 h-13 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-bold text-white no-underline transition-colors hover:bg-red-500"
                >
                  <MessageCircle size={18} />

                  {isService
                    ? "Consultar servicio"
                    : "Consultar por WhatsApp"}
                </a>
              )}

            {/* ================================================== */}
            {/* REPORTAR */}
            {/* ================================================== */}

            <div className="mt-6 border-t border-[var(--color-border)] pt-5">

              <button
                type="button"
                onClick={openReportModal}
                className="
                  inline-flex
                  items-center
                  gap-2
                  text-xs
                  font-semibold
                  text-[var(--color-muted)]
                  transition-colors
                  hover:text-red-500
                "
              >
                <Flag size={15} />

                Reportar publicación
              </button>

            </div>

          </div>

        </div>

      </main>

      {/* ====================================================== */}
      {/* MODAL DE REPORTE */}
      {/* ====================================================== */}

      {showReportModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !reportLoading
            ) {
              closeReportModal();
            }
          }}
        >

          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#111111] shadow-2xl">

            {/* HEADER MODAL */}

            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-600/10 text-red-500">
                  <Flag size={17} />
                </div>

                <div>
                  <h2 className="text-base font-black text-white">
                    Reportar publicación
                  </h2>

                  <p className="text-xs text-[#777777]">
                    Ayudanos a mantener segura la comunidad
                  </p>
                </div>

              </div>

              <button
                type="button"
                onClick={closeReportModal}
                disabled={reportLoading}
                aria-label="Cerrar"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#777777] transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>

            </div>

            {/* CONTENIDO */}

            {reportSuccess ? (
              <div className="px-5 py-10 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle2 size={30} />
                </div>

                <h3 className="mt-5 text-lg font-black text-white">
                  Reporte enviado
                </h3>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#888888]">
                  Gracias por ayudarnos a mantener
                  AppEmprendedores segura. Vamos a
                  revisar el reporte.
                </p>

                <button
                  type="button"
                  onClick={closeReportModal}
                  className="mt-7 rounded-xl bg-red-600 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-red-500"
                >
                  Cerrar
                </button>

              </div>
            ) : (
              <div className="px-5 py-5">

                {/* MOTIVO */}

                <div>

                  <label className="text-xs font-black uppercase tracking-wide text-white">
                    Motivo del reporte
                  </label>

                  <div className="mt-3 space-y-2">

                    {REPORT_REASONS.map(
                      (reason) => (
                        <button
                          key={reason}
                          type="button"
                          onClick={() =>
                            setSelectedReason(
                              reason
                            )
                          }
                          className={`
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            border
                            px-4
                            py-3
                            text-left
                            text-sm
                            transition-all
                            ${
                              selectedReason ===
                              reason
                                ? "border-red-600 bg-red-600/10 text-white"
                                : "border-white/10 bg-[#181818] text-[#AAAAAA] hover:border-white/20 hover:text-white"
                            }
                          `}
                        >

                          <span
                            className={`
                              flex
                              h-4
                              w-4
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              ${
                                selectedReason ===
                                reason
                                  ? "border-red-600"
                                  : "border-[#555555]"
                              }
                            `}
                          >
                            {selectedReason ===
                              reason && (
                              <span className="h-2 w-2 rounded-full bg-red-600" />
                            )}
                          </span>

                          {reason}

                        </button>
                      )
                    )}

                  </div>

                </div>

                {/* DESCRIPCIÓN */}

                <div className="mt-5">

                  <label
                    htmlFor="report-description"
                    className="text-xs font-black uppercase tracking-wide text-white"
                  >
                    Información adicional
                    <span className="ml-1 font-normal text-[#666666]">
                      (opcional)
                    </span>
                  </label>

                  <textarea
                    id="report-description"
                    value={reportDescription}
                    onChange={(event) =>
                      setReportDescription(
                        event.target.value
                      )
                    }
                    maxLength={1000}
                    rows={4}
                    placeholder="Contanos brevemente qué sucede..."
                    className="
                      mt-3
                      w-full
                      resize-none
                      rounded-xl
                      border
                      border-white/10
                      bg-[#181818]
                      px-4
                      py-3
                      text-sm
                      text-white
                      outline-none
                      placeholder:text-[#555555]
                      focus:border-red-600
                    "
                  />

                  <div className="mt-1 text-right text-[10px] text-[#555555]">
                    {reportDescription.length}/1000
                  </div>

                </div>

                {/* ERROR */}

                {reportError && (
                  <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">

                    <p className="text-xs font-semibold leading-5 text-red-400">
                      {reportError}
                    </p>

                  </div>
                )}

                {/* BOTONES */}

                <div className="mt-5 flex gap-2">

                  <button
                    type="button"
                    onClick={closeReportModal}
                    disabled={reportLoading}
                    className="
                      flex-1
                      rounded-xl
                      border
                      border-white/10
                      bg-[#181818]
                      px-4
                      py-3
                      text-sm
                      font-bold
                      text-[#AAAAAA]
                      transition-colors
                      hover:bg-[#222222]
                      hover:text-white
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    Cancelar
                  </button>

                  <button
                    type="button"
                    onClick={submitReport}
                    disabled={
                      reportLoading ||
                      !selectedReason
                    }
                    className="
                      flex
                      flex-1
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      bg-red-600
                      px-4
                      py-3
                      text-sm
                      font-black
                      text-white
                      transition-colors
                      hover:bg-red-500
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >

                    {reportLoading ? (
                      <>
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />

                        Enviando...
                      </>
                    ) : (
                      "Enviar reporte"
                    )}

                  </button>

                </div>

              </div>
            )}

          </div>

        </div>
      )}

    </div>
  );
}