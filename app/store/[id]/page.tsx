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
  ExternalLink,
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
      <div className="min-h-screen bg-black text-white">
        {/* HEADER */}
        <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 md:px-8">
            <div className="h-8 w-24 animate-pulse bg-[#171717]" />

            <div className="flex-1" />

            <div className="h-8 w-8 animate-pulse bg-[#171717]" />
          </div>
        </nav>

        <main className="mx-auto max-w-[1200px] px-4 pb-24 md:px-8">
          {/* PORTADA */}
          <section className="mt-5">
            <div className="h-[180px] animate-pulse bg-[#171717] sm:h-[220px] md:h-[280px]" />
          </section>

          {/* INFO */}
          <section className="relative -mt-10 px-2 sm:-mt-14 sm:px-4 md:px-8">
            <div className="border-2 border-[#171717] bg-white p-5 shadow-[5px_5px_0_#B4232D] sm:p-6 md:p-8">
              <div className="flex flex-col gap-5 sm:flex-row">
                <div className="h-24 w-24 shrink-0 animate-pulse bg-[#E5E5E5]" />

                <div className="flex-1">
                  <div className="h-8 w-56 animate-pulse bg-[#E5E5E5]" />

                  <div className="mt-3 h-4 w-full max-w-lg animate-pulse bg-[#E5E5E5]" />

                  <div className="mt-5 h-4 w-64 animate-pulse bg-[#E5E5E5]" />
                </div>
              </div>
            </div>
          </section>

          {/* PUBLICACIONES */}
          <section className="mt-12">
            <div className="h-8 w-48 animate-pulse bg-[#171717]" />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden border-2 border-[#171717] bg-white"
                >
                  <div className="aspect-square animate-pulse bg-[#E5E5E5]" />

                  <div className="space-y-3 p-3">
                    <div className="h-4 animate-pulse bg-[#E5E5E5]" />
                    <div className="h-5 w-24 animate-pulse bg-[#E5E5E5]" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    );
  }

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
          <div className="border-2 border-[#333333] bg-[#0B0B0B] px-6 py-20 text-center shadow-[6px_6px_0_#171717]">
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
                border-2
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
                shadow-[4px_4px_0_#171717]
                transition-all
                hover:translate-x-[2px]
                hover:translate-y-[2px]
                hover:shadow-[2px_2px_0_#171717]
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
        {/* PORTADA */}
        {/* ========================================================= */}

        <section className="mt-5">
          <div className="relative h-[180px] overflow-hidden border-2 border-[#171717] bg-[#111111] sm:h-[220px] md:h-[280px]">
            {profile.cover_url ? (
              <img
                src={profile.cover_url}
                alt={`Portada de ${businessName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="relative h-full w-full bg-gradient-to-br from-[#111111] via-black to-[#35090D]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(180,35,45,0.25),transparent_40%)]" />

                <div className="absolute bottom-5 left-5 flex items-center gap-3 sm:bottom-8 sm:left-8">
                  <Store
                    size={26}
                    className="text-[#B4232D]"
                  />

                  <span className="text-xs font-black uppercase tracking-[0.2em] text-white/40 sm:text-sm">
                    Emprendimiento
                  </span>
                </div>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          </div>
        </section>

        {/* ========================================================= */}
        {/* INFORMACIÓN DEL EMPRENDIMIENTO */}
        {/* ========================================================= */}

        <section className="relative -mt-10 px-2 sm:-mt-14 sm:px-4 md:px-8">
          <div
            className="
              border-2
              border-[#171717]
              bg-white
              p-4
              text-black
              shadow-[5px_5px_0_#B4232D]
              sm:p-6
              md:p-7
              md:shadow-[7px_7px_0_#B4232D]
            "
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-end">
              {/* LOGO */}

              <div className="shrink-0">
                <div
                  className="
                    flex
                    h-24
                    w-24
                    items-center
                    justify-center
                    overflow-hidden
                    border-4
                    border-white
                    bg-[#F2F2F2]
                    shadow-[4px_4px_0_#171717]
                    sm:h-28
                    sm:w-28
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
                      size={42}
                      className="text-[#B4232D]"
                    />
                  )}
                </div>
              </div>

              {/* DATOS */}

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
                    {businessName}
                  </h1>

                  {profile.username && (
                    <span className="text-xs font-bold text-[#888888]">
                      @{profile.username.replace("@", "")}
                    </span>
                  )}
                </div>

                {profile.bio && (
                  <p className="mt-2 max-w-2xl text-sm leading-5 text-[#555555]">
                    {profile.bio}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-semibold text-[#666666]">
                  {profile.city && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin
                        size={14}
                        className="text-[#B4232D]"
                      />
                      {profile.city}
                    </span>
                  )}

                  {profile.has_physical_store && profile.address && (
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
              </div>

              {/* CONTACTO */}

              <div className="flex flex-wrap gap-2 md:max-w-[260px] md:justify-end">
                {profile.whatsapp && (
                  <a
                    href={getWhatsAppUrl(profile.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      inline-flex
                      h-10
                      items-center
                      gap-2
                      border-2
                      border-[#B4232D]
                      bg-[#B4232D]
                      px-4
                      text-sm
                      font-black
                      uppercase
                      tracking-wide
                      text-white
                      no-underline
                      shadow-[3px_3px_0_#171717]
                      transition-all
                      hover:translate-x-[2px]
                      hover:translate-y-[2px]
                      hover:shadow-[1px_1px_0_#171717]
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
                      border-2
                      border-[#171717]
                      bg-white
                      text-xs
                      font-black
                      text-black
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
                      border-2
                      border-[#171717]
                      bg-white
                      text-sm
                      font-black
                      text-black
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
          </div>
        </section>

        {/* ========================================================= */}
        {/* SEPARADOR PUBLICACIONES */}
        {/* ========================================================= */}

        <section className="mb-8 mt-14 sm:mb-10 sm:mt-20">
          <div className="relative flex items-center">
            <div className="h-2 w-full bg-[#B4232D]" />

            <div className="absolute left-1/2 -translate-x-1/2 bg-black px-4 sm:px-6">
              <h2 className="whitespace-nowrap text-xl font-black uppercase tracking-[0.16em] text-white sm:text-3xl">
                PUBLICACIONES
              </h2>
            </div>
          </div>

          <p className="mt-5 text-sm text-[#888888] sm:text-base">
            Productos y servicios de {businessName}
          </p>
        </section>

        {/* ========================================================= */}
        {/* PUBLICACIONES */}
        {/* ========================================================= */}

        {listings.length === 0 ? (
          <section className="border-2 border-[#333333] bg-[#0B0B0B] py-20 text-center shadow-[5px_5px_0_#171717]">
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
                const image = getListingImage(listing);

                return (
                  <Link
                    key={listing.id}
                    href={`/listings/${listing.id}`}
                    className="
                      group
                      overflow-hidden
                      border-2
                      border-[#171717]
                      bg-white
                      text-black
                      no-underline
                      shadow-[4px_4px_0_#171717]
                      transition-all
                      duration-200
                      hover:translate-x-[2px]
                      hover:translate-y-[2px]
                      hover:shadow-[2px_2px_0_#B4232D]
                    "
                  >
                    {/* IMAGEN */}

                    <div className="relative aspect-square overflow-hidden bg-[#E8E8E8]">
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
                            className="text-[#999999]"
                          />
                        </div>
                      )}

                      {listing.category && (
                        <div className="absolute left-2 top-2 max-w-[calc(100%-16px)]">
                          <span className="inline-block truncate bg-black px-2 py-1 text-[9px] font-black uppercase tracking-wide text-white">
                            {listing.category}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* INFO */}

                    <div className="p-3 sm:p-4">
                      <h3 className="line-clamp-2 min-h-[36px] text-xs font-black leading-4 sm:min-h-[40px] sm:text-sm sm:leading-5">
                        {listing.title}
                      </h3>

                      <p className="mt-2 text-base font-black sm:text-lg">
                        ${Number(listing.price).toLocaleString("es-AR")}
                      </p>

                      <div className="mt-3 flex items-center justify-between border-t border-[#DDDDDD] pt-2">
                        <span className="text-[9px] font-bold uppercase tracking-wide text-[#888888] sm:text-[10px]">
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

            {/* CANTIDAD */}

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
    </div>
  );
}