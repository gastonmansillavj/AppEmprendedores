"use client";

import Link from "next/link";
import StoreCard, {
  StoreData,
} from "./StoreCard";

export default function StoreSection({
  title,
  subtitle,
  stores,
  favoriteIds,
  currentUserId,
  onToggleFavorite,
  viewAllHref,
  hideHeader = false,
}: {
  title: string;
  subtitle?: string;
  stores: StoreData[];
  favoriteIds: string[];
  currentUserId: string | null;
  onToggleFavorite: (profileId: string) => void;
  viewAllHref?: string;
  hideHeader?: boolean;
}) {
  if (stores.length === 0) return null;

  const visibleStores = stores.slice(0, 4);
  const hasMore = stores.length > 4;

  return (
    
    <section className="mb-10 w-full min-w-0 sm:mb-12">
      {/* =====================================================
          ENCABEZADO
      ===================================================== */}
          {!hideHeader && (
        <div className="mb-4 flex min-w-0 items-end justify-between gap-3 sm:mb-5 sm:gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-xl font-black tracking-tight text-white sm:text-2xl">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-1 line-clamp-2 text-xs leading-4 text-[#888888] sm:text-sm sm:leading-5">
                {subtitle}
              </p>
            )}
          </div>

          <span
            className="
              shrink-0
              border
              border-[#555555]
              px-2
              py-1
              text-[10px]
              font-bold
              text-[#AAAAAA]
              sm:px-2.5
              sm:text-xs
            "
          >
            {stores.length}
          </span>
        </div>
      )}

      {/* =====================================================
          CARRUSEL HORIZONTAL
      ===================================================== */}
      <div
        className="
          -mx-1
          flex
          min-w-0
          items-stretch
          snap-x
          snap-mandatory
          gap-3
          overflow-x-auto
          overscroll-x-contain
          px-1
          pb-4
          pr-6
          scrollbar-hide
          touch-auto
          sm:gap-5
          sm:pr-8
        "
      >
        {/* ===================================================
            EMPRENDIMIENTOS
        =================================================== */}
        {visibleStores.map((store) => (
          <div
            key={store.id}
            className="
              flex
              w-[40%]
              min-w-[40%]
              shrink-0
              snap-start
              items-stretch
              sm:w-[300px]
              sm:min-w-[300px]
              md:w-[320px]
              md:min-w-[320px]
              lg:w-[340px]
              lg:min-w-[340px]
            "
          >
            <StoreCard
              store={store}
              isFavorite={favoriteIds.includes(store.id)}
              isOwnStore={currentUserId === store.id}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}

        {/* ===================================================
            VER MÁS
        =================================================== */}
        {hasMore && viewAllHref && (
          <Link
            href={viewAllHref}
            className="
              flex
              w-[40%]
              min-w-[40%]
              shrink-0
              snap-start
              items-center
              justify-center
              border-2
              border-[#B4232D]
              bg-[#B4232D]
              px-3
              py-6
              text-center
              no-underline
              shadow-[4px_4px_0_#171717]
              transition-all
              duration-200
              hover:translate-x-[2px]
              hover:translate-y-[2px]
              hover:shadow-[2px_2px_0_#171717]
              sm:w-[300px]
              sm:min-w-[300px]
              sm:px-6
              sm:py-8
              md:w-[320px]
              md:min-w-[320px]
              lg:w-[340px]
              lg:min-w-[340px]
            "
          >
            <div className="flex flex-col items-center gap-2 sm:gap-3">
              <span
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  border-2
                  border-white
                  text-xl
                  font-black
                  text-white
                  sm:h-14
                  sm:w-14
                  sm:text-2xl
                "
              >
                →
              </span>

              <div>
                <p className="text-xs font-black uppercase tracking-wide text-white sm:text-lg">
                  Ver más
                </p>

                <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-white/70 sm:text-xs">
                  {title}
                </p>
              </div>
            </div>
          </Link>
        )}
      </div>
    </section>
  );
}