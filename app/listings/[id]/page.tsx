"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Store,
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
};

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  business_name: string | null;
  whatsapp: string | null;
};

export default function ListingPage() {
  const params = useParams();
  const listingId = params.id as string;

  const [listing, setListing] = useState<Listing | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!listingId) return;

    fetchListing();
  }, [listingId]);

  async function fetchListing() {
    setLoading(true);

    const { data: listingData, error: listingError } = await supabase
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
        seller_id
      `)
      .eq("id", listingId)
      .single();

    if (listingError || !listingData) {
      console.error("Error obteniendo publicación:", listingError);
      setListing(null);
      setLoading(false);
      return;
    }

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        avatar_url,
        business_name,
        whatsapp
      `)
      .eq("id", listingData.seller_id)
      .single();

    if (profileError) {
      console.error("Error obteniendo emprendimiento:", profileError);
    }

    setListing(listingData as Listing);
    setProfile(profileData as Profile);
    setLoading(false);
  }

  function getListingImage() {
    if (!listing) return null;

    if (listing.images && listing.images.length > 0) {
      return listing.images[0];
    }

    return listing.image_url;
  }

  function getWhatsAppUrl(number: string) {
    const cleanNumber = number.replace(/\D/g, "");

    const message = encodeURIComponent(
      `Hola, me interesa "${listing?.title}".`
    );

    return `https://wa.me/${cleanNumber}?text=${message}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8">

          <div className="h-10 w-28 rounded-xl bg-[var(--color-subtle)] animate-pulse mb-8" />

          <div className="grid md:grid-cols-2 gap-8">

            <div className="aspect-square rounded-3xl bg-[var(--color-subtle)] animate-pulse" />

            <div>
              <div className="h-8 w-3/4 rounded bg-[var(--color-subtle)] animate-pulse" />

              <div className="h-6 w-32 rounded bg-[var(--color-subtle)] animate-pulse mt-5" />

              <div className="h-24 w-full rounded bg-[var(--color-subtle)] animate-pulse mt-8" />
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

  const businessName =
    profile?.business_name?.trim() ||
    profile?.username?.trim() ||
    "Emprendimiento";

  const image = getListingImage();

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
              Volver a la tienda
            </span>
          </Link>

        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 pb-24">

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* IMAGEN */}

          <div className="relative">

            <div className="aspect-square rounded-3xl overflow-hidden bg-[var(--color-subtle)] border border-[var(--color-border)]">

              {image ? (
                <img
                  src={image}
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

            </div>

            <button
              type="button"
              aria-label="Agregar a favoritos"
              className="absolute top-4 right-4 w-11 h-11 rounded-full bg-black/60 backdrop-blur-sm text-white flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Heart size={20} />
            </button>

          </div>

          {/* INFORMACIÓN */}

          <div className="flex flex-col">

            {listing.category && (
              <span className="text-xs font-bold uppercase tracking-wider text-red-600">
                {listing.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-2">
              {listing.title}
            </h1>

            <p className="text-3xl font-black mt-5">
              ${Number(listing.price).toLocaleString("es-AR")}
            </p>

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

            {/* EMPRENDIMIENTO */}

            <div className="mt-8 pt-6 border-t border-[var(--color-border)]">

              <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted)]">
                Vendido por
              </p>

              <Link
                href={`/store/${listing.seller_id}`}
                className="flex items-center gap-3 mt-4 no-underline group"
              >

                <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-[var(--color-border)] flex items-center justify-center shrink-0">

                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={businessName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store
                      size={22}
                      className="text-red-600"
                    />
                  )}

                </div>

                <div>
                  <p className="font-bold group-hover:text-red-600 transition-colors">
                    {businessName}
                  </p>

                  <p className="text-xs text-[var(--color-muted)]">
                    Ver emprendimiento
                  </p>
                </div>

              </Link>

            </div>

            {/* CONTACTO */}

            {profile?.whatsapp && (
              <a
                href={getWhatsAppUrl(profile.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 h-12 rounded-xl bg-red-600 text-white flex items-center justify-center gap-2 font-bold text-sm hover:bg-red-500 transition-colors no-underline"
              >
                <MessageCircle size={18} />
                Consultar por WhatsApp
              </a>
            )}

          </div>

        </div>

      </main>

    </div>
  );
}

