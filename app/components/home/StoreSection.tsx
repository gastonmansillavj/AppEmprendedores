"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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
  const carouselRef = useRef<HTMLDivElement>(null);

  const canScroll =
    stores.length > 3 || Boolean(viewAllHref);

  const [canScrollLeft, setCanScrollLeft] =
    useState(false);

  const [canScrollRight, setCanScrollRight] =
    useState(false);

  const [isDesktop, setIsDesktop] =
    useState(false);

  const SCROLL_TOLERANCE = 4;

  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();

    window.addEventListener(
      "resize",
      checkScreenSize
    );

    return () => {
      window.removeEventListener(
        "resize",
        checkScreenSize
      );
    };
  }, []);

  const updateScrollState = useCallback(() => {
    const container = carouselRef.current;

    if (!container) return;

    const {
      scrollLeft,
      scrollWidth,
      clientWidth,
    } = container;

    const maxScroll =
      scrollWidth - clientWidth;

    const overflows =
      maxScroll > SCROLL_TOLERANCE;

    if (!overflows) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    setCanScrollLeft(
      scrollLeft > SCROLL_TOLERANCE
    );

    setCanScrollRight(
      scrollLeft <
        maxScroll - SCROLL_TOLERANCE
    );
  }, []);

  useEffect(() => {
    if (!canScroll) return;

    const container = carouselRef.current;

    if (!container) return;

    const cleanupRafs: number[] = [];

    const raf1 = requestAnimationFrame(() => {
      const raf2 = requestAnimationFrame(
        updateScrollState
      );

      cleanupRafs.push(raf2);
    });

    cleanupRafs.push(raf1);

    container.addEventListener(
      "scroll",
      updateScrollState,
      { passive: true }
    );

    window.addEventListener(
      "resize",
      updateScrollState
    );

    let observer: ResizeObserver | undefined;

    if (
      typeof ResizeObserver !==
      "undefined"
    ) {
      observer = new ResizeObserver(
        updateScrollState
      );

      observer.observe(container);

      Array.from(
        container.children
      ).forEach((child) =>
        observer!.observe(child)
      );
    }

    return () => {
      cleanupRafs.forEach((id) =>
        cancelAnimationFrame(id)
      );

      container.removeEventListener(
        "scroll",
        updateScrollState
      );

      window.removeEventListener(
        "resize",
        updateScrollState
      );

      observer?.disconnect();
    };
  }, [
    canScroll,
    updateScrollState,
    stores.length,
  ]);

  if (stores.length === 0) return null;

  const visibleStores =
    stores.slice(0, 5);

  const scrollCarousel = (
    direction: "left" | "right"
  ) => {
    if (!carouselRef.current) return;

    const container =
      carouselRef.current;

    const firstCard =
      container.querySelector<HTMLElement>(
        "[data-store-card]"
      );

    if (!firstCard) return;

    const cardWidth =
      firstCard.getBoundingClientRect()
        .width;

    const styles =
      window.getComputedStyle(
        container
      );

    const gap =
      parseFloat(
        styles.columnGap
      ) ||
      parseFloat(styles.gap) ||
      0;

    const amount =
      cardWidth + gap;

    const maxScroll =
      container.scrollWidth -
      container.clientWidth;

    let targetScroll =
      container.scrollLeft;

    if (direction === "right") {
      targetScroll =
        container.scrollLeft + amount;

      if (targetScroll > maxScroll) {
        targetScroll = maxScroll;
      }
    } else {
      targetScroll =
        container.scrollLeft - amount;

      if (targetScroll < 0) {
        targetScroll = 0;
      }
    }

    container.scrollTo({
      left: targetScroll,
      behavior: "smooth",
    });
  };

  return (
    <section className="mb-10 w-full min-w-0 sm:mb-12">

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

          <span className="shrink-0 border border-[#555555] px-2 py-1 text-[10px] font-bold text-[#AAAAAA] sm:px-2.5 sm:text-xs">
            {stores.length}
          </span>
        </div>
      )}

      <div className="group relative min-w-0">

        {/* CARRUSEL */}

        <div
          ref={carouselRef}
className="
  -mx-4 flex min-w-0 items-stretch snap-x snap-mandatory
  gap-1 overflow-x-auto overscroll-x-contain
  px-0 pb-4 pr-2 scrollbar-hide touch-pan-x
  sm:gap-3 sm:pr-2
"
        >

          {visibleStores.map(
            (store, index) => (
              <div
                key={store.id}
                data-store-card
                className={`
                  ${
                    index >= 3
                      ? "flex sm:hidden"
                      : "flex"
                  }
                  w-[45%]
                  min-w-[45%]
                  shrink-0
                  snap-start
                  items-stretch

                  sm:w-[31%]
                  sm:min-w-[31%]

                  lg:w-[340px]
                  lg:min-w-[340px]
                `}
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
                    onToggleFavorite
                  }
                />
              </div>
            )
          )}

          {/* VER TODOS */}

          {viewAllHref && (
            <Link
              href={viewAllHref}
              aria-label={`Ver todos los emprendimientos de ${title}`}
              className="
                group
                relative
                flex
                w-[45%]
                min-w-[45%]
                shrink-0
                snap-start
                items-center
                justify-center
                overflow-hidden
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

                sm:w-[31%]
                sm:min-w-[31%]
                sm:px-6
                sm:py-8

                lg:w-[340px]
                lg:min-w-[340px]
              "
            >
              <div className="flex flex-col items-center gap-2 sm:gap-3">

                <span className="flex h-10 w-10 items-center justify-center border-2 border-white text-xl font-black text-white sm:h-14 sm:w-14 sm:text-2xl">
                  →
                </span>

                <div>

                  <p className="text-xs font-black uppercase tracking-wide text-white sm:text-lg">
                    Ver todos
                  </p>

                  <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-white/70 sm:text-xs">
                    {title}
                  </p>

                </div>
              </div>
            </Link>
          )}

        </div>

        {/* FLECHA IZQUIERDA - SOLO PC */}

        {isDesktop && (
          <button
            type="button"
            aria-label="Ver emprendimientos anteriores"
            disabled={!canScrollLeft}
            onClick={() =>
              scrollCarousel("left")
            }
            onMouseEnter={(event) => {
              if (!canScrollLeft) return;

              const button =
                event.currentTarget;

              button.style.backgroundColor =
                "#B4232D";

              button.style.color =
                "#FFFFFF";

              button.style.transform =
                "translate(-3px, calc(-50% - 3px))";

              button.style.boxShadow =
                "5px 5px 0 #171717";
            }}
            onMouseLeave={(event) => {
              const button =
                event.currentTarget;

              button.style.backgroundColor =
                "#FFFFFF";

              button.style.color =
                "#171717";

              button.style.transform =
                "translate(-50%, -50%)";

              button.style.boxShadow =
                "3px 3px 0 #171717";
            }}
            onMouseDown={(event) => {
              if (!canScrollLeft) return;

              const button =
                event.currentTarget;

              button.style.transform =
                "translate(-48%, calc(-50% + 1px))";

              button.style.boxShadow =
                "2px 2px 0 #171717";
            }}
            onMouseUp={(event) => {
              if (!canScrollLeft) return;

              const button =
                event.currentTarget;

              button.style.transform =
                "translate(-3px, calc(-50% - 3px))";

              button.style.boxShadow =
                "5px 5px 0 #171717";
            }}
            style={{
              position: "absolute",
              left: "0",
              top: "calc(50% - 10px)",
              zIndex: 50,
              display: "flex",
              width: "50px",
              height: "50px",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #171717",
              backgroundColor: "#FFFFFF",
              color: "#171717",
              fontSize: "28px",
              fontWeight: 900,
              lineHeight: 1,
              cursor: canScrollLeft
                ? "pointer"
                : "default",
              opacity: canScrollLeft
                ? 1
                : 0.2,
              boxShadow:
                "3px 3px 0 #171717",
              transform:
                "translate(-50%, -50%)",
              transition:
                "transform 150ms ease, background-color 150ms ease, color 150ms ease, box-shadow 150ms ease, opacity 150ms ease",
            }}
          >
            ←
          </button>
        )}

        {/* FLECHA DERECHA - SOLO PC */}

        {isDesktop && (
          <button
            type="button"
            aria-label="Ver más emprendimientos"
            disabled={!canScrollRight}
            onClick={() =>
              scrollCarousel("right")
            }
            onMouseEnter={(event) => {
              if (!canScrollRight) return;

              const button =
                event.currentTarget;

              button.style.backgroundColor =
                "#B4232D";

              button.style.color =
                "#FFFFFF";

              button.style.transform =
                "translate(3px, calc(-50% - 3px))";

              button.style.boxShadow =
                "-5px 5px 0 #171717";
            }}
            onMouseLeave={(event) => {
              const button =
                event.currentTarget;

              button.style.backgroundColor =
                "#FFFFFF";

              button.style.color =
                "#171717";

              button.style.transform =
                "translateY(-50%)";

              button.style.boxShadow =
                "-3px 3px 0 #171717";
            }}
            onMouseDown={(event) => {
              if (!canScrollRight) return;

              const button =
                event.currentTarget;

              button.style.transform =
                "translate(5px, calc(-50% + 1px))";

              button.style.boxShadow =
                "-2px 2px 0 #171717";
            }}
            onMouseUp={(event) => {
              if (!canScrollRight) return;

              const button =
                event.currentTarget;

              button.style.transform =
                "translate(3px, calc(-50% - 3px))";

              button.style.boxShadow =
                "-5px 5px 0 #171717";
            }}
            style={{
              position: "absolute",
              right: "10px",
              top: "calc(50% - 10px)",
              zIndex: 50,
              display: "flex",
              width: "50px",
              height: "50px",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #171717",
              backgroundColor: "#FFFFFF",
              color: "#171717",
              fontSize: "28px",
              fontWeight: 900,
              lineHeight: 1,
              cursor: canScrollRight
                ? "pointer"
                : "default",
              opacity: canScrollRight
                ? 1
                : 0.2,
              boxShadow:
                "-3px 3px 0 #171717",
              transition:
                "transform 150ms ease, background-color 150ms ease, color 150ms ease, box-shadow 150ms ease, opacity 150ms ease",
            }}
          >
            →
          </button>
        )}

        {/* INDICADOR PC */}

        {canScroll && (
          <div className="pointer-events-none absolute bottom-0 left-1/2 hidden -translate-x-1/2 translate-y-1/2 sm:block">
            <div className="h-1 w-16 bg-[#B4232D]" />
          </div>
        )}

      </div>
    </section>
  );
}