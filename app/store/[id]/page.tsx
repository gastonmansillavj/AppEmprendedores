"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  MessageCircle,
  Store,
  Clock,
  Truck,
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
};

export default function StorePage() {
  const params = useParams();
  const storeId = params.id as string;

  const [profile, setProfile] = useState<Profile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeId) return;

    fetchStore();
  }, [storeId]);

  async function fetchStore() {
    setLoading(true);

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select(`
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
        address
      `)
      .eq("id", storeId)
      .single();

    if (profileError || !profileData) {
      console.error("Error obteniendo emprendimiento:", profileError);
      setProfile(null);
      setLoading(false);
      return;
    }

    const { data: listingsData, error: listingsError } = await supabase
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
        sold
      `)
      .eq("seller_id", storeId)
      .eq("sold", false)
      .order("created_at", { ascending: false })
      .limit(5);

    if (listingsError) {
      console.error("Error obteniendo publicaciones:", listingsError);
    }

    setProfile(profileData as Profile);
    setListings((listingsData || []) as Listing[]);
    setLoading(false);
  }

  function getListingImage(listing: Listing) {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0];
    }

    return listing.image_url;
  }

  function getWhatsAppUrl(number: string) {
    const cleanNumber = number.replace(/\D/g, "");
    return `https://wa.me/${cleanNumber}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        <div className="max-w-[1200px] mx-auto px-4 py-8">

          <div className="h-10 w-28 rounded-xl bg-[var(--color-subtle)] animate-pulse mb-6" />

          <div className="rounded-3xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]">

            <div className="h-44 md:h-56 bg-[var(--color-subtle)] animate-pulse" />

            <div className="p-6">

              <div className="w-24 h-24 rounded-full bg-[var(--color-subtle)] animate-pulse -mt-16 border-4 border-[var(--color-surface)]" />

              <div className="mt-4 h-7 w-56 rounded bg-[var(--color-subtle)] animate-pulse" />

              <div className="mt-3 h-4 w-80 max-w-full rounded bg-[var(--color-subtle)] animate-pulse" />

            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

        <main className="max-w-[1200px] mx-auto px-4 py-10">

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
              Emprendimiento no encontrado
            </h1>

            <p className="text-sm text-[var(--color-muted)] mt-2">
              Esta tienda no existe o ya no está disponible.
            </p>

          </div>

        </main>

      </div>
    );
  }

  const businessName =
    profile.business_name?.trim() ||
    profile.username?.trim() ||
    "Emprendimiento";

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

      {/* HEADER */}

      <nav className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">

        <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-16 flex items-center">

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white no-underline"
          >
            <ArrowLeft size={18} />

            <span className="font-semibold text-sm">
              Volver
            </span>
          </Link>

          <div className="flex-1 text-center">

            <span className="text-white font-black text-sm">
              {businessName}
            </span>

          </div>

          <div className="w-16" />

        </div>

      </nav>

      <main className="max-w-[1200px] mx-auto px-4 md:px-8 pb-24">

        {/* PORTADA */}

        <section className="mt-5">

          <div className="relative h-[180px] md:h-[260px] rounded-3xl overflow-hidden bg-black">

            {profile.cover_url ? (
              <img
                src={profile.cover_url}
                alt={`Portada de ${businessName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-black via-zinc-900 to-red-950">

                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-red-900/30" />

              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          </div>

        </section>

        {/* INFORMACIÓN DEL EMPRENDIMIENTO */}

        <section className="relative -mt-14 px-4 md:px-8">

          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-5 md:p-7 shadow-xl">

            <div className="flex flex-col md:flex-row md:items-end gap-5">

              {/* LOGO */}

              <div className="shrink-0">

                <div className="w-28 h-28 rounded-full bg-white border-4 border-[var(--color-surface)] shadow-xl overflow-hidden flex items-center justify-center">

                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={`Logo de ${businessName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Store
                      size={42}
                      className="text-red-600"
                    />
                  )}

                </div>

              </div>

              {/* DATOS */}

              <div className="flex-1 min-w-0">

                <h1 className="text-2xl md:text-3xl font-black tracking-tight">
                  {businessName}
                </h1>

                {profile.bio && (
                  <p className="text-sm text-[var(--color-muted)] mt-2 max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-[var(--color-muted)]">

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} />
                    {profile.city || "Rafaela"}
                  </span>

                  {profile.has_physical_store && profile.address && (
                    <span>
                      {profile.address}
                    </span>
                  )}

                  {profile.ships && (
                    <span className="inline-flex items-center gap-1.5">
                      <Truck size={14} />
                      Realiza envíos
                    </span>
                  )}

                  {profile.opening_hours && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock size={14} />
                      {profile.opening_hours}
                    </span>
                  )}

                </div>

              </div>

              {/* CONTACTO */}

              <div className="flex flex-wrap gap-2">

                {profile.whatsapp && (
                  <a
                    href={getWhatsAppUrl(profile.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 no-underline transition-colors"
                  >
                    <MessageCircle size={17} />
                    WhatsApp
                  </a>
                )}

                {profile.instagram && (
                  <a
                    href={`https://instagram.com/${profile.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:border-red-500/50 transition-colors no-underline font-black text-sm"
                    aria-label="Instagram"
                  >
                    IG
                  </a>
                )}

                {profile.facebook && (
                  <a
                    href={profile.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-xl border border-[var(--color-border)] flex items-center justify-center hover:border-red-500/50 transition-colors no-underline font-black text-sm"
                    aria-label="Facebook"
                  >
                    f
                  </a>
                )}

              </div>

            </div>

          </div>

        </section>

        {/* PUBLICACIONES */}

        <section className="mt-10">

          <div className="flex items-end justify-between mb-5">

            <div>

              <h2 className="text-2xl font-black">
                Publicaciones
              </h2>

              <p className="text-sm text-[var(--color-muted)] mt-1">
                Productos y servicios de {businessName}
              </p>

            </div>

            <span className="text-xs text-[var(--color-muted)]">

              {listings.length}{" "}

              {listings.length === 1
                ? "publicación"
                : "publicaciones"}

            </span>

          </div>

          {listings.length === 0 ? (

            <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface)] py-20 text-center">

              <Store
                size={36}
                className="mx-auto text-[var(--color-muted)] mb-4"
              />

              <h3 className="font-bold text-lg">
                Todavía no hay publicaciones
              </h3>

              <p className="text-sm text-[var(--color-muted)] mt-1">
                Este emprendimiento todavía no publicó productos o servicios.
              </p>

            </div>

          ) : (

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

              {listings.map((listing) => {

                const image = getListingImage(listing);

                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="group rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)] transition-all duration-200 hover:-translate-y-1 hover:shadow-xl no-underline text-[var(--color-text)]"
                  >

                    {/* IMAGEN */}

                    <div className="relative aspect-square bg-[var(--color-subtle)]">

                      {image ? (
                        <img
                          src={image}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">

                          <Store
                            size={30}
                            className="text-[var(--color-muted)]"
                          />

                        </div>
                      )}

                    </div>

                    {/* INFO */}

                    <div className="p-4">

                      <h3 className="font-bold text-sm line-clamp-2 min-h-[40px]">
                        {listing.title}
                      </h3>

                      <p className="text-lg font-black mt-2">
                        ${Number(listing.price).toLocaleString("es-AR")}
                      </p>

                    </div>

                  </Link>
                );

              })}

            </div>

          )}

        </section>

      </main>

    </div>
  );
}
