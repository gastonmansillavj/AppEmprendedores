"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import BottomNav from "../../components/ui/BottomNav";

const MAX_LISTINGS = 5;

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

export default function MyListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("No se encontró el usuario.");
      setLoading(false);
      return;
    }

    const { data, error: listingsError } =
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
          sold,
          type,
          created_at
        `)
        .eq("seller_id", user.id)
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

      setLoading(false);
      return;
    }

    setListings(
      (data || []) as Listing[]
    );

    setLoading(false);
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

  const activeCount = activeListings.length;

  function formatPrice(price: number) {
    return new Intl.NumberFormat(
      "es-AR"
    ).format(price);
  }

  function getMainImage(listing: Listing) {
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
      description.substring(0, 75) + "..."
    );
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-24">
        <div className="max-w-6xl mx-auto px-4 py-8">

          <div className="h-8 w-56 bg-[var(--color-subtle)] rounded-lg animate-pulse" />

          <div className="h-4 w-72 bg-[var(--color-subtle)] rounded-lg animate-pulse mt-3" />

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

        <BottomNav />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-24">

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* HEADER */}

        <div className="flex items-start justify-between gap-4">

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Mis publicaciones
            </h1>

            <p className="text-sm text-[var(--color-muted)] mt-1">
              Administrá los productos y servicios de tu emprendimiento.
            </p>
          </div>

          <Link
            href="/sell"
            className="shrink-0 inline-flex items-center justify-center rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-sm px-4 py-2.5 transition-colors"
          >
            + Publicar
          </Link>

        </div>

        {/* CONTADOR */}

        <div className="mt-6 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4">

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
          <div className="mt-10 text-center border border-dashed border-[var(--color-border)] rounded-2xl p-10">

            <div className="text-4xl mb-3">
              📦
            </div>

            <h2 className="text-lg font-bold">
              Todavía no tenés publicaciones
            </h2>

            <p className="text-sm text-[var(--color-muted)] mt-2 max-w-sm mx-auto">
              Publicá un producto o servicio para que aparezca dentro de tu emprendimiento.
            </p>

            <Link
              href="/sell"
              className="inline-flex mt-5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 text-sm transition-colors"
            >
              Crear publicación
            </Link>

          </div>
        ) : (

          /*
           * =========================
           * GRID DE PUBLICACIONES
           * =========================
           */

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

      </div>

      <BottomNav />

    </main>
  );
}
