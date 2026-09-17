"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Store,
  SlidersHorizontal,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import BottomNav from "@/app/components/ui/BottomNav";
import BackButton from "@/app/components/ui/BackButton";

/* ============================================================
   TIPOS
   ============================================================ */

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
  seller_id: string;
};

type Seller = {
  id: string;
  business_name: string | null;
  username: string | null;
  city: string | null;
  ships: boolean | null;
};

/* ============================================================
   CATEGORÍAS
   ============================================================ */

const PRODUCT_CATEGORIES = [
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

const SERVICE_CATEGORIES = [
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

/* ============================================================
   COMPONENTE
   ============================================================ */

export default function FilterPage() {
  const [type, setType] = useState<
    "all" | "product" | "service"
  >("all");

  const [category, setCategory] = useState("");

  const [ships, setShips] = useState<
    "all" | "yes" | "no"
  >("all");

  const [listings, setListings] = useState<Listing[]>([]);

  const [sellers, setSellers] = useState<
    Record<string, Seller>
  >({});

  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  /* ============================================================
     CATEGORÍAS DISPONIBLES SEGÚN TIPO
     ============================================================ */

  const categories =
    type === "product"
      ? PRODUCT_CATEGORIES
      : type === "service"
        ? SERVICE_CATEGORIES
        : [
            ...new Set([
              ...PRODUCT_CATEGORIES,
              ...SERVICE_CATEGORIES,
            ]),
          ];

  /* ============================================================
     CAMBIO DE TIPO
     ============================================================ */

  function handleTypeChange(
    value: "all" | "product" | "service"
  ) {
    setType(value);

    // Si cambiamos de tipo, limpiamos la categoría
    // para evitar combinar categorías incompatibles.
    setCategory("");
  }

  /* ============================================================
     IMAGEN DE PUBLICACIÓN
     ============================================================ */

  function getListingImage(listing: Listing) {
    if (
      listing.images &&
      listing.images.length > 0
    ) {
      return listing.images[0];
    }

    return listing.image_url;
  }

  /* ============================================================
     APLICAR FILTROS
     ============================================================ */

  async function applyFilters() {
    setLoading(true);
    setSearched(true);

    try {
      /* ========================================================
         PUBLICACIONES
         ======================================================== */

      let query = supabase
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
          type,
          seller_id
        `
        )
        .or("sold.eq.false,sold.is.null")
        .order("created_at", {
          ascending: false,
        })
        .limit(100);

      /* ========================================================
         TIPO
         ======================================================== */

      if (type === "product") {
        query = query.eq("type", "Producto");
      }

      if (type === "service") {
        query = query.eq("type", "Servicio");
      }

      /* ========================================================
         CATEGORÍA
         ======================================================== */

      if (category) {
        query = query.eq("category", category);
      }

      const {
        data: listingsData,
        error: listingsError,
      } = await query;

      if (listingsError) {
        console.error(
          "Error obteniendo publicaciones:",
          listingsError
        );

        setListings([]);
        setSellers({});
        return;
      }

      const loadedListings =
        (listingsData || []) as Listing[];

      /* ========================================================
         EMPRENDIMIENTOS

         Solo los necesitamos para aplicar el filtro
         de envíos. NO se muestran como resultado.
         ======================================================== */

      const sellerIds = [
        ...new Set(
          loadedListings.map(
            (listing) => listing.seller_id
          )
        ),
      ];

      if (sellerIds.length === 0) {
        setListings([]);
        setSellers({});
        return;
      }

      let profilesQuery = supabase
        .from("profiles")
        .select(
          `
          id,
          business_name,
          username,
          city,
          ships
        `
        )
        .in("id", sellerIds);

      /* ========================================================
         FILTRO DE ENVÍOS
         ======================================================== */

      if (ships === "yes") {
        profilesQuery = profilesQuery.eq(
          "ships",
          true
        );
      }

      if (ships === "no") {
        profilesQuery = profilesQuery.or(
          "ships.eq.false,ships.is.null"
        );
      }

      const {
        data: profilesData,
        error: profilesError,
      } = await profilesQuery;

      if (profilesError) {
        console.error(
          "Error obteniendo emprendimientos:",
          profilesError
        );

        setListings([]);
        setSellers({});
        return;
      }

      /* ========================================================
         MAPA DE EMPRENDIMIENTOS
         ======================================================== */

      const sellerMap: Record<string, Seller> = {};

      (profilesData || []).forEach(
        (profile) => {
          sellerMap[profile.id] =
            profile as Seller;
        }
      );

      /* ========================================================
         FILTRAR PUBLICACIONES

         Si el emprendimiento no cumple el filtro de
         envíos, tampoco mostramos sus publicaciones.
         ======================================================== */

      const filteredListings =
        loadedListings.filter(
          (listing) =>
            Boolean(
              sellerMap[listing.seller_id]
            )
        );

      setSellers(sellerMap);
      setListings(filteredListings);
    } catch (error) {
      console.error(
        "Error aplicando filtros:",
        error
      );

      setListings([]);
      setSellers({});
    } finally {
      setLoading(false);
    }
  }

  /* ============================================================
     LIMPIAR FILTROS
     ============================================================ */

  function clearFilters() {
    setType("all");
    setCategory("");
    setShips("all");
    setListings([]);
    setSellers({});
    setSearched(false);
  }

  /* ============================================================
     CARGA INICIAL
     ============================================================ */

  useEffect(() => {
    applyFilters();
  }, []);

  /* ============================================================
     RENDER
     ============================================================ */

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ========================================================
         HEADER
         ======================================================== */}

      <nav className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-[1200px] items-center px-4 md:px-8">

          <BackButton />

          <div className="flex flex-1 items-center justify-center gap-2">

            <SlidersHorizontal
              size={18}
              className="text-[#B4232D]"
            />

            <span className="text-sm font-black uppercase tracking-wide">
              Filtrar
            </span>

          </div>

          <div className="w-16" />

        </div>

      </nav>

      {/* ========================================================
         CONTENIDO
         ======================================================== */}

      <main className="mx-auto max-w-[1200px] px-4 pb-28 md:px-8">

        {/* ======================================================
           PANEL DE FILTROS
           ====================================================== */}

        <section className="mt-6 rounded-2xl border border-white/10 bg-[#111111] p-5 sm:p-6">

          <div className="mb-6">

            <h1 className="text-xl font-black uppercase tracking-tight sm:text-2xl">
              Buscar publicaciones
            </h1>

            <p className="mt-2 text-sm text-[#777777]">
              Encontrá productos y servicios de emprendimientos de Rafaela.
            </p>

          </div>

          {/* ====================================================
             TIPO
             ==================================================== */}

          <div>

            <label className="text-xs font-black uppercase tracking-wide text-[#999999]">
              Tipo
            </label>

            <div className="mt-3 grid grid-cols-3 gap-2">

              <button
                type="button"
                onClick={() =>
                  handleTypeChange("all")
                }
                className={`
                  rounded-xl
                  border
                  px-3
                  py-3
                  text-xs
                  font-black
                  uppercase
                  transition-all
                  ${
                    type === "all"
                      ? "border-[#B4232D] bg-[#B4232D] text-white"
                      : "border-white/10 bg-[#181818] text-[#888888] hover:border-white/20 hover:text-white"
                  }
                `}
              >
                Todo
              </button>

              <button
                type="button"
                onClick={() =>
                  handleTypeChange("product")
                }
                className={`
                  rounded-xl
                  border
                  px-3
                  py-3
                  text-xs
                  font-black
                  uppercase
                  transition-all
                  ${
                    type === "product"
                      ? "border-[#B4232D] bg-[#B4232D] text-white"
                      : "border-white/10 bg-[#181818] text-[#888888] hover:border-white/20 hover:text-white"
                  }
                `}
              >
                Productos
              </button>

              <button
                type="button"
                onClick={() =>
                  handleTypeChange("service")
                }
                className={`
                  rounded-xl
                  border
                  px-3
                  py-3
                  text-xs
                  font-black
                  uppercase
                  transition-all
                  ${
                    type === "service"
                      ? "border-[#B4232D] bg-[#B4232D] text-white"
                      : "border-white/10 bg-[#181818] text-[#888888] hover:border-white/20 hover:text-white"
                  }
                `}
              >
                Servicios
              </button>

            </div>

          </div>

          {/* ====================================================
             CATEGORÍA
             ==================================================== */}

          <div className="mt-5">

            <label
              htmlFor="filter-category"
              className="text-xs font-black uppercase tracking-wide text-[#999999]"
            >
              Categoría
            </label>

            <select
              id="filter-category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="
                mt-3
                h-12
                w-full
                rounded-xl
                border
                border-white/10
                bg-[#181818]
                px-4
                text-sm
                font-semibold
                text-white
                outline-none
                transition
                focus:border-[#B4232D]
              "
            >

              <option value="">
                Todas las categorías
              </option>

              {categories.map(
                (categoryName) => (
                  <option
                    key={categoryName}
                    value={categoryName}
                  >
                    {categoryName}
                  </option>
                )
              )}

            </select>

          </div>

          {/* ====================================================
             ENVÍOS
             ==================================================== */}

          <div className="mt-5">

            <label className="text-xs font-black uppercase tracking-wide text-[#999999]">
              Envíos
            </label>

            <div className="mt-3 grid grid-cols-3 gap-2">

              <button
                type="button"
                onClick={() =>
                  setShips("all")
                }
                className={`
                  rounded-xl
                  border
                  px-3
                  py-3
                  text-xs
                  font-black
                  uppercase
                  transition-all
                  ${
                    ships === "all"
                      ? "border-[#B4232D] bg-[#B4232D] text-white"
                      : "border-white/10 bg-[#181818] text-[#888888] hover:border-white/20 hover:text-white"
                  }
                `}
              >
                Todos
              </button>

              <button
                type="button"
                onClick={() =>
                  setShips("yes")
                }
                className={`
                  rounded-xl
                  border
                  px-3
                  py-3
                  text-xs
                  font-black
                  uppercase
                  transition-all
                  ${
                    ships === "yes"
                      ? "border-[#B4232D] bg-[#B4232D] text-white"
                      : "border-white/10 bg-[#181818] text-[#888888] hover:border-white/20 hover:text-white"
                  }
                `}
              >
                Con envíos
              </button>

              <button
                type="button"
                onClick={() =>
                  setShips("no")
                }
                className={`
                  rounded-xl
                  border
                  px-3
                  py-3
                  text-xs
                  font-black
                  uppercase
                  transition-all
                  ${
                    ships === "no"
                      ? "border-[#B4232D] bg-[#B4232D] text-white"
                      : "border-white/10 bg-[#181818] text-[#888888] hover:border-white/20 hover:text-white"
                  }
                `}
              >
                Sin envíos
              </button>

            </div>

          </div>

          {/* ====================================================
             BOTONES
             ==================================================== */}

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">

            <button
              type="button"
              onClick={applyFilters}
              disabled={loading}
              className="
                flex
                h-12
                w-full
                items-center
                justify-center
                rounded-xl
                bg-[#B4232D]
                px-5
                text-sm
                font-black
                uppercase
                tracking-wide
                text-white
                transition-all
                hover:bg-[#9F1F27]
                disabled:cursor-not-allowed
                disabled:opacity-60
                sm:flex-1
                sm:w-auto
              "
            >
              {loading
                ? "Buscando..."
                : "Aplicar filtros"}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              disabled={loading}
              className="
                flex
                h-12
                w-full
                items-center
                justify-center
                rounded-xl
                border
                border-white/10
                bg-[#181818]
                px-5
                text-sm
                font-black
                uppercase
                tracking-wide
                text-[#999999]
                transition-all
                hover:border-white/20
                hover:text-white
                disabled:opacity-50
                sm:w-auto
              "
            >
              Limpiar
            </button>

          </div>

        </section>

        {/* ======================================================
           RESULTADOS
           ====================================================== */}

        <section className="mt-10">

          <div className="flex items-center gap-4">

            <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

            <h2 className="whitespace-nowrap text-xl font-black uppercase tracking-[0.12em] sm:text-2xl">
              Publicaciones
            </h2>

            <div className="h-1 flex-1 rounded-full bg-[#B4232D]" />

          </div>

          {/* ====================================================
             LOADING
             ==================================================== */}

          {loading ? (

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">

              {Array.from({
                length: 10,
              }).map((_, index) => (

                <div
                  key={index}
                  className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#111111]
                  "
                >

                  <div className="aspect-square animate-pulse bg-[#222222]" />

                  <div className="space-y-3 p-3 sm:p-4">

                    <div className="h-4 animate-pulse rounded bg-[#222222]" />

                    <div className="h-5 w-24 animate-pulse rounded bg-[#222222]" />

                  </div>

                </div>

              ))}

            </div>

          ) : listings.length === 0 ? (

            /* ==================================================
               SIN RESULTADOS
               ================================================== */

            <div className="mt-6 rounded-2xl border border-white/10 bg-[#0B0B0B] px-6 py-20 text-center">

              <Store
                size={38}
                className="mx-auto mb-5 text-[#B4232D]"
              />

              <h3 className="text-lg font-black uppercase tracking-wide">
                No encontramos publicaciones
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#777777]">
                Probá cambiar la categoría, el tipo de publicación o el filtro de envíos.
              </p>

            </div>

          ) : (

            /* ==================================================
               CARDS DE PUBLICACIONES

               ESTA ES LA MISMA CARD QUE YA TENÉS EN
               StorePage.
               ================================================== */

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 lg:grid-cols-5">

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

          )}

          {/* ====================================================
             CANTIDAD
             ==================================================== */}

          {!loading &&
            listings.length > 0 && (

              <div className="mt-6 text-center">

                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#666666]">

                  {listings.length}{" "}

                  {listings.length === 1
                    ? "publicación encontrada"
                    : "publicaciones encontradas"}

                </span>

              </div>

            )}

        </section>

      </main>

      <BottomNav />

    </div>
  );
}