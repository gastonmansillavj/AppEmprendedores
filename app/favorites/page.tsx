"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Store } from "lucide-react";

import { supabase } from "@/lib/supabase";
import BottomNav from "../components/ui/BottomNav";

type FavoriteStore = {
  id: string;
  business_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
};

export default function FavoritesPage() {
  const [stores, setStores] = useState<FavoriteStore[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchFavorites() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStores([]);
      setLoading(false);
      return;
    }

    const { data: favorites, error: favoritesError } =
      await supabase
        .from("favorites")
        .select("profile_id")
        .eq("user_id", user.id);

    if (favoritesError) {
      console.error(
        "Error obteniendo favoritos:",
        favoritesError
      );

      setStores([]);
      setLoading(false);
      return;
    }

    const profileIds =
      (favorites || []).map(
        (favorite) => favorite.profile_id
      );

    if (profileIds.length === 0) {
      setStores([]);
      setLoading(false);
      return;
    }

    const { data: profiles, error: profilesError } =
      await supabase
        .from("profiles")
        .select(`
          id,
          business_name,
          username,
          avatar_url,
          bio,
          city
        `)
        .in("id", profileIds);

    if (profilesError) {
      console.error(
        "Error obteniendo emprendimientos favoritos:",
        profilesError
      );

      setStores([]);
      setLoading(false);
      return;
    }

    setStores(profiles || []);
    setLoading(false);
  }

  async function removeFavorite(profileId: string) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

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

    setStores((current) =>
      current.filter(
        (store) => store.id !== profileId
      )
    );
  }

  useEffect(() => {
    fetchFavorites();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      fetchFavorites();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-gray-100 pb-24">
      <header className="sticky top-0 z-50 bg-black/95 backdrop-blur border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-white">
            Mis favoritos
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Emprendimientos que guardaste
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
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
          <div className="py-20 text-center">
            <Heart
              size={52}
              className="mx-auto text-gray-600"
            />

            <h2 className="text-xl font-semibold text-gray-300 mt-4">
              Todavía no tenés favoritos
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Guardá emprendimientos tocando el ❤️
              para encontrarlos fácilmente acá.
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center mt-6 px-5 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold transition"
            >
              Explorar emprendimientos
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Emprendimientos guardados
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  {stores.length}{" "}
                  {stores.length === 1
                    ? "emprendimiento"
                    : "emprendimientos"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {stores.map((store) => {
                const businessName =
                  store.business_name?.trim() ||
                  store.username?.trim() ||
                  "Emprendimiento";

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
                            src={store.avatar_url}
                            alt={businessName}
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

                    <button
                      type="button"
                      onClick={() =>
                        removeFavorite(store.id)
                      }
                      className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/70 flex items-center justify-center hover:bg-black transition"
                      aria-label="Quitar de favoritos"
                    >
                      <Heart
                        size={20}
                        className="fill-red-500 text-red-500"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
