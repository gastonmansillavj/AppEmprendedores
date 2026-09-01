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

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price);
}

/* =====================================================
   CARD DE EMPRENDIMIENTO
   ===================================================== */

function StoreCard({ store }: { store: StoreData }) {
  return (
    <Link
      href={`/store/${store.id}`}
      className="min-w-[250px] max-w-[250px] bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/10 transition-all"
    >
      <div className="h-[150px] bg-[#181818] flex items-center justify-center">
        {store.logo ? (
          <Image
            src={store.logo}
            alt={store.businessName}
            width={250}
            height={150}
            className="w-full h-full object-cover"
          />
        ) : (
          <Store size={48} className="text-gray-600" />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white truncate">
          {store.businessName}
        </h3>

        {store.bio && (
          <p className="text-sm text-gray-400 mt-1 line-clamp-2">
            {store.bio}
          </p>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="text-xs text-gray-500">
            {store.city}
          </span>

          <span className="text-sm font-medium text-red-500">
            Ver tienda →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* =====================================================
   SECCIÓN DE EMPRENDIMIENTOS
   ===================================================== */

function StoreSection({
  title,
  subtitle,
  stores,
}: {
  title: string;
  subtitle?: string;
  stores: StoreData[];
}) {
  if (stores.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">
            {title}
          </h2>

          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>

        <span className="text-sm text-gray-500">
          {stores.length}
        </span>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {stores.map((store) => (
          <StoreCard
            key={store.id}
            store={store}
          />
        ))}
      </div>
    </section>
  );
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
      className="flex items-center gap-4 bg-[#111111] border border-[#2a2a2a] rounded-2xl p-4 hover:border-red-500/50 transition-all"
    >
      <div className="w-16 h-16 rounded-xl bg-[#181818] flex items-center justify-center overflow-hidden shrink-0">
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
        <h3 className="font-semibold text-white truncate">
          {businessName}
        </h3>

        {store.bio && (
          <p className="text-sm text-gray-400 line-clamp-2 mt-1">
            {store.bio}
          </p>
        )}

        {store.city && (
          <p className="text-xs text-gray-500 mt-1">
            {store.city}
          </p>
        )}
      </div>

      <span className="text-sm font-medium text-red-500 shrink-0">
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
      className="bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/10 transition-all"
    >
      <div className="aspect-square bg-[#181818] flex items-center justify-center">
        {image ? (
          <Image
            src={image}
            alt={product.title}
            width={400}
            height={400}
            className="w-full h-full object-cover"
          />
        ) : (
          <PackageSearch
            size={48}
            className="text-gray-600"
          />
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-white line-clamp-2 min-h-[48px]">
          {product.title}
        </h3>

        <p className="text-lg font-bold text-white mt-2">
          {formatPrice(product.price)}
        </p>

        <p className="text-sm text-gray-400 mt-2 truncate">
          {sellerName}
        </p>

        {product.category && (
          <span className="inline-block text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-1 mt-2">
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
      <div className="py-12 text-center text-gray-500">
        Buscando...
      </div>
    );
  }

  if (
    stores.length === 0 &&
    products.length === 0
  ) {
    return (
      <div className="py-16 text-center">
        <PackageSearch
          size={48}
          className="mx-auto text-gray-600"
        />

        <h2 className="text-lg font-semibold text-gray-300 mt-4">
          No encontramos resultados
        </h2>

        <p className="text-sm text-gray-500 mt-1">
          Probá buscando otro producto o emprendimiento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {stores.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Emprendimientos
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Emprendimientos relacionados con tu búsqueda
              </p>
            </div>

            <span className="text-sm text-gray-500">
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
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white">
                Productos
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Productos relacionados con tu búsqueda
              </p>
            </div>

            <span className="text-sm text-gray-500">
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
     PERFIL DEL USUARIO LOGUEADO
     ===================================================== */

  const [userProfile, setUserProfile] =
    useState<UserProfile | null>(null);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  async function fetchUserProfile() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setIsLoggedIn(false);
      setUserProfile(null);
      return;
    }

    setIsLoggedIn(true);

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
     CARGAR EMPRENDIMIENTOS
     ===================================================== */

  async function fetchStores() {
    setLoading(true);

    const {
      data: profiles,
      error: profilesError,
    } = await supabase.from("profiles").select(`
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

    const {
      data: authListener,
    } =
      supabase.auth.onAuthStateChange(
        () => {
          fetchUserProfile();
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

      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-[#222]">

        <div className="max-w-7xl mx-auto px-4 py-3">

          <div className="flex items-center gap-3 md:gap-4">

            <Link
              href="/"
              className="font-bold text-lg md:text-xl shrink-0 text-white"
            >
              <span className="text-red-500">
                App
              </span>
              Emprendedores
            </Link>

            <div className="flex-1 flex justify-center min-w-0">

              <div className="relative w-full max-w-[650px]">

                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
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
                  className="w-full h-10 pl-10 pr-4 rounded-full border border-[#2a2a2a] bg-[#111] text-white placeholder:text-gray-500 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition"
                />

              </div>

            </div>

            {isLoggedIn ? (

              <Link
                href="/account"
                className="shrink-0 w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border border-[#2a2a2a] bg-[#181818] flex items-center justify-center hover:border-red-500 transition-colors"
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
                    className="text-red-500"
                  />
                )}

              </Link>

            ) : (

              <a
              href="/auth"
              className="shrink-0 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold text-sm transition"
            >
              Registrarse
            </a>

            )}

          </div>

        </div>

      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">

        {hasSearch ? (

          <SearchResults
            stores={searchStores}
            products={searchProducts}
            loading={searchLoading}
          />

        ) : (

          <>

            <section className="mb-8">

              <div className="relative overflow-hidden rounded-3xl h-[220px] md:h-[300px] border border-[#222]">

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

                <div className="absolute inset-0 bg-black/40" />

                <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-12 text-white">

                  <span className="text-sm uppercase tracking-wider opacity-80">
                    {
                      currentCarousel.type
                    }
                  </span>

                  <h1 className="text-3xl md:text-5xl font-bold mt-2">
                    {
                      currentCarousel.name
                    }
                  </h1>

                  <p className="mt-2 text-sm md:text-base opacity-90">
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
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-900 hover:bg-white transition"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center text-gray-900 hover:bg-white transition"
                  aria-label="Siguiente"
                >
                  <ChevronRight
                    size={20}
                  />
                </button>

                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">

                  {carouselCategories.map(
                    (_, index) => (

                      <button
                        key={index}
                        onClick={() =>
                          setCarouselIndex(
                            index
                          )
                        }
                        className={`w-2 h-2 rounded-full transition ${
                          index ===
                          carouselIndex
                            ? "bg-red-500 w-5"
                            : "bg-white/50"
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

            {loading ? (

              <div className="space-y-8">

                {[1, 2, 3].map(
                  (section) => (

                    <section
                      key={section}
                    >

                      <div className="h-6 w-48 bg-[#181818] rounded mb-4 animate-pulse" />

                      <div className="flex gap-4 overflow-hidden">

                        {[1, 2, 3, 4].map(
                          (card) => (

                            <div
                              key={card}
                              className="min-w-[250px] h-[280px] bg-[#181818] border border-[#222] rounded-2xl animate-pulse"
                            />

                          )
                        )}

                      </div>

                    </section>

                  )
                )}

              </div>

            ) : stores.length === 0 ? (

              <div className="py-16 text-center">

                <Store
                  size={48}
                  className="mx-auto text-gray-600"
                />

                <h2 className="text-lg font-semibold text-gray-300 mt-4">
                  Todavía no hay
                  emprendimientos
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Cuando se registren
                  emprendimientos
                  aparecerán acá.
                </p>

              </div>

            ) : (

              <>

                <StoreSection
                  title="Nuevos emprendimientos"
                  subtitle="Descubrí los últimos emprendimientos"
                  stores={newStores}
                />

                <section className="mb-6">

                  <h2 className="text-2xl font-bold text-white">
                    Productos
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Explorá emprendimientos
                    según lo que estás
                    buscando
                  </p>

                </section>

                {productCategories.map(
                  (category) => (

                    <StoreSection
                      key={`product-${category}`}
                      title={category}
                      subtitle="Emprendimientos que ofrecen estos productos"
                      stores={getStoresByCategory(
                        category
                      )}
                    />

                  )
                )}

                <section className="mb-6 mt-10">

                  <h2 className="text-2xl font-bold text-white">
                    Servicios
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Encontrá personas y
                    emprendimientos que
                    ofrecen servicios
                  </p>

                </section>

                {serviceCategories.map(
                  (category) => (

                    <StoreSection
                      key={`service-${category}`}
                      title={category}
                      subtitle="Emprendimientos que ofrecen estos servicios"
                      stores={getStoresByCategory(
                        category
                      )}
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