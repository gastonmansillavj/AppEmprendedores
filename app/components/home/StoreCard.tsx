"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Store,
  Heart,
  ArrowUpRight,
  X,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

export type StoreData = {
  id: string;
  businessName: string;
  username: string;
  logo: string | null;
  bio: string;
  city: string;
  categories: string[];
  latestListingAt: string;
};

export default function StoreCard({
  store,
  isFavorite,
  isOwnStore,
  onToggleFavorite,
}: {
  store: StoreData;
  isFavorite: boolean;
  isOwnStore: boolean;
  onToggleFavorite: (profileId: string) => void;
}) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  const openCard = () => setIsExpanded(true);
  const closeCard = () => setIsExpanded(false);
  const visitStore = () => router.push(`/store/${store.id}`);

  const handleFavoriteClick = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    onToggleFavorite(store.id);
  };

  return (
    <>
      <article
        onClick={openCard}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openCard();
          }
        }}
        className="group relative flex h-full w-full min-w-0 flex-col cursor-pointer overflow-hidden border-2 border-[#171717] bg-white shadow-[5px_5px_0_#171717] transition-all duration-200 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_#171717]"
      >
        {/* TOLDO */}
        <div className="relative flex h-7 shrink-0 border-b-2 border-[#171717] sm:h-8">
          <div className="flex-1 bg-[#B4232D]" />
          <div className="flex-1 bg-[#F2F0EB]" />
          <div className="flex-1 bg-[#B4232D]" />
          <div className="flex-1 bg-[#F2F0EB]" />
          <div className="flex-1 bg-[#B4232D]" />
          <div className="flex-1 bg-[#F2F0EB]" />
          <div className="flex-1 bg-[#B4232D]" />

          {/* FAVORITO - CELULAR: CENTRO DEL TOLDO */}
          {!isOwnStore && !isDesktop && (
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="absolute left-1/2 top-1/2 z-20 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#171717] bg-white shadow-[2px_2px_0_#171717] transition-all hover:shadow-[1px_1px_0_#171717]"
              aria-label={
                isFavorite
                  ? "Quitar de favoritos"
                  : "Agregar a favoritos"
              }
            >
              <Heart
                size={14}
                strokeWidth={2.5}
                className={
                  isFavorite
                    ? "fill-[#B4232D] text-[#B4232D]"
                    : "text-[#171717]"
                }
              />
            </button>
          )}
        </div>

        {/* IMAGEN */}
        <div className="relative aspect-[4/3] w-full shrink-0 bg-[#F2F0EB]">
          {store.logo ? (
            <Image
              src={store.logo}
              alt={store.businessName}
              fill
              sizes="
                (max-width: 640px) 44vw,
                (max-width: 768px) 300px,
                (max-width: 1024px) 320px,
                340px
              "
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <Store
                size={42}
                strokeWidth={1.5}
                className="text-[#777777]"
              />
            </div>
          )}

          {/* FAVORITO - PC: ESQUINA SUPERIOR DERECHA DE LA IMAGEN */}
          {!isOwnStore && isDesktop && (
            <button
              type="button"
              onClick={handleFavoriteClick}
              className="absolute right-2 top-2 z-20 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#171717] bg-white shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#171717]"
              aria-label={
                isFavorite
                  ? "Quitar de favoritos"
                  : "Agregar a favoritos"
              }
            >
              <Heart
                size={14}
                strokeWidth={2.5}
                className={
                  isFavorite
                    ? "fill-[#B4232D] text-[#B4232D]"
                    : "text-[#171717]"
                }
              />
            </button>
          )}
        </div>

        {/* INFORMACIÓN */}
        <div className="flex flex-1 flex-col p-3 sm:p-4 md:p-5">
          <h3 className="truncate text-base font-black tracking-tight text-[#171717] sm:text-lg md:text-xl">
            {store.businessName}
          </h3>

          {store.bio && (
            <p className="mt-1.5 line-clamp-2 text-xs leading-4 text-[#555555] sm:mt-2 sm:text-sm sm:leading-5">
              {store.bio}
            </p>
          )}

          {/* VER MÁS */}
          <div className="mt-auto flex w-full items-end justify-center pt-4 sm:pt-5">
            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                visitStore();
              }}
              className="flex shrink-0 items-center justify-center gap-1 border-2 border-[#171717] bg-[#B4232D] px-2 py-2 text-[9px] font-black uppercase tracking-wide text-white shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#171717] sm:gap-1.5 sm:px-3 sm:text-xs sm:shadow-[3px_3px_0_#171717]"
            >
              Ver más

              <ArrowUpRight
                size={13}
                strokeWidth={3}
                className="sm:h-[15px] sm:w-[15px]"
              />
            </button>
          </div>
        </div>
      </article>

      {/* MODAL */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black/85 p-2 backdrop-blur-sm sm:p-4"
          onClick={closeCard}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={store.businessName}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="relative flex max-h-[calc(100vh-16px)] w-full max-w-[520px] flex-col overflow-hidden border-2 border-[#171717] bg-white shadow-[5px_5px_0_#171717] sm:max-h-[calc(100vh-32px)] sm:shadow-[8px_8px_0_#171717]"
          >
            {/* CERRAR */}
            <button
              type="button"
              onClick={closeCard}
              aria-label="Cerrar"
              className="absolute right-2 top-2 z-30 flex h-10 w-10 items-center justify-center border-2 border-[#171717] bg-white text-[#171717] shadow-[2px_2px_0_#171717] transition-all hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0_#171717] sm:right-3 sm:top-3 sm:h-11 sm:w-11 sm:shadow-[3px_3px_0_#171717]"
            >
              <X size={20} strokeWidth={3} />
            </button>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              {/* TOLDO DEL MODAL */}
              <div className="flex h-8 shrink-0 border-b-2 border-[#171717] sm:h-9">
                <div className="flex-1 bg-[#B4232D]" />
                <div className="flex-1 bg-[#F2F0EB]" />
                <div className="flex-1 bg-[#B4232D]" />
                <div className="flex-1 bg-[#F2F0EB]" />
                <div className="flex-1 bg-[#B4232D]" />
                <div className="flex-1 bg-[#F2F0EB]" />
                <div className="flex-1 bg-[#B4232D]" />
              </div>

              {/* IMAGEN DEL MODAL */}
              <div className="relative aspect-[16/9] w-full bg-[#F2F0EB]">
                {store.logo ? (
                  <Image
                    src={store.logo}
                    alt={store.businessName}
                    fill
                    sizes="(max-width: 640px) 100vw, 520px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Store
                      size={56}
                      strokeWidth={1.5}
                      className="text-[#777777] sm:h-16 sm:w-16"
                    />
                  </div>
                )}
              </div>

              {/* CONTENIDO DEL MODAL */}
              <div className="p-4 sm:p-6">
                {store.categories.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
                    {store.categories.map(
                      (category) => (
                        <span
                          key={category}
                          className="max-w-full truncate border border-[#171717] bg-[#F2F0EB] px-2 py-1 text-[9px] font-bold uppercase tracking-wide text-[#171717] sm:px-2.5 sm:text-[10px]"
                        >
                          {category}
                        </span>
                      )
                    )}
                  </div>
                )}

                <h2 className="break-words text-2xl font-black leading-tight tracking-tight text-[#171717] sm:text-3xl">
                  {store.businessName}
                </h2>

                {store.username && (
                  <p className="mt-1 text-xs font-semibold text-[#888888] sm:text-sm">
                    @{store.username}
                  </p>
                )}

                {store.bio && (
                  <p className="mt-3 text-sm leading-5 text-[#555555] sm:mt-4 sm:text-base sm:leading-6">
                    {store.bio}
                  </p>
                )}

                <button
                  type="button"
                  onClick={visitStore}
                  className="mt-5 flex w-full items-center justify-center gap-2 border-2 border-[#171717] bg-[#B4232D] px-4 py-3 text-xs font-black uppercase tracking-wide text-white shadow-[3px_3px_0_#171717] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#171717] sm:mt-6 sm:py-3.5 sm:text-sm sm:shadow-[4px_4px_0_#171717]"
                >
                  Visitar tienda

                  <ArrowUpRight
                    size={17}
                    strokeWidth={3}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}