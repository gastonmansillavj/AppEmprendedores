"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Store,
  ChevronLeft,
  ChevronRight,
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

export default function ListingPage() {
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    if (!listingId) return;

    fetchListing();
  }, [listingId]);

  async function fetchListing() {
    setLoading(true);

    const { data: listingData, error: listingError } =
      await supabase
        .from("listings")
        .select(`
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
        `)
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
        .select(`
          id,
          username,
          avatar_url,
          business_name,
          whatsapp,
          city
        `)
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

  function getWhatsAppUrl(number: string) {
    const cleanNumber =
      number.replace(/\D/g, "");

    const message = encodeURIComponent(
      `Hola, me interesa "${listing?.title}".`
    );

    return `https://wa.me/${cleanNumber}?text=${message}`;
  }

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "es-AR"
    ).format(price);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

        <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">

          <div className="h-6 w-36 rounded bg-[var(--color-subtle)] animate-pulse mb-8" />

          <div className="grid md:grid-cols-2 gap-8">

            <div className="aspect-square rounded-3xl bg-[var(--color-subtle)] animate-pulse" />

            <div className="space-y-5">

              <div className="h-4 w-24 rounded bg-[var(--color-subtle)] animate-pulse" />

              <div className="h-10 w-3/4 rounded bg-[var(--color-subtle)] animate-pulse" />

              <div className="h-8 w-40 rounded bg-[var(--color-subtle)] animate-pulse" />

              <div className="h-28 w-full rounded bg-[var(--color-subtle)] animate-pulse" />

            </div>

          </div>

        </main>

      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

        <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-10">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-muted)] hover:text-red-500 no-underline"
          >
            <ArrowLeft size={17} />
            Volver
          </Link>

          <div className="text-center py-24">

            <Store
              size={42}
              className="mx-auto text-[var(--color-muted)] mb-4"
            />

            <h1 className="text-2xl font-black">
              Publicación no encontrada
            </h1>

            <p className="text-sm text-[var(--color-muted)] mt-2">
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

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

      {/* HEADER */}

      <nav className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center">

          <Link
            href={`/store/${listing.seller_id}`}
            className="inline-flex items-center gap-2 text-white no-underline"
          >
            <ArrowLeft size={18} />

            <span className="font-semibold text-sm">
              Volver al emprendimiento
            </span>
          </Link>

        </div>

      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 pb-24">

        {/* CONTENIDO PRINCIPAL */}

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* ========================= */}
          {/* GALERÍA */}
          {/* ========================= */}

          <div>

            <div className="relative aspect-square rounded-3xl overflow-hidden bg-[var(--color-subtle)] border border-[var(--color-border)]">

              {currentImage ? (
                <img
                  src={currentImage}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store
                    size={50}
                    className="text-[var(--color-muted)]"
                  />
                </div>
              )}

              {/* FAVORITO */}

              <button
                type="button"
                aria-label="Agregar a favoritos"
                className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-600 transition-colors"
              >
                <Heart size={20} />
              </button>

              {/* FLECHA ANTERIOR */}

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    aria-label="Imagen anterior"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronLeft size={21} />
                  </button>

                  {/* FLECHA SIGUIENTE */}

                  <button
                    type="button"
                    onClick={nextImage}
                    aria-label="Imagen siguiente"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <ChevronRight size={21} />
                  </button>

                  {/* CONTADOR */}

                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    {selectedImage + 1}/{images.length}
                  </div>
                </>
              )}

            </div>

            {/* MINIATURAS */}

            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">

                {images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() =>
                      setSelectedImage(index)
                    }
                    className={`relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                      selectedImage === index
                        ? "border-red-600"
                        : "border-[var(--color-border)]"
                    }`}
                  >

                    <img
                      src={image}
                      alt={`${listing.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                  </button>
                ))}

              </div>
            )}

          </div>

          {/* ========================= */}
          {/* INFORMACIÓN */}
          {/* ========================= */}

          <div className="flex flex-col">

            {/* TIPO */}

            <span className="text-xs font-bold uppercase tracking-wider text-red-600">
              {isService
                ? "Servicio"
                : "Producto"}
            </span>

            {/* TÍTULO */}

            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-2">
              {listing.title}
            </h1>

            {/* PRECIO */}

            <p className="text-3xl font-black mt-5">
              ${formatPrice(listing.price)}
            </p>

            {/* CATEGORÍA */}

            {listing.category && (
              <p className="text-sm text-[var(--color-muted)] mt-2">
                {listing.category}
              </p>
            )}

            {/* DESCRIPCIÓN */}

            {listing.description && (
              <div className="mt-8">

                <h2 className="font-bold text-lg">
                  Descripción
                </h2>

                <p className="text-sm text-[var(--color-muted)] mt-2 leading-6 whitespace-pre-line">
                  {listing.description}
                </p>

              </div>
            )}

            {/* PUBLICACIÓN NO DISPONIBLE */}

            {listing.sold && (
              <div className="mt-8 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3">

                <p className="text-sm font-semibold text-red-500">
                  Esta publicación ya no está disponible.
                </p>

              </div>
            )}

            {/* ========================= */}
            {/* EMPRENDIMIENTO */}
            {/* ========================= */}

            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">

              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                {isService
                  ? "Ofrecido por"
                  : "Publicado por"}
              </p>

              <Link
                href={`/store/${listing.seller_id}`}
                className="flex items-center gap-3 mt-4 no-underline group"
              >

                <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-[var(--color-border)] flex items-center justify-center shrink-0">

                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store
                      size={24}
                      className="text-red-600"
                    />
                  )}

                </div>

                <div className="min-w-0">

                  <p className="font-bold group-hover:text-red-600 transition-colors truncate">
                    {businessName}
                  </p>

                  {profile?.city && (
                    <p className="text-xs text-[var(--color-muted)]">
                      📍 {profile.city}
                    </p>
                  )}

                  <p className="text-xs text-red-600 mt-0.5">
                    Ver emprendimiento →
                  </p>

                </div>

              </Link>

            </div>

            {/* ========================= */}
            {/* WHATSAPP */}
            {/* ========================= */}

            {profile?.whatsapp && !listing.sold && (
              <a
                href={getWhatsAppUrl(
                  profile.whatsapp
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 h-13 min-h-12 rounded-xl bg-red-600 text-white flex items-center justify-center gap-2 font-bold text-sm hover:bg-red-500 transition-colors no-underline"
              >
                <MessageCircle size={18} />

                {isService
                  ? "Consultar servicio"
                  : "Consultar por WhatsApp"}
              </a>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}