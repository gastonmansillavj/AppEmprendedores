"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Store } from "lucide-react";

import { supabase } from "@/lib/supabase";
import StoreCard, {
  StoreData,
} from "../components/home/StoreCard";
import BottomNav from "../components/ui/BottomNav";
import BackButton from "../components/ui/BackButton";

export default function EmprendimientosPage() {
  const searchParams = useSearchParams();

  const categoryParam = searchParams.get("categoria");

  const [stores, setStores] = useState<StoreData[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  /* =====================================================
     CATEGORÍA ACTIVA
     ===================================================== */

  const selectedCategory = categoryParam?.trim() || null;

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
      `)
      .eq("status", "activo");

    if (profilesError || !profiles) {
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

    const storesMap = new Map<string, StoreData>();

    for (const profile of profiles) {
      const businessName =
        profile.business_name?.trim() ||
        profile.username?.trim() ||
        "Emprendimiento";

      storesMap.set(profile.id, {
        id: profile.id,
        businessName,
        username: profile.username || "",
        logo: profile.avatar_url,
        bio: profile.bio || "",
        city: profile.city || "Rafaela",
        categories: [],
        latestListingAt:
          "1970-01-01T00:00:00.000Z",
      });
    }

    if (listings) {
      for (const listing of listings) {
        const store = storesMap.get(listing.seller_id);

        if (!store) continue;

        if (
          listing.category &&
          !store.categories.includes(listing.category)
        ) {
          store.categories.push(listing.category);
        }

        if (
          new Date(listing.created_at).getTime() >
          new Date(store.latestListingAt).getTime()
        ) {
          store.latestListingAt = listing.created_at;
        }
      }
    }

    const storesArray = Array.from(storesMap.values());

    storesArray.sort((a, b) => {
      return (
        new Date(b.latestListingAt).getTime() -
        new Date(a.latestListingAt).getTime()
      );
    });

    setStores(storesArray);
    setLoading(false);
  }

  /* =====================================================
     AUTENTICACIÓN
     ===================================================== */

  async function fetchUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCurrentUserId(null);
      setFavoriteIds([]);
      return;
    }

    setCurrentUserId(user.id);

    const {
      data,
      error,
    } = await supabase
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

  /* =====================================================
     FAVORITOS
     ===================================================== */

  async function toggleFavorite(profileId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return;
    }

    const isFavorite = favoriteIds.includes(profileId);

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

  /* =====================================================
     INICIO
     ===================================================== */

  useEffect(() => {
    fetchStores();
    fetchUser();

    const {
      data: authListener,
    } = supabase.auth.onAuthStateChange(
      async () => {
        await fetchUser();
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /* =====================================================
     FILTRAR POR CATEGORÍA
     ===================================================== */

  const filteredStores = useMemo(() => {
    return stores.filter((store) => {
      if (
        selectedCategory &&
        !store.categories.some(
          (category) =>
            category.toLowerCase() ===
            selectedCategory.toLowerCase()
        )
      ) {
        return false;
      }

      return true;
    });
  }, [stores, selectedCategory]);

  return (
    <div className="min-h-screen bg-black text-gray-100 pb-24">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header className="sticky top-0 z-50 border-b border-[#242424] bg-black/95 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center gap-3">

            <BackButton />

            <div className="min-w-0 flex-1">
              <h1 className="truncate text-xl font-black tracking-tight text-white sm:text-2xl">
                {selectedCategory ||
                  "Emprendimientos"}
              </h1>

              <p className="text-xs text-[#888888] sm:text-sm">
                {selectedCategory
                  ? `Emprendimientos de ${selectedCategory}`
                  : "Descubrí emprendimientos de Rafaela"}
              </p>
            </div>

            <span className="shrink-0 border border-[#555555] px-2 py-1 text-[10px] font-bold text-[#AAAAAA] sm:px-3 sm:text-xs">
              {filteredStores.length}
            </span>
          </div>
        </div>
      </header>

      {/* =====================================================
          CONTENIDO
          ===================================================== */}

      <main className="mx-auto max-w-7xl px-4 pt-6">

        {/* =====================================================
            LOADING
            ===================================================== */}

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(
              (item) => (
                <div
                  key={item}
                  className="h-[360px] animate-pulse border-2 border-[#202020] bg-[#111111]"
                />
              )
            )}
          </div>
        ) : filteredStores.length === 0 ? (

          /* =====================================================
             SIN RESULTADOS
             ===================================================== */

          <div className="py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-[#292929] bg-[#111111]">
              <Store
                size={30}
                className="text-[#555555]"
              />
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              {selectedCategory
                ? `No hay emprendimientos de ${selectedCategory}`
                : "Todavía no hay emprendimientos"}
            </h2>

            <p className="mt-2 text-sm text-[#666666]">
              {selectedCategory
                ? "Probá con otra categoría."
                : "Cuando se registren emprendimientos aparecerán acá."}
            </p>

            {selectedCategory && (
              <a
                href="/emprendimientos"
                className="mt-6 inline-flex border-2 border-[#B4232D] bg-[#B4232D] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#951D26]"
              >
                Ver todos los emprendimientos
              </a>
            )}
          </div>

        ) : (

          /* =====================================================
             GRID
             ===================================================== */

          <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {filteredStores.map(
              (store) => (
                <div
                  key={store.id}
                  className="flex min-w-0 items-stretch"
                >
                  <StoreCard
                    store={store}
                    isFavorite={favoriteIds.includes(
                      store.id
                    )}
                    isOwnStore={
                      currentUserId ===
                      store.id
                    }
                    onToggleFavorite={
                      toggleFavorite
                    }
                  />
                </div>
              )
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}