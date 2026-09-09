"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Store,
  PackageSearch,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import BottomNav from "./components/ui/BottomNav";
import StoreSection from "./components/home/StoreSection";

type StoreData = {
  id: string;
  businessName: string;
  username: string;
  logo: string | null;
  bio: string;
  city: string;
  categories: string[];
  latestListingAt: string;
};

type SearchStore = {
  id: string;
  business_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
};

type SearchListing = {
  id: number;
  title: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  images: string[] | null;
  created_at: string;
  seller_id: string;
};

type SearchProduct = SearchListing & {
  seller: {
    id: string;
    business_name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
};

type UserProfile = {
  avatar_url: string | null;
  business_name: string | null;
};

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

/*
 * NO TOCAR
 * Carrusel principal
 */
const carouselCategories = [
  {
    type: "Productos",
    name: "Gastronomía",
    image:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc32?w=1200",
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

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

/* =====================================================
   RESULTADO DE EMPRENDIMIENTO
   ===================================================== */

function SearchStoreCard({
  store,
}: {
  store: SearchStore;
}) {
  const businessName =
    store.business_name?.trim() ||
    store.username?.trim() ||
    "Emprendimiento";

  return (
    <Link
      href={`/store/${store.id}`}
      className="group flex items-center gap-4 bg-[#111111] border border-[#262626] rounded-2xl p-4 hover:border-[#B4232D] hover:bg-[#151515] transition-all duration-200"
    >
      <div className="w-16 h-16 rounded-xl bg-[#1a1a1a] border border-[#292929] flex items-center justify-center overflow-hidden shrink-0">
        {store.avatar_url ? (
          <Image
            src={store.avatar_url}
            alt={businessName}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <Store
            size={28}
            className="text-gray-600"
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-white truncate">
          {businessName}
        </h3>

        {store.bio && (
          <p className="text-sm text-gray-400 line-clamp-2 mt-1">
            {store.bio}
          </p>
        )}

        {store.city && (
          <p className="text-xs text-gray-500 mt-2">
            {store.city}
          </p>
        )}
      </div>

      <span className="text-sm font-bold text-[#B4232D] shrink-0 group-hover:translate-x-0.5 transition-transform">
        Ver →
      </span>
    </Link>
  );
}

/* =====================================================
   RESULTADO DE PRODUCTO
   ===================================================== */

function SearchProductCard({
  product,
}: {
  product: SearchProduct;
}) {
  const sellerName =
    product.seller?.business_name?.trim() ||
    product.seller?.username?.trim() ||
    "Emprendimiento";

  const image =
    product.image_url ||
    product.images?.[0] ||
    null;

  return (
    <Link
      href={`/listings/${product.id}`}
      className="group bg-[#111111] border border-[#262626] rounded-2xl overflow-hidden hover:border-[#B4232D] hover:shadow-[0_8px_30px_rgba(180,35,45,0.12)] transition-all duration-200"
    >
      <div className="aspect-square bg-[#181818] flex items-center justify-center overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <PackageSearch
            size={48}
            className="text-gray-600"
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-white line-clamp-2 min-h-[48px]">
          {product.title}
        </h3>

        <p className="text-lg font-black text-white mt-2">
          {formatPrice(product.price)}
        </p>

        <p className="text-sm text-gray-400 mt-2 truncate">
          {sellerName}
        </p>

        {product.category && (
          <span className="inline-block text-[11px] font-semibold text-[#D85A63] bg-[#B4232D]/10 border border-[#B4232D]/20 rounded-full px-2.5 py-1 mt-3">
            {product.category}
          </span>
        )}
      </div>
    </Link>
  );
}

/* =====================================================
   RESULTADOS DE BÚSQUEDA
   ===================================================== */

function SearchResults({
  stores,
  products,
  loading,
}: {
  stores: SearchStore[];
  products: SearchProduct[];
  loading: boolean;
}) {
  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-flex items-center gap-3 text-gray-500">
          <div className="w-4 h-4 border-2 border-gray-700 border-t-[#B4232D] rounded-full animate-spin" />
          Buscando...
        </div>
      </div>
    );
  }

  if (
    stores.length === 0 &&
    products.length === 0
  ) {
    return (
      <div className="py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#111111] border border-[#252525] flex items-center justify-center">
          <PackageSearch
            size={32}
            className="text-gray-600"
          />
        </div>

        <h2 className="text-xl font-bold text-white mt-5">
          No encontramos resultados
        </h2>

        <p className="text-sm text-gray-500 mt-2">
          Probá buscando otro producto o emprendimiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {stores.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Emprendimientos
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Emprendimientos relacionados con tu búsqueda
              </p>
            </div>

            <span className="text-xs font-bold text-gray-500 bg-[#111111] border border-[#242424] px-3 py-1.5 rounded-full">
              {stores.length}
            </span>
          </div>

          <div className="space-y-3">
            {stores.map((store) => (
              <SearchStoreCard
                key={store.id}
                store={store}
              />
            ))}
          </div>
        </section>
      )}

      {products.length > 0 && (
        <section>
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">
                Productos
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Productos relacionados con tu búsqueda
              </p>
            </div>

            <span className="text-xs font-bold text-gray-500 bg-[#111111] border border-[#242424] px-3 py-1.5 rounded-full">
              {products.length}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <SearchProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* =====================================================
   HOME
   ===================================================== */

export default function Home() {
  const [search, setSearch] = useState("");

  const [stores, setStores] =
    useState<StoreData[]>([]);

  const [searchStores, setSearchStores] =
    useState<SearchStore[]>([]);

  const [searchProducts, setSearchProducts] =
    useState<SearchProduct[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [carouselIndex, setCarouselIndex] =
    useState(0);

  /* =====================================================
     FAVORITOS
     ===================================================== */

  const [favoriteIds, setFavoriteIds] =
    useState<string[]>([]);

  /* =====================================================
     PERFIL DEL USUARIO LOGUEADO
     ===================================================== */

  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  async function fetchUserProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      setUserProfile(null);
      setCurrentUserId(null);
      return;
    }

    setIsLoggedIn(true);
    setCurrentUserId(user.id);

    const { data, error } =
      await supabase
        .from("profiles")
        .select(`
          avatar_url,
          business_name
        `)
        .eq("id", user.id)
        .maybeSingle();

    if (error) {
      console.error(
        "Error obteniendo perfil:",
        error
      );
    }

    setUserProfile(
      data as UserProfile | null
    );
  }

  /* =====================================================
     CARGAR FAVORITOS
     ===================================================== */

  async function fetchFavorites() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setFavoriteIds([]);
      return;
    }

    const { data, error } =
      await supabase
        .from("favorites")
        .select("profile_id")
        .eq("user_id", user.id);

    if (error) {
      console.error(
        "Error obteniendo favoritos:",
        error
      );
      return;
    }

    setFavoriteIds(
      (data || []).map(
        (favorite) =>
          favorite.profile_id
      )
    );
  }

  /* =====================================================
     AGREGAR / QUITAR FAVORITO
     ===================================================== */

  async function toggleFavorite(
    profileId: string
  ) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const isFavorite =
      favoriteIds.includes(profileId);

    if (isFavorite) {
      const { error } =
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq(
            "profile_id",
            profileId
          );

      if (error) {
        console.error(
          "Error quitando favorito:",
          error
        );
        return;
      }

      setFavoriteIds(
        (current) =>
          current.filter(
            (id) =>
              id !== profileId
          )
      );
    } else {
      const { error } =
        await supabase
          .from("favorites")
          .insert({
            user_id: user.id,
            profile_id: profileId,
          });

      if (error) {
        console.error(
          "Error agregando favorito:",
          error
        );
        return;
      }

      setFavoriteIds(
        (current) => [
          ...current,
          profileId,
        ]
      );
    }
  }

  /* =====================================================
     CARGAR EMPRENDIMIENTOS
     ===================================================== */

  async function fetchStores() {
    setLoading(true);

    const {
      data: profiles,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        username,
        business_name,
        avatar_url,
        bio,
        city
      `);

    if (
      profilesError ||
      !profiles
    ) {
      console.error(
        "Error obteniendo emprendimientos:",
        profilesError
      );

      setStores([]);
      setLoading(false);
      return;
    }

    const {
      data: listings,
      error: listingsError,
    } = await supabase
      .from("listings")
      .select(`
        id,
        category,
        created_at,
        seller_id
      `)
      .eq("sold", false)
      .order("created_at", {
        ascending: false,
      });

    if (listingsError) {
      console.error(
        "Error obteniendo publicaciones:",
        listingsError
      );
    }

    const storesMap = new Map<
      string,
      StoreData
    >();

    for (const profile of profiles) {
      const businessName =
        profile.business_name?.trim() ||
        profile.username?.trim() ||
        "Emprendimiento";

      storesMap.set(profile.id, {
        id: profile.id,
        businessName,
        username:
          profile.username || "",
        logo: profile.avatar_url,
        bio: profile.bio || "",
        city:
          profile.city || "Rafaela",
        categories: [],
        latestListingAt:
          "1970-01-01T00:00:00.000Z",
      });
    }

    if (listings) {
      for (const listing of listings) {
        const store =
          storesMap.get(
            listing.seller_id
          );

        if (!store) continue;

        if (
          listing.category &&
          !store.categories.includes(
            listing.category
          )
        ) {
          store.categories.push(
            listing.category
          );
        }

        if (
          new Date(
            listing.created_at
          ).getTime() >
          new Date(
            store.latestListingAt
          ).getTime()
        ) {
          store.latestListingAt =
            listing.created_at;
        }
      }
    }

    const storesArray =
      Array.from(
        storesMap.values()
      );

    storesArray.sort((a, b) => {
      return (
        new Date(
          b.latestListingAt
        ).getTime() -
        new Date(
          a.latestListingAt
        ).getTime()
      );
    });

    setStores(storesArray);
    setLoading(false);
  }

  /* =====================================================
     BUSCAR EMPRENDIMIENTOS + PRODUCTOS
     ===================================================== */

  async function performSearch(
    query: string
  ) {
    const cleanQuery =
      query.trim();

    if (!cleanQuery) {
      setSearchStores([]);
      setSearchProducts([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    const {
      data: profiles,
      error: profilesError,
    } = await supabase
      .from("profiles")
      .select(`
        id,
        business_name,
        username,
        avatar_url,
        bio,
        city
      `)
      .or(
        `business_name.ilike.%${cleanQuery}%,username.ilike.%${cleanQuery}%,bio.ilike.%${cleanQuery}%`
      )
      .limit(10);

    if (profilesError) {
      console.error(
        "Error buscando emprendimientos:",
        profilesError
      );
    }

    const {
      data: listings,
      error: listingsError,
    } = await supabase
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
        seller_id
      `)
      .eq("sold", false)
      .or(
        `title.ilike.%${cleanQuery}%,description.ilike.%${cleanQuery}%,category.ilike.%${cleanQuery}%`
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    if (listingsError) {
      console.error(
        "Error buscando productos:",
        listingsError
      );
    }

    let productsWithSeller: SearchProduct[] =
      [];

    if (
      listings &&
      listings.length > 0
    ) {
      const sellerIds = [
        ...new Set(
          listings.map(
            (listing) =>
              listing.seller_id
          )
        ),
      ];

      const {
        data: sellers,
        error: sellersError,
      } = await supabase
        .from("profiles")
        .select(`
          id,
          business_name,
          username,
          avatar_url
        `)
        .in(
          "id",
          sellerIds
        );

      if (sellersError) {
        console.error(
          "Error obteniendo vendedores:",
          sellersError
        );
      }

      const sellersMap =
        new Map<
          string,
          {
            id: string;
            business_name:
              | string
              | null;
            username:
              | string
              | null;
            avatar_url:
              | string
              | null;
          }
        >();

      sellers?.forEach(
        (seller) => {
          sellersMap.set(
            seller.id,
            seller
          );
        }
      );

      productsWithSeller =
        listings.map(
          (listing) => ({
            ...listing,
            seller:
              sellersMap.get(
                listing.seller_id
              ) || null,
          })
        );
    }

    setSearchStores(
      profiles || []
    );

    setSearchProducts(
      productsWithSeller
    );

    setSearchLoading(false);
  }

  /* =====================================================
     CARGAR HOME
     ===================================================== */

  useEffect(() => {
    fetchStores();
    fetchUserProfile();
    fetchFavorites();

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        () => {
          fetchUserProfile();
          fetchFavorites();
        }
      );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /* =====================================================
     BÚSQUEDA INSTANTÁNEA
     ===================================================== */

  useEffect(() => {
    const cleanQuery =
      search.trim();

    if (!cleanQuery) {
      setSearchStores([]);
      setSearchProducts([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);

    const timeout =
      setTimeout(() => {
        performSearch(
          cleanQuery
        );
      }, 300);

    return () =>
      clearTimeout(timeout);
  }, [search]);

  /* =====================================================
     CARRUSEL AUTOMÁTICO
     ===================================================== */

  useEffect(() => {
    const interval =
      setInterval(() => {
        setCarouselIndex(
          (current) =>
            (current + 1) %
            carouselCategories.length
        );
      }, 4000);

    return () =>
      clearInterval(interval);
  }, []);

  const currentCarousel =
    carouselCategories[
      carouselIndex
    ];

  const newStores =
    useMemo(() => {
      return stores.slice(0, 10);
    }, [stores]);

  const getStoresByCategory = (
    category: string
  ) => {
    return stores.filter(
      (store) =>
        store.categories.includes(
          category
        )
    );
  };

  const hasSearch =
    search.trim().length > 0;

  return (
    <div className="min-h-screen bg-black text-gray-100 pb-24">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-xl border-b border-[#242424]">

        <div className="max-w-7xl mx-auto px-4 py-3">

          <div className="flex items-center gap-3 md:gap-5">

            <Link
              href="/"
              className="font-black tracking-tight text-lg md:text-xl shrink-0 text-white"
            >
              <span className="text-[#B4232D]">
                App
              </span>
              Emprendedores
            </Link>

            <div className="flex-1 flex justify-center min-w-0">

              <div className="relative w-full max-w-[650px]">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                  placeholder="Buscar emprendimientos o productos..."
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-[#292929] bg-[#111111] text-white placeholder:text-gray-600 outline-none focus:border-[#B4232D] focus:ring-1 focus:ring-[#B4232D]/30 transition-all"
                />

              </div>

            </div>

            {isLoggedIn ? (

              <Link
                href="/account"
                className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-xl overflow-hidden border border-[#292929] bg-[#151515] flex items-center justify-center hover:border-[#B4232D] transition-colors"
                aria-label={
                  userProfile?.business_name ||
                  "Mi perfil"
                }
              >

                {userProfile?.avatar_url ? (
                  <Image
                    src={
                      userProfile.avatar_url
                    }
                    alt={
                      userProfile.business_name ||
                      "Mi emprendimiento"
                    }
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store
                    size={20}
                    className="text-[#B4232D]"
                  />
                )}

              </Link>

            ) : (

              <a
                href="/auth"
                className="shrink-0 bg-[#B4232D] hover:bg-[#951D26] text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-colors"
              >
                Registrarse
              </a>

            )}

          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENIDO
          ===================================================== */}

      <main className="max-w-7xl mx-auto px-4 pt-7">

        {hasSearch ? (

          <SearchResults
            stores={searchStores}
            products={searchProducts}
            loading={searchLoading}
          />

        ) : (

          <>

            {/* =====================================================
                CARRUSEL
                ===================================================== */}

            <section className="mb-10">

              <div className="relative overflow-hidden rounded-3xl h-[220px] md:h-[300px] border border-[#292929] bg-[#111111] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">

                <Image
                  src={
                    currentCarousel.image
                  }
                  alt={
                    currentCarousel.name
                  }
                  fill
                  className="object-cover"
                  priority
                />

                <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/20" />

                <div className="absolute inset-0 flex flex-col justify-center px-7 md:px-12 text-white">

                  <span className="text-xs md:text-sm uppercase tracking-[0.2em] font-bold text-gray-300">
                    {
                      currentCarousel.type
                    }
                  </span>

                  <h1 className="text-3xl md:text-5xl font-black tracking-tight mt-2 max-w-xl">
                    {
                      currentCarousel.name
                    }
                  </h1>

                  <p className="mt-3 text-sm md:text-base text-gray-200 max-w-md">
                    Descubrí emprendimientos
                    de tu ciudad
                  </p>

                </div>

                <button
                  onClick={() =>
                    setCarouselIndex(
                      (current) =>
                        current === 0
                          ? carouselCategories.length -
                            1
                          : current - 1
                    )
                  }
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-[#B4232D] hover:border-[#B4232D] transition-all"
                  aria-label="Anterior"
                >
                  <ChevronLeft
                    size={20}
                  />
                </button>

                <button
                  onClick={() =>
                    setCarouselIndex(
                      (current) =>
                        (current + 1) %
                        carouselCategories.length
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-[#B4232D] hover:border-[#B4232D] transition-all"
                  aria-label="Siguiente"
                >
                  <ChevronRight
                    size={20}
                  />
                </button>

                <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">

                  {carouselCategories.map(
                    (_, index) => (

                      <button
                        key={index}
                        onClick={() =>
                          setCarouselIndex(
                            index
                          )
                        }
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          index ===
                          carouselIndex
                            ? "bg-[#B4232D] w-7"
                            : "bg-white/40 w-2"
                        }`}
                        aria-label={`Ir a diapositiva ${
                          index + 1
                        }`}
                      />

                    )
                  )}

                </div>

              </div>

            </section>

            {/* =====================================================
                LOADING
                ===================================================== */}

            {loading ? (

              <div className="space-y-10">

                {[1, 2, 3].map(
                  (section) => (

                    <section
                      key={section}
                    >

                      <div className="h-7 w-52 bg-[#171717] rounded-lg mb-2 animate-pulse" />

                      <div className="h-4 w-72 bg-[#131313] rounded mb-5 animate-pulse" />

                      <div className="flex gap-4 overflow-hidden">

                        {[1, 2, 3, 4].map(
                          (card) => (

                            <div
                              key={card}
                              className="min-w-[250px] h-[280px] bg-[#111111] border border-[#202020] rounded-2xl animate-pulse"
                            />

                          )
                        )}

                      </div>

                    </section>
                  )
                )}

              </div>

            ) : stores.length === 0 ? (

              /* =====================================================
                 ESTADO VACÍO
                 ===================================================== */

              <div className="py-20 text-center">

                <div className="w-16 h-16 mx-auto rounded-2xl bg-[#111111] border border-[#252525] flex items-center justify-center">
                  <Store
                    size={32}
                    className="text-gray-600"
                  />
                </div>

                <h2 className="text-xl font-bold text-white mt-5">
                  Todavía no hay
                  emprendimientos
                </h2>

                <p className="text-sm text-gray-500 mt-2">
                  Cuando se registren
                  emprendimientos
                  aparecerán acá.
                </p>

              </div>

            ) : (

              <>

                {/* =====================================================
                    SEPARADOR EMPRENDIMIENTOS
                    ===================================================== */}

                <section className="mb-10 mt-10 sm:mb-12 sm:mt-14">

                  <div className="relative flex items-center">

                    <div className="h-2 w-full bg-[#B4232D]" />

                    <div className="absolute left-1/2 -translate-x-1/2 bg-black px-4 sm:px-6">

                      <h2 className="whitespace-nowrap text-xl font-black uppercase tracking-[0.16em] text-white sm:text-3xl">
                        NUEVOS EMPRENDIMIENTOS
                      </h2>

                    </div>

                  </div>

                  <p className="mt-5 text-sm text-[#888888] sm:text-base">
                    Descubrí los últimos emprendimientos
                  </p>

                </section>

                <StoreSection
                  title="Nuevos emprendimientos"
                  stores={newStores}
                  favoriteIds={favoriteIds}
                  currentUserId={currentUserId}
                  onToggleFavorite={toggleFavorite}
                  hideHeader
                />

                {/* =====================================================
                    SEPARADOR PRODUCTOS
                    ===================================================== */}

                <section className="mb-10 mt-14 sm:mb-12 sm:mt-20">

                  <div className="relative flex items-center">

                    <div className="h-2 w-full bg-[#B4232D]" />

                    <div className="absolute left-1/2 -translate-x-1/2 bg-black px-4 sm:px-6">

                      <h2 className="whitespace-nowrap text-xl font-black uppercase tracking-[0.16em] text-white sm:text-3xl">
                        PRODUCTOS
                      </h2>

                    </div>

                  </div>

                  <p className="mt-5 text-sm text-[#888888] sm:text-base">
                    Explorá emprendimientos según lo que estás buscando
                  </p>

                </section>

                {productCategories.map(
                  (category) => (

                    <StoreSection
                      key={`product-${category}`}
                      title={category}
                      subtitle="Emprendimientos que ofrecen estos productos"
                      stores={getStoresByCategory(category)}
                      favoriteIds={favoriteIds}
                      currentUserId={currentUserId}
                      onToggleFavorite={toggleFavorite}
                    />

                  )
                )}

                {/* =====================================================
                    SEPARADOR SERVICIOS
                    ===================================================== */}

                <section className="mb-10 mt-16 sm:mb-12 sm:mt-20">

                  <div className="relative flex items-center">

                    <div className="h-2 w-full bg-[#B4232D]" />

                    <div className="absolute left-1/2 -translate-x-1/2 bg-black px-4 sm:px-6">

                      <h2 className="whitespace-nowrap text-xl font-black uppercase tracking-[0.16em] text-white sm:text-3xl">
                        SERVICIOS
                      </h2>

                    </div>

                  </div>

                  <p className="mt-5 text-sm text-[#888888] sm:text-base">
                    Encontrá personas y emprendimientos que ofrecen servicios
                  </p>

                </section>

                {serviceCategories.map(
                  (category) => (

                    <StoreSection
                      key={`service-${category}`}
                      title={category}
                      subtitle="Emprendimientos que ofrecen estos servicios"
                      stores={getStoresByCategory(category)}
                      favoriteIds={favoriteIds}
                      currentUserId={currentUserId}
                      onToggleFavorite={toggleFavorite}
                    />

                  )
                )}

              </>

            )}

          </>

        )}

      </main>

      <BottomNav />

    </div>
  );
}