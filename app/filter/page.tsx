"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Heart,
  Store,
  SlidersHorizontal,
} from "lucide-react";

import { supabase } from "@/lib/supabase";
import BottomNav from "../components/ui/BottomNav";

type StoreData = {
  id: string;
  business_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
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

export default function FilterPage() {
  const [type, setType] = useState<
    "all" | "product" | "service"
  >("all");

  const [category, setCategory] = useState("");

  const [ships, setShips] = useState<
    "all" | "yes" | "no"
  >("all");

  const [stores, setStores] = useState<StoreData[]>([]);

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);

  const categories =
    type === "product"
      ? productCategories
      : type === "service"
      ? serviceCategories
      : [
          ...productCategories,
          ...serviceCategories.filter(
            (item) =>
              !productCategories.includes(item)
          ),
        ];

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCurrentUserId(null);
      setFavoriteIds([]);
      return;
    }

    setCurrentUserId(user.id);

    const { data, error } = await supabase
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
        (favorite) => favorite.profile_id
      )
    );
  }

  async function toggleFavorite(profileId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/auth";
      return;
    }

    if (profileId === user.id) {
      return;
    }

    const isFavorite =
      favoriteIds.includes(profileId);

    if (isFavorite) {
      const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("profile_id", profileId);

      if (error) {
        console.error(
          "Error quitando favorito:",
          error
        );
        return;
      }

      setFavoriteIds((current) =>
        current.filter(
          (id) => id !== profileId
        )
      );
    } else {
      const { error } = await supabase
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

      setFavoriteIds((current) => [
        ...current,
        profileId,
      ]);
    }
  }

  async function applyFilters() {
    setLoading(true);

    /*
     * Primero obtenemos los perfiles.
     *
     * Si se selecciona envío, filtramos directamente
     * sobre profiles porque ships pertenece al perfil.
     */
    let profilesQuery = supabase
      .from("profiles")
      .select(`
        id,
        business_name,
        username,
        avatar_url,
        bio,
        city
      `);

    if (ships === "yes") {
      profilesQuery = profilesQuery.eq(
        "ships",
        true
      );
    }

    if (ships === "no") {
      profilesQuery = profilesQuery.eq(
        "ships",
        false
      );
    }

    const {
      data: profiles,
      error: profilesError,
    } = await profilesQuery;

    if (profilesError) {
      console.error(
        "Error obteniendo perfiles:",
        profilesError
      );

      setStores([]);
      setLoading(false);
      return;
    }

    if (!profiles || profiles.length === 0) {
      setStores([]);
      setLoading(false);
      return;
    }

    /*
     * Si no hay filtros de publicaciones,
     * mostramos todos los perfiles obtenidos.
     */
    if (type === "all" && !category) {
      setStores(profiles);
      setLoading(false);
      return;
    }

    /*
     * Buscamos publicaciones que coincidan
     * con tipo y/o categoría.
     */
    let listingsQuery = supabase
      .from("listings")
      .select(`
        seller_id,
        type,
        category
      `)
      .eq("sold", false);

    /*
     * IMPORTANTE:
     * sell/page.tsx guarda:
     *
     * "Producto"
     * "Servicio"
     *
     * No "Productos" ni "Servicios".
     */
    if (type === "product") {
      listingsQuery = listingsQuery.eq(
        "type",
        "Producto"
      );
    }

    if (type === "service") {
      listingsQuery = listingsQuery.eq(
        "type",
        "Servicio"
      );
    }

    if (category) {
      listingsQuery = listingsQuery.eq(
        "category",
        category
      );
    }

    const {
      data: listings,
      error: listingsError,
    } = await listingsQuery;

    if (listingsError) {
      console.error(
        "Error obteniendo publicaciones:",
        listingsError
      );

      setStores([]);
      setLoading(false);
      return;
    }

    const sellerIds = [
      ...new Set(
        (listings || []).map(
          (listing) => listing.seller_id
        )
      ),
    ];

    if (sellerIds.length === 0) {
      setStores([]);
      setLoading(false);
      return;
    }

    const filteredStores =
      profiles.filter((profile) =>
        sellerIds.includes(profile.id)
      );

    setStores(filteredStores);
    setLoading(false);
  }

  function clearFilters() {
    setType("all");
    setCategory("");
    setShips("all");
    setStores([]);
  }

  useEffect(() => {
    loadUser();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(() => {
        loadUser();
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  /*
   * Cuando cambia el tipo, la categoría anterior
   * podría dejar de pertenecer al nuevo tipo.
   */
  useEffect(() => {
    if (
      category &&
      !categories.includes(category)
    ) {
      setCategory("");
    }
  }, [type]);

  return (
    <div className="min-h-screen bg-black text-gray-100 pb-24">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-10 h-10 rounded-full bg-[#181818] border border-[#2a2a2a] flex items-center justify-center hover:border-red-500 transition"
              aria-label="Volver al inicio"
            >
              <ArrowLeft size={20} />
            </Link>

            <div>
              <h1 className="text-2xl font-bold text-white">
                Filtrar
              </h1>

              <p className="text-sm text-gray-500">
                Encontrá emprendimientos según lo que buscás
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
        <section className="bg-[#111111] border border-[#2a2a2a] rounded-2xl p-5 md:p-6">
          <div className="flex items-center gap-2 mb-6">
            <SlidersHorizontal
              size={20}
              className="text-red-500"
            />

            <h2 className="text-lg font-semibold text-white">
              Filtros
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tipo
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType("all");
                    setCategory("");
                  }}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    type === "all"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-[#181818] border-[#2a2a2a] text-gray-400 hover:border-red-500/50"
                  }`}
                >
                  Todos
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType("product");
                    setCategory("");
                  }}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    type === "product"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-[#181818] border-[#2a2a2a] text-gray-400 hover:border-red-500/50"
                  }`}
                >
                  Productos
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setType("service");
                    setCategory("");
                  }}
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    type === "service"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-[#181818] border-[#2a2a2a] text-gray-400 hover:border-red-500/50"
                  }`}
                >
                  Servicios
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Categoría
              </label>

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value
                  )
                }
                className="w-full h-12 px-4 rounded-xl border border-[#2a2a2a] bg-[#181818] text-white outline-none focus:border-red-500"
              >
                <option value="">
                  Todas las categorías
                </option>

                {categories.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Envíos
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShips("all")
                  }
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    ships === "all"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-[#181818] border-[#2a2a2a] text-gray-400 hover:border-red-500/50"
                  }`}
                >
                  Cualquiera
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShips("yes")
                  }
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    ships === "yes"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-[#181818] border-[#2a2a2a] text-gray-400 hover:border-red-500/50"
                  }`}
                >
                  Con envío
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setShips("no")
                  }
                  className={`px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    ships === "no"
                      ? "bg-red-600 border-red-600 text-white"
                      : "bg-[#181818] border-[#2a2a2a] text-gray-400 hover:border-red-500/50"
                  }`}
                >
                  Sin envío
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={applyFilters}
                className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition"
              >
                Aplicar filtros
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="h-12 px-6 rounded-xl border border-[#2a2a2a] bg-[#181818] text-gray-300 hover:border-red-500/50 transition"
              >
                Limpiar
              </button>
            </div>
          </div>
        </section>

        <section className="mt-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-[280px] bg-[#181818] border border-[#222] rounded-2xl animate-pulse"
                />
              ))}
            </div>
          ) : stores.length === 0 ? (
            <div className="py-16 text-center">
              <Store
                size={48}
                className="mx-auto text-gray-600"
              />

              <h2 className="text-lg font-semibold text-gray-300 mt-4">
                No hay resultados
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Probá combinando otros filtros.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Resultados
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {stores.length}{" "}
                    {stores.length === 1
                      ? "emprendimiento encontrado"
                      : "emprendimientos encontrados"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {stores.map((store) => {
                  const businessName =
                    store.business_name?.trim() ||
                    store.username?.trim() ||
                    "Emprendimiento";

                  const isFavorite =
                    favoriteIds.includes(
                      store.id
                    );

                  const isOwnStore =
                    currentUserId ===
                    store.id;

                  return (
                    <div
                      key={store.id}
                      className="relative bg-[#111111] border border-[#2a2a2a] rounded-2xl overflow-hidden hover:border-red-500/50 hover:shadow-lg hover:shadow-red-900/10 transition-all"
                    >
                      <Link
                        href={`/store/${store.id}`}
                      >
                        <div className="h-[180px] bg-[#181818] flex items-center justify-center">
                          {store.avatar_url ? (
                            <Image
                              src={
                                store.avatar_url
                              }
                              alt={
                                businessName
                              }
                              width={400}
                              height={180}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Store
                              size={52}
                              className="text-gray-600"
                            />
                          )}
                        </div>

                        <div className="p-4 pr-14">
                          <h3 className="font-semibold text-white truncate">
                            {businessName}
                          </h3>

                          {store.bio && (
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {store.bio}
                            </p>
                          )}

                          {store.city && (
                            <p className="text-xs text-gray-500 mt-3">
                              {store.city}
                            </p>
                          )}

                          <p className="text-sm font-medium text-red-500 mt-3">
                            Ver tienda →
                          </p>
                        </div>
                      </Link>

                      {!isOwnStore && (
                        <button
                          type="button"
                          onClick={() =>
                            toggleFavorite(
                              store.id
                            )
                          }
                          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center hover:bg-black transition"
                          aria-label={
                            isFavorite
                              ? "Quitar de favoritos"
                              : "Agregar a favoritos"
                          }
                        >
                          <Heart
                            size={20}
                            className={
                              isFavorite
                                ? "fill-red-500 text-red-500"
                                : "text-white"
                            }
                          />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>
      </main>

      <BottomNav />
    </div>
  );
}