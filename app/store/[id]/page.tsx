"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  MessageCircle,
  Store,
  Clock,
  Truck,
  ExternalLink,
  Flag,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  business_name: string | null;
  cover_url: string | null;
  city: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  opening_hours: string | null;
  ships: boolean | null;
  has_physical_store: boolean | null;
  address: string | null;
  status: "activo" | "bloqueado";
};

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
  type: string | null;
};

type ShowcaseImage = {
  id: number;
  profile_id: string;
  image_url: string;
  storage_path: string;
  created_at: string;
};

const REPORT_REASONS = [
  "Posible estafa",
  "Información falsa o engañosa",
  "Contenido inapropiado",
  "El emprendimiento no corresponde",
  "Otro",
];

export default function StorePage() {
  const params = useParams();
  const storeId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [showcaseImages, setShowcaseImages] = useState<ShowcaseImage[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [showcaseIndex, setShowcaseIndex] = useState(0);

  // ============================================================
  // REPORTES
  // ============================================================

  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportRequiresAuth, setReportRequiresAuth] = useState(false);

  useEffect(() => {
    if (!storeId) return;

    fetchStore();
  }, [storeId]);

  async function fetchStore() {
    setLoading(true);

    /*
     * ============================================================
     * PERFIL
     * ============================================================
     */

    const {
      data: profileData,
      error: profileError,
    } = await supabase
      .from("profiles")
      .select(
        `
        id,
        username,
        avatar_url,
        bio,
        business_name,
        cover_url,
        city,
        whatsapp,
        instagram,
        facebook,
        opening_hours,
        ships,
        has_physical_store,
        address,
        status
      `
      )
      .eq("id", storeId)
      .single();

    if (profileError || !profileData) {
      console.error(
        "Error obteniendo emprendimiento:",
        profileError
      );

      setProfile(null);
      setLoading(false);

      return;
    }

    /*
     * ============================================================
     * EMPRENDIMIENTO BLOQUEADO
     *
     * IMPORTANTE:
     * Si el emprendimiento está bloqueado, no cargamos ninguna
     * publicación ni ninguna imagen de la vidriera.
     * ============================================================
     */

    if (profileData.status === "bloqueado") {
      setProfile(profileData as Profile);
      setListings([]);
      setShowcaseImages([]);
      setShowcaseIndex(0);
      setLoading(false);

      return;
    }

    /*
     * ============================================================
     * PUBLICACIONES
     * ============================================================
     */

    const {
      data: listingsData,
      error: listingsError,
    } = await supabase
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
        type
      `
      )
      .eq("seller_id", storeId)
      .eq("sold", false)
      .order("created_at", {
        ascending: false,
      })
      .limit(5);

    if (listingsError) {
      console.error(
        "Error obteniendo publicaciones:",
        listingsError
      );
    }

    /*
     * ============================================================
     * VIDRIERA
     * ============================================================
     */

    const {
      data: showcaseData,
      error: showcaseError,
    } = await supabase
      .from("business_showcase")
      .select(
        `
        id,
        profile_id,
        image_url,
        storage_path,
        created_at
      `
      )
      .eq("profile_id", storeId)
      .order("created_at", {
        ascending: true,
      })
      .limit(3);

    if (showcaseError) {
      console.error(
        "Error obteniendo imágenes de la vidriera:",
        showcaseError
      );
    }

    /*
     * ============================================================
     * GUARDAR DATOS
     * ============================================================
     */

    setProfile(profileData as Profile);

    setListings(
      (listingsData || []) as Listing[]
    );

    setShowcaseImages(
      (showcaseData || []) as ShowcaseImage[]
    );

    setShowcaseIndex(0);

    setLoading(false);
  }

  /*
   * ============================================================
   * IMAGEN DE PUBLICACIÓN
   * ============================================================
   */

  function getListingImage(listing: Listing) {
    if (
      listing.images &&
      listing.images.length > 0
    ) {
      return listing.images[0];
    }

    return listing.image_url;
  }

  /*
   * ============================================================
   * WHATSAPP
   * ============================================================
   */

  function getWhatsAppUrl(number: string) {
    const cleanNumber =
      number.replace(/\D/g, "");

    return `https://wa.me/${cleanNumber}`;
  }

  /*
   * ============================================================
   * CARRUSEL VIDRIERA
   * ============================================================
   */

  function previousShowcase() {
    setShowcaseIndex((current) =>
      current === 0
        ? showcaseImages.length - 1
        : current - 1
    );
  }

  function nextShowcase() {
    setShowcaseIndex((current) =>
      current === showcaseImages.length - 1
        ? 0
        : current + 1
    );
  }

  /*
   * ============================================================
   * REPORTAR EMPRENDIMIENTO
   * ============================================================
   */

  async function openReportModal() {
    setReportError("");
    setReportSuccess(false);
    setSelectedReason("");
    setReportDescription("");
    setReportRequiresAuth(false);

    const {
      data: sessionData,
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error(
        "Error obteniendo sesión:",
        sessionError
      );

      setReportError(
        "No pudimos verificar tu sesión. Intentá nuevamente."
      );

      setShowReportModal(true);

      return;
    }

    if (!sessionData.session?.user) {
      setReportRequiresAuth(true);
      setShowReportModal(true);

      return;
    }

    if (sessionData.session.user.id === storeId) {
      setReportError(
        "No podés reportar tu propio emprendimiento."
      );

      setShowReportModal(true);

      return;
    }

    setShowReportModal(true);
  }

  function closeReportModal() {
    if (reportLoading) return;

    setShowReportModal(false);
    setSelectedReason("");
    setReportDescription("");
    setReportError("");
    setReportSuccess(false);
    setReportRequiresAuth(false);
  }

  async function submitReport() {
    if (!profile) return;

    if (!selectedReason) {
      setReportError(
        "Seleccioná un motivo para realizar el reporte."
      );

      return;
    }

    if (reportDescription.trim().length > 1000) {
      setReportError(
        "La descripción no puede superar los 1000 caracteres."
      );

      return;
    }

    setReportLoading(true);
    setReportError("");

    try {
      const {
        data: userData,
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        if (
          userError.name ===
          "AuthSessionMissingError"
        ) {
          setReportRequiresAuth(true);
          setReportError("");
          setReportLoading(false);

          return;
        }

        throw userError;
      }

      const user = userData.user;

      if (!user) {
        setReportRequiresAuth(true);
        setReportError("");
        setReportLoading(false);

        return;
      }

      if (user.id === profile.id) {
        setReportError(
          "No podés reportar tu propio emprendimiento."
        );

        return;
      }

      const {
        data: existingReport,
        error: existingReportError,
      } = await supabase
        .from("reports")
        .select("id")
        .eq("reporter_id", user.id)
        .eq(
          "reported_profile_id",
          profile.id
        )
        .maybeSingle();

      if (existingReportError) {
        throw existingReportError;
      }

      if (existingReport) {
        setReportError(
          "Ya realizaste un reporte sobre este emprendimiento."
        );

        return;
      }

      const { error: insertError } =
        await supabase
          .from("reports")
          .insert({
            reporter_id: user.id,
            reported_profile_id: profile.id,
            reported_listing_id: null,
            reason: selectedReason,
            description:
              reportDescription.trim() || null,
            status: "pending",
          });

      if (insertError) {
        if (insertError.code === "23505") {
          setReportError(
            "Ya realizaste un reporte sobre este emprendimiento."
          );

          return;
        }

        throw insertError;
      }

      setReportSuccess(true);
    } catch (error) {
      console.error(
        "Error enviando reporte:",
        error
      );

      setReportError(
        "No pudimos enviar el reporte. Intentá nuevamente."
      );
    } finally {
      setReportLoading(false);
    }
  }

  /*
   * ============================================================
   * LOADING
   * ============================================================
   */

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">

        <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">

          <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 md:px-8">

            <div className="h-8 w-24 animate-pulse rounded-lg bg-[#171717]" />

            <div className="flex-1" />

            <div className="h-8 w-8 animate-pulse rounded-full bg-[#171717]" />

          </div>

        </nav>

        <main className="mx-auto max-w-[1200px] px-4 pb-24 md:px-8">

          <section className="pt-8 sm:pt-10">

            <div className="flex flex-col items-center text-center">

              <div className="h-28 w-28 animate-pulse rounded-full bg-[#171717] sm:h-32 sm:w-32" />

              <div className="mt-5 h-8 w-56 animate-pulse rounded-lg bg-[#171717]" />

              <div className="mt-3 h-4 w-24 animate-pulse rounded-lg bg-[#171717]" />

            </div>

          </section>

          <section className="mt-8 px-0 sm:px-4 md:px-8">

            <div className="relative rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-6 md:p-7">

              <div className="h-5 w-full max-w-2xl animate-pulse rounded-lg bg-[#222222]" />

              <div className="mt-5 flex flex-wrap gap-3">

                <div className="h-5 w-28 animate-pulse rounded-lg bg-[#222222]" />

                <div className="h-5 w-32 animate-pulse rounded-lg bg-[#222222]" />

                <div className="h-5 w-28 animate-pulse rounded-lg bg-[#222222]" />

              </div>

              <div className="mt-6 flex gap-2">

                <div className="h-10 w-32 animate-pulse rounded-xl bg-[#222222]" />

                <div className="h-10 w-10 animate-pulse rounded-xl bg-[#222222]" />

                <div className="h-10 w-10 animate-pulse rounded-xl bg-[#222222]" />

              </div>

            </div>

          </section>

          <section className="mt-14">

            <div className="flex items-center gap-4">

              <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

              <div className="h-8 w-32 animate-pulse rounded-lg bg-[#171717]" />

              <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

            </div>

            <div className="mt-5 aspect-[16/8] animate-pulse rounded-2xl bg-[#111111] sm:aspect-[16/7]" />

          </section>

          <section className="mt-14">

            <div className="flex items-center gap-4">

              <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

              <div className="h-8 w-48 animate-pulse rounded-lg bg-[#171717]" />

              <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">

              {Array.from({
                length: 5,
              }).map((_, index) => (

                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]"
                >

                  <div className="aspect-square animate-pulse bg-[#222222]" />

                  <div className="space-y-3 p-3">

                    <div className="h-4 animate-pulse rounded-lg bg-[#222222]" />

                    <div className="h-5 w-24 animate-pulse rounded-lg bg-[#222222]" />

                  </div>

                </div>

              ))}

            </div>

          </section>

        </main>

      </div>
    );
  }

  /*
   * ============================================================
   * EMPRENDIMIENTO NO ENCONTRADO
   * ============================================================
   */

  if (!profile) {
    return (
      <div className="min-h-screen bg-black text-white">

        <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">

          <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 md:px-8">

            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-white no-underline transition-colors hover:text-[#B4232D]"
            >
              <ArrowLeft size={18} />
              Volver
            </Link>

          </div>

        </nav>

        <main className="mx-auto max-w-[1200px] px-4 py-16 md:px-8">

          <div className="rounded-2xl border border-white/10 bg-[#0B0B0B] px-6 py-20 text-center">

            <Store
              size={42}
              className="mx-auto mb-5 text-[#B4232D]"
            />

            <h1 className="text-2xl font-black uppercase tracking-tight">
              Emprendimiento no encontrado
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm text-[#888888]">
              Esta tienda no existe o ya no está disponible.
            </p>

            <Link
              href="/"
              className="
                mt-7
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-[#B4232D]
                bg-[#B4232D]
                px-5
                py-3
                text-sm
                font-black
                uppercase
                tracking-wide
                text-white
                no-underline
                transition-all
                hover:bg-[#9F1F27]
              "
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>

          </div>

        </main>

      </div>
    );
  }

  /*
   * ============================================================
   * EMPRENDIMIENTO BLOQUEADO
   * ============================================================
   */

  if (profile.status === "bloqueado") {
    return (
      <div className="min-h-screen bg-black text-white">

        <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">

          <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 md:px-8">

            <Link
              href="/"
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-bold
                text-white
                no-underline
                transition-colors
                hover:text-[#B4232D]
              "
            >
              <ArrowLeft size={18} />
              Volver
            </Link>

          </div>

        </nav>

        <main className="mx-auto flex min-h-[calc(100vh-64px)] max-w-[1200px] items-center px-4 py-16 md:px-8">

          <div className="w-full rounded-2xl border border-white/10 bg-[#0B0B0B] px-6 py-20 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">

              <Store
                size={32}
                className="text-[#B4232D]"
              />

            </div>

            <h1 className="mt-6 text-2xl font-black uppercase tracking-tight sm:text-3xl">
              Emprendimiento no disponible
            </h1>

            <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#777777] sm:text-base">
              Este emprendimiento no se encuentra disponible actualmente.
            </p>

            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#555555]">
              Es posible que haya sido temporalmente deshabilitado por motivos de moderación.
            </p>

            <Link
              href="/"
              className="
                mt-8
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-[#B4232D]
                bg-[#B4232D]
                px-5
                py-3
                text-sm
                font-black
                uppercase
                tracking-wide
                text-white
                no-underline
                transition-all
                hover:bg-[#9F1F27]
              "
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </Link>

          </div>

        </main>

      </div>
    );
  }

  const businessName =
    profile.business_name?.trim() ||
    profile.username?.trim() ||
    "Emprendimiento";

  const currentShowcase =
    showcaseImages[showcaseIndex];

  /*
   * ============================================================
   * PÁGINA PÚBLICA
   * ============================================================
   */

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ========================================================= */}
      {/* HEADER */}
      {/* ========================================================= */}

      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 md:px-8">

          <Link
            href="/"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-bold
              text-white
              no-underline
              transition-colors
              hover:text-[#B4232D]
            "
          >
            <ArrowLeft size={18} />
            Volver
          </Link>

          <div className="flex-1 text-center">

            <span className="truncate text-sm font-black uppercase tracking-wide text-white">
              {businessName}
            </span>

          </div>

          <div className="w-16" />

        </div>

      </nav>

      <main className="mx-auto max-w-[1200px] px-4 pb-24 md:px-8">

        {/* ========================================================= */}
        {/* IDENTIDAD */}
        {/* ========================================================= */}

        <section className="pt-8 sm:pt-10 md:pt-12">

          <div className="flex flex-col items-center text-center">

            <div
              className="
                flex
                h-28
                w-28
                items-center
                justify-center
                overflow-hidden
                rounded-full
                border
                border-white/20
                bg-[#171717]
                sm:h-32
                sm:w-32
              "
            >

              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={`Logo de ${businessName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Store
                  size={46}
                  className="text-[#B4232D]"
                />
              )}

            </div>

            <h1
              className="
                mt-6
                max-w-3xl
                text-3xl
                font-black
                uppercase
                tracking-tight
                text-white
                sm:text-4xl
                md:text-5xl
              "
            >
              {businessName}
            </h1>

            {profile.username && (
              <span className="mt-2 text-sm font-bold text-[#777777]">
                @{profile.username.replace("@", "")}
              </span>
            )}

          </div>

        </section>

        {/* ========================================================= */}
        {/* INFORMACIÓN */}
        {/* ========================================================= */}

        <section className="mt-8 px-0 sm:px-4 md:px-8">

          <div
            className="
              relative
              rounded-2xl
              border
              border-white/10
              bg-[#111111]
              p-5
              text-white
              sm:p-6
              md:p-7
            "
          >

            <button
              type="button"
              onClick={openReportModal}
              aria-label="Reportar emprendimiento"
              title="Reportar emprendimiento"
              className="
                absolute
                right-4
                top-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                border
                border-white/10
                bg-white/[0.03]
                text-[#666666]
                transition-all
                hover:border-[#B4232D]
                hover:bg-[#B4232D]/10
                hover:text-[#B4232D]
                sm:right-5
                sm:top-5
              "
            >
              <Flag size={16} />
            </button>

            {profile.bio && (
              <p className="max-w-3xl pr-12 text-sm leading-6 text-[#B5B5B5] sm:text-base">
                {profile.bio}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-xs font-semibold text-[#999999]">

              {profile.city && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin
                    size={14}
                    className="text-[#B4232D]"
                  />
                  {profile.city}
                </span>
              )}

              {profile.has_physical_store &&
                profile.address && (
                  <span className="inline-flex items-center gap-1.5">
                    <Store
                      size={14}
                      className="text-[#B4232D]"
                    />
                    {profile.address}
                  </span>
                )}

              {profile.ships && (
                <span className="inline-flex items-center gap-1.5">
                  <Truck
                    size={14}
                    className="text-[#B4232D]"
                  />
                  Realiza envíos
                </span>
              )}

              {profile.opening_hours && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock
                    size={14}
                    className="text-[#B4232D]"
                  />
                  {profile.opening_hours}
                </span>
              )}

            </div>

            <div className="mt-6 flex flex-wrap gap-2">

              {profile.whatsapp && (
                <a
                  href={getWhatsAppUrl(
                    profile.whatsapp
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    border
                    border-[#B4232D]
                    bg-[#B4232D]
                    px-4
                    text-sm
                    font-black
                    uppercase
                    tracking-wide
                    text-white
                    no-underline
                    transition-all
                    hover:bg-[#9F1F27]
                  "
                >
                  <MessageCircle size={17} />
                  WhatsApp
                </a>
              )}

              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace(
                    "@",
                    ""
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/15
                    bg-[#181818]
                    text-xs
                    font-black
                    text-white
                    no-underline
                    transition-all
                    hover:border-[#B4232D]
                    hover:text-[#B4232D]
                  "
                >
                  IG
                </a>
              )}

              {profile.facebook && (
                <a
                  href={profile.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="
                    flex
                    h-10
                    w-10
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-white/15
                    bg-[#181818]
                    text-sm
                    font-black
                    text-white
                    no-underline
                    transition-all
                    hover:border-[#B4232D]
                    hover:text-[#B4232D]
                  "
                >
                  f
                </a>
              )}

            </div>

          </div>

        </section>

        {/* ========================================================= */}
        {/* VIDRIERA */}
        {/* ========================================================= */}

        {showcaseImages.length > 0 && (
          <section className="mt-14 sm:mt-16 md:mt-20">

            <div className="mb-6 flex items-center gap-4">

              <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

              <div className="text-center">

                <p className="mb-1 text-[10px] font-black uppercase tracking-[0.25em] text-[#B4232D]">
                  Conocé el emprendimiento
                </p>

                <h2 className="text-2xl font-black uppercase tracking-[0.12em] text-white sm:text-3xl">
                  Vidriera
                </h2>

              </div>

              <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

            </div>

            <div className="relative">

              <div
                className="
                  group
                  relative
                  aspect-[16/9]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/10
                  bg-[#111111]
                  sm:aspect-[16/8]
                  md:aspect-[16/7]
                "
              >

                <img
                  key={currentShowcase.id}
                  src={currentShowcase.image_url}
                  alt={`Imagen de la vidriera de ${businessName}`}
                  className="
                    h-full
                    w-full
                    object-cover
                    transition-all
                    duration-500
                  "
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 md:p-9">

                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B4232D]">
                    Vidriera
                  </p>

                  <h3 className="mt-1 max-w-xl text-xl font-black uppercase text-white sm:text-2xl md:text-3xl">
                    {businessName}
                  </h3>

                </div>

                {showcaseImages.length > 1 && (
                  <button
                    type="button"
                    onClick={previousShowcase}
                    aria-label="Imagen anterior"
                    className="
                      absolute
                      left-3
                      top-1/2
                      flex
                      h-10
                      w-10
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/30
                      bg-black/70
                      text-white
                      transition-all
                      hover:bg-[#B4232D]
                      sm:left-5
                    "
                  >
                    <ArrowLeft size={18} />
                  </button>
                )}

                {showcaseImages.length > 1 && (
                  <button
                    type="button"
                    onClick={nextShowcase}
                    aria-label="Imagen siguiente"
                    className="
                      absolute
                      right-3
                      top-1/2
                      flex
                      h-10
                      w-10
                      -translate-y-1/2
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-white/30
                      bg-black/70
                      text-white
                      transition-all
                      hover:bg-[#B4232D]
                      sm:right-5
                    "
                  >
                    <ArrowRight size={18} />
                  </button>
                )}

              </div>

              {showcaseImages.length > 1 && (
                <div className="mt-5 flex justify-center gap-2">

                  {showcaseImages.map(
                    (image, index) => (
                      <button
                        key={image.id}
                        type="button"
                        onClick={() =>
                          setShowcaseIndex(index)
                        }
                        aria-label={`Ir a imagen ${
                          index + 1
                        }`}
                        className={`
                          h-2
                          rounded-full
                          transition-all
                          ${
                            index ===
                            showcaseIndex
                              ? "w-8 bg-[#B4232D]"
                              : "w-2 bg-[#444444] hover:bg-[#777777]"
                          }
                        `}
                      />
                    )
                  )}

                </div>
              )}

            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* PUBLICACIONES */}
        {/* ========================================================= */}

        <section className="mb-8 mt-16 sm:mb-10 sm:mt-20">

          <div className="flex items-center gap-4">

            <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

            <h2 className="whitespace-nowrap text-xl font-black uppercase tracking-[0.16em] text-white sm:text-3xl">
              Publicaciones
            </h2>

            <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

          </div>

          <p className="mt-5 text-center text-sm text-[#888888] sm:text-base">
            Productos y servicios de {businessName}
          </p>

        </section>

        {/* ========================================================= */}
        {/* LISTADO DE PUBLICACIONES */}
        {/* ========================================================= */}

        {listings.length === 0 ? (

          <section className="rounded-2xl border border-white/10 bg-[#0B0B0B] py-20 text-center">

            <Store
              size={36}
              className="mx-auto mb-4 text-[#B4232D]"
            />

            <h3 className="text-lg font-black uppercase tracking-wide">
              Todavía no hay publicaciones
            </h3>

            <p className="mx-auto mt-2 max-w-md px-4 text-sm text-[#777777]">
              Este emprendimiento todavía no publicó productos o servicios.
            </p>

          </section>

        ) : (

          <section>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">

              {listings.map((listing) => {

                const image =
                  getListingImage(listing);

                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="
                      group
                      overflow-hidden
                      rounded-2xl
                      border
                      border-white/10
                      bg-[#111111]
                      text-white
                      no-underline
                      transition-all
                      duration-200
                      hover:border-[#B4232D]
                      hover:bg-[#151515]
                    "
                  >

                    <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-[#222222]">

                      {image ? (
                        <img
                          src={image}
                          alt={listing.title}
                          className="
                            h-full
                            w-full
                            object-cover
                            transition-transform
                            duration-300
                            group-hover:scale-105
                          "
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">

                          <Store
                            size={30}
                            className="text-[#777777]"
                          />

                        </div>
                      )}

                      {listing.category && (
                        <div className="absolute left-2 top-2 max-w-[calc(100%-16px)]">

                          <span className="inline-block rounded-md bg-black/80 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white backdrop-blur-sm">
                            {listing.category}
                          </span>

                        </div>
                      )}

                    </div>

                    <div className="p-3 sm:p-4">

                      <h3 className="line-clamp-2 min-h-[36px] text-xs font-black leading-4 text-white sm:min-h-[40px] sm:text-sm sm:leading-5">
                        {listing.title}
                      </h3>

                      <p className="mt-2 text-base font-black text-white sm:text-lg">
                        $
                        {Number(
                          listing.price
                        ).toLocaleString(
                          "es-AR"
                        )}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-2">

                        <span className="text-[9px] font-bold uppercase tracking-wide text-[#777777] sm:text-[10px]">
                          Ver publicación
                        </span>

                        <ExternalLink
                          size={13}
                          className="text-[#B4232D]"
                        />

                      </div>

                    </div>

                  </Link>
                );
              })}

            </div>

            <div className="mt-6 text-center">

              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#666666]">
                {listings.length}{" "}
                {listings.length === 1
                  ? "publicación disponible"
                  : "publicaciones disponibles"}
              </span>

            </div>

          </section>

        )}

      </main>

      {/* ========================================================= */}
      {/* MODAL REPORTAR */}
      {/* ========================================================= */}

      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 py-6 backdrop-blur-sm">

          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#111111] p-6 shadow-2xl sm:p-7">

            <button
              type="button"
              onClick={closeReportModal}
              disabled={reportLoading}
              aria-label="Cerrar"
              className="
                absolute
                right-4
                top-4
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-full
                text-white/40
                transition
                hover:bg-white/5
                hover:text-white
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <X size={20} />
            </button>

            {!reportSuccess ? (

              reportRequiresAuth ? (

                <div className="flex min-h-[330px] flex-col items-center justify-center px-2 py-8 text-center">

                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
                    <Flag size={32} />
                  </div>

                  <h2 className="mt-6 text-2xl font-black">
                    Necesitás estar registrado
                  </h2>

                  <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">
                    Para reportar un emprendimiento necesitás tener una cuenta en AppEmprendedores e iniciar sesión.
                  </p>

                  <button
                    type="button"
                    onClick={closeReportModal}
                    className="
                      mt-7
                      rounded-xl
                      bg-white
                      px-6
                      py-3
                      text-sm
                      font-bold
                      text-black
                      transition
                      hover:bg-white/90
                    "
                  >
                    Entendido
                  </button>

                </div>

              ) : (

                <>

                  <div className="pr-10">

                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
                      <Flag size={21} />
                    </div>

                    <h2 className="text-2xl font-black">
                      Reportar emprendimiento
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-white/50">
                      Ayudanos a mantener AppEmprendedores segura.
                      Seleccioná el motivo que mejor describe el problema.
                    </p>

                  </div>

                  <div className="mt-7">

                    <label className="text-sm font-bold text-white">
                      Motivo del reporte
                    </label>

                    <div className="mt-3 space-y-2">

                      {REPORT_REASONS.map(
                        (reason) => {

                          const selected =
                            selectedReason === reason;

                          return (
                            <button
                              key={reason}
                              type="button"
                              onClick={() =>
                                setSelectedReason(
                                  reason
                                )
                              }
                              disabled={
                                reportLoading
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
                                font-semibold
                                transition
                                ${
                                  selected
                                    ? "border-red-500/50 bg-red-500/10 text-white"
                                    : "border-white/10 bg-white/[0.02] text-white/70 hover:bg-white/5"
                                }
                              `}
                            >

                              <span
                                className={`
                                  flex
                                  h-5
                                  w-5
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border
                                  ${
                                    selected
                                      ? "border-red-500"
                                      : "border-white/20"
                                  }
                                `}
                              >
                                {selected && (
                                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                )}
                              </span>

                              {reason}

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                  <div className="mt-6">

                    <div className="flex items-center justify-between gap-3">

                      <label
                        htmlFor="report-description"
                        className="text-sm font-bold text-white"
                      >
                        Descripción{" "}
                        <span className="font-normal text-white/35">
                          (opcional)
                        </span>
                      </label>

                      <span className="text-xs text-white/30">
                        {reportDescription.length}/1000
                      </span>

                    </div>

                    <textarea
                      id="report-description"
                      value={reportDescription}
                      onChange={(event) =>
                        setReportDescription(
                          event.target.value.slice(
                            0,
                            1000
                          )
                        )
                      }
                      disabled={reportLoading}
                      placeholder="Contanos brevemente qué sucede..."
                      rows={4}
                      maxLength={1000}
                      className="
                        mt-3
                        w-full
                        resize-none
                        rounded-xl
                        border
                        border-white/10
                        bg-black/30
                        px-4
                        py-3
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/25
                        focus:border-red-500/50
                      "
                    />

                  </div>

                  {reportError && (
                    <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-medium leading-6 text-red-300">
                      {reportError}
                    </div>
                  )}

                  <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      onClick={closeReportModal}
                      disabled={reportLoading}
                      className="
                        rounded-xl
                        border
                        border-white/10
                        bg-white/5
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-white/70
                        transition
                        hover:bg-white/10
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
                      disabled={reportLoading}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-red-600
                        px-5
                        py-3
                        text-sm
                        font-bold
                        text-white
                        transition
                        hover:bg-red-500
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >
                      {reportLoading ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Flag size={17} />
                          Enviar reporte
                        </>
                      )}
                    </button>

                  </div>

                </>

              )

            ) : (

              <div className="flex min-h-[330px] flex-col items-center justify-center px-2 py-8 text-center">

                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-500">
                  <CheckCircle2 size={36} />
                </div>

                <h2 className="mt-6 text-2xl font-black">
                  Reporte enviado
                </h2>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/50">
                  Gracias por ayudarnos a mantener
                  AppEmprendedores segura. Nuestro equipo podrá
                  revisar el reporte.
                </p>

                <button
                  type="button"
                  onClick={closeReportModal}
                  className="
                    mt-7
                    rounded-xl
                    bg-white
                    px-6
                    py-3
                    text-sm
                    font-bold
                    text-black
                    transition
                    hover:bg-white/90
                  "
                >
                  Cerrar
                </button>

              </div>

            )}

          </div>

        </div>
      )}

    </div>
  );
}
