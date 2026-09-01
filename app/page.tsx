"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Heart,
  ChevronLeft,
  ChevronRight,
  PackageSearch,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import { Listing } from "./types";
import { demoListings } from "./demoListings";
import BottomNav from "./components/ui/BottomNav";

const productCategories = [
  "Gastronomía",
  "Indumentaria",
  "Accesorios",
  "Hogar y decoración",
  "Regalos y personalizados",
  "Arte y artesanías",
  "Mascotas",
  "Tecnología",
  "Automotor",
  "Otros",
];

const serviceCategories = [
  "Reparaciones y mantenimiento",
  "Belleza y estética",
  "Fotografía y video",
  "Tecnología y servicios digitales",
  "Salud y entrenamiento",
  "Automotor",
  "Eventos",
  "Hogar",
  "Educación",
  "Otros",
];

const carouselCategories = [
  {
    type: "Productos",
    name: "Gastronomía",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200",
  },
  {
    type: "Productos",
    name: "Indumentaria",
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200",
  },
  {
    type: "Productos",
    name: "Accesorios",
    image:
      "https://images.unsplash.com/photo-1523779917675-b6ed3a42a561?w=1200",
  },
  {
    type: "Productos",
    name: "Hogar y decoración",
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200",
  },
  {
    type: "Productos",
    name: "Arte y artesanías",
    image:
      "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?w=1200",
  },
  {
    type: "Servicios",
    name: "Belleza y estética",
    image:
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200",
  },
  {
    type: "Servicios",
    name: "Fotografía y video",
    image:
      "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200",
  },
  {
    type: "Servicios",
    name: "Eventos",
    image:
      "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=1200",
  },
];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<number[]>([]);

  const [user, setUser] = useState<{ id: string } | null>(null);

  const [carouselIndex, setCarouselIndex] = useState(0);

  async function fetchListings() {
    const { data, error } = await supabase
      .from("listings")
      .select("*, profiles(username)")
      .eq("sold", false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      const mapped: Listing[] = data.map((listing) => ({
        id: listing.id,
        title: listing.title,
        price: listing.price,
        category: listing.category,
        condition: listing.condition,
        image:
          listing.image_url ||
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
        seller: listing.profiles?.username || "unknown",
        likes: listing.likes || 0,
        description: listing.description,
      }));

      setListings(mapped.length > 0 ? mapped : demoListings);
    } else {
      setListings(demoListings);
    }

    setLoading(false);
  }

  async function fetchUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    setUser({ id: user.id });

    const { data } = await supabase
      .from("listing_likes")
      .select("listing_id")
      .eq("user_id", user.id);

    if (data) {
      setLiked(data.map((item) => item.listing_id));
    }
  }

  useEffect(() => {
    fetchListings();
    fetchUser();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCarouselIndex(
        (previous) => (previous + 1) % carouselCategories.length
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  async function toggleLike(
    event: React.MouseEvent,
    listingId: number
  ) {
    event.preventDefault();
    event.stopPropagation();

    const isLiked = liked.includes(listingId);

    setLiked((previous) =>
      isLiked
        ? previous.filter((id) => id !== listingId)
        : [...previous, listingId]
    );

    // Los usuarios no registrados pueden ver el cambio localmente,
    // pero no se guarda en Supabase.
    if (!user || listingId < 0) return;

    if (isLiked) {
      await supabase
        .from("listing_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("listing_id", listingId);
    } else {
      await supabase.from("listing_likes").insert({
        user_id: user.id,
        listing_id: listingId,
      });
    }
  }

  const filteredListings = useMemo(() => {
    if (!search.trim()) return listings;

    const query = search.toLowerCase();

    return listings.filter(
      (listing) =>
        listing.title.toLowerCase().includes(query) ||
        listing.category?.toLowerCase().includes(query)
    );
  }, [listings, search]);

  // Por ahora Trending = publicaciones más recientes.
  const trending = listings.slice(0, 8);

  const carousel = carouselCategories[carouselIndex];

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">

{/* =====================================================
    HEADER
===================================================== */}

<nav className="sticky top-0 z-40 bg-black/95 backdrop-blur-xl border-b border-white/10">
  <div className="max-w-[1400px] mx-auto px-3 md:px-8 h-16 flex items-center gap-2 md:gap-5">

    {/* LOGO */}

    <Link
      href="/"
      className="flex items-center gap-2.5 shrink-0 no-underline"
    >
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
        <span className="text-white font-black text-sm">
          A
        </span>
      </div>

      <span className="hidden sm:block font-extrabold text-[17px] tracking-tight text-white">
        AppEmprendedores
      </span>
    </Link>

   

{/* SEARCH + BOTÓN BUSCAR */}

<div className="flex-1 flex justify-center min-w-0">
  <div className="flex items-center gap-2 w-full max-w-[650px]">

    {/* Barra de búsqueda */}

    <div className="relative flex-1 min-w-0">

      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
      />

      <input
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Buscar..."
        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder:text-gray-500 text-sm outline-none focus:border-red-500 transition-colors"
      />

    </div>

    {/* Botón buscar */}

    <Link
      href="/search"
      aria-label="Buscar"
      title="Buscar"
      className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 text-white flex items-center justify-center hover:bg-white/15 transition-colors no-underline shrink-0"
    >
      <Search size={17} />
    </Link>

  </div>
</div>



{/* PUBLICAR */}

<Link
  href="/sell"
  aria-label="Publicar"
  title="Publicar"
  className="h-10 px-4 rounded-xl bg-red-600 text-white flex items-center justify-center gap-1.5 font-semibold hover:bg-red-500 transition-colors no-underline shrink-0"
>
  <span className="text-2xl font-light leading-none">+</span>

  {/* Texto solamente en pantallas grandes */}
  <span className="hidden md:inline text-sm">
    Publicar
  </span>
</Link>



  </div>
</nav>


      {/* =====================================================
          CAROUSEL
      ===================================================== */}

      <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6">

        <div className="relative h-[210px] md:h-[260px] rounded-3xl overflow-hidden bg-black">

          <Image
            src={carousel.image}
            alt={carousel.name}
            fill
            priority
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />

          <div className="absolute inset-0 flex items-center px-7 md:px-12">

            <div>

              <span className="inline-block mb-2 px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-bold uppercase tracking-wide">
                {carousel.type}
              </span>

              <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight">
                {carousel.name}
              </h1>

              <p className="text-white/70 mt-2 text-sm md:text-base">
                Descubrí emprendimientos de Rafaela
              </p>

            </div>

          </div>

          {/* PREVIOUS */}

          <button
            onClick={() =>
              setCarouselIndex(
                (carouselIndex - 1 + carouselCategories.length) %
                  carouselCategories.length
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>

          {/* NEXT */}

          <button
            onClick={() =>
              setCarouselIndex(
                (carouselIndex + 1) % carouselCategories.length
              )
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <ChevronRight size={20} />
          </button>

          {/* INDICATORS */}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">

            {carouselCategories.map((_, index) => (
              <button
                key={index}
                onClick={() => setCarouselIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === carouselIndex
                    ? "w-7 bg-red-500"
                    : "w-2 bg-white/40"
                }`}
              />
            ))}

          </div>

        </div>

      </section>

      {/* =====================================================
          RECENTLY VIEWED
      ===================================================== */}

      <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">

        <div className="flex items-center justify-between mb-4">

          <div>
            <h2 className="text-lg font-extrabold">
              Recently viewed
            </h2>

            <p className="text-xs text-[var(--color-muted)] mt-1">
              Publicaciones que viste recientemente
            </p>
          </div>

        </div>

        <div className="h-[1px] bg-[var(--color-border)]" />

      </section>

      {/* =====================================================
          TRENDING
      ===================================================== */}

      {trending.length > 0 && (

        <section className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">

          <div className="flex items-center gap-2 mb-4">

            <span className="text-xl">
              🔥
            </span>

            <div>
              <h2 className="text-lg font-extrabold">
                Trending now
              </h2>

              <p className="text-xs text-[var(--color-muted)]">
                Las publicaciones más recientes
              </p>
            </div>

          </div>

          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">

            {trending.map((listing) => (

              <Link
                key={listing.id}
                href={`/listings/${listing.id}`}
                className="group shrink-0 w-[175px] no-underline"
              >

                <div className="rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] transition-all group-hover:-translate-y-1 group-hover:border-red-500/50">

                  <div className="relative aspect-square">

                    <Image
                      src={listing.image}
                      alt={listing.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                  </div>

                  <div className="p-3">

                    <p className="text-xs font-semibold truncate">
                      {listing.title}
                    </p>

                    <p className="text-sm font-extrabold mt-1">
                      ${listing.price}
                    </p>

                  </div>

                </div>

              </Link>

            ))}

          </div>

        </section>

      )}

      {/* =====================================================
          FEED
      ===================================================== */}

      <main className="max-w-[1400px] mx-auto px-4 md:px-8 pt-10 pb-28">

        <div className="flex items-end justify-between mb-5">

          <div>

            <h2 className="text-2xl font-black tracking-tight">
              Emprendimientos
            </h2>

            <p className="text-sm text-[var(--color-muted)] mt-1">
              Descubrí productos y servicios de Rafaela
            </p>

          </div>

          <span className="text-xs text-[var(--color-muted)]">
            {filteredListings.length} publicaciones
          </span>

        </div>

        {loading ? (

          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns:
                "repeat(auto-fill, minmax(210px, 1fr))",
            }}
          >

            {[...Array(8)].map((_, index) => (

              <div
                key={index}
                className="rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-surface)]"
              >

                <div className="aspect-[4/3] bg-[var(--color-subtle)] animate-pulse" />

                <div className="p-4 space-y-2">

                  <div className="h-3 bg-[var(--color-subtle)] rounded animate-pulse w-4/5" />

                  <div className="h-4 bg-[var(--color-subtle)] rounded animate-pulse w-2/5" />

                </div>

              </div>

            ))}

          </div>

        ) : filteredListings.length === 0 ? (

          <div className="text-center py-24">

            <PackageSearch
              size={40}
              className="mx-auto mb-4 text-[var(--color-muted)]"
            />

            <p className="font-bold">
              No encontramos publicaciones
            </p>

            <p className="text-sm text-[var(--color-muted)] mt-1">
              Probá con otra búsqueda.
            </p>

          </div>

        ) : (

          <div
            className="grid gap-5"
            style={{
              gridTemplateColumns:
                "repeat(auto-fill, minmax(210px, 1fr))",
            }}
          >

            {filteredListings.map((listing) => {

              const isLiked = liked.includes(listing.id);

              return (

                <Link
                  href={`/listings/${listing.id}`}
                  key={listing.id}
                  className="group no-underline"
                >

                  <article className="rounded-2xl overflow-hidden bg-[var(--color-surface)] border border-[var(--color-border)] transition-all duration-200 group-hover:-translate-y-1 group-hover:border-red-500/50">

                    {/* FOTO */}

                    <div className="relative aspect-[4/3] overflow-hidden">

                      <Image
                        src={listing.image}
                        alt={listing.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* FAVORITO */}

                      <button
                        onClick={(event) =>
                          toggleLike(event, listing.id)
                        }
                        aria-label="Guardar favorito"
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform"
                      >

                        <Heart
                          size={16}
                          fill={isLiked ? "#ef4444" : "none"}
                          color={isLiked ? "#ef4444" : "white"}
                        />

                      </button>

                    </div>

                    {/* INFORMACIÓN */}

                    <div className="p-4">

                      <h3 className="font-bold text-sm truncate">
                        {listing.title}
                      </h3>

                      <p className="text-lg font-black mt-1">
                        ${listing.price}
                      </p>

                    </div>

                  </article>

                </Link>

              );
            })}

          </div>

        )}

      </main>

      {/* =====================================================
          NAVEGACIÓN INFERIOR
      ===================================================== */}

      <BottomNav />

    </div>
  );
}
