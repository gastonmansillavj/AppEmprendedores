"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Megaphone,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type HomeBannerData = {
  id: string;
  image_url: string;
  title: string | null;
  description: string | null;
  link_url: string | null;
};

export default function HomeBanner() {
  const [banners, setBanners] = useState<HomeBannerData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  async function fetchBanners() {
    setLoading(true);

    const { data, error } = await supabase
      .from("home_banners")
      .select(`
        id,
        image_url,
        title,
        description,
        link_url
      `)
      .eq("is_active", true)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Error obteniendo banners:",
        error
      );

      setBanners([]);
      setLoading(false);
      return;
    }

    setBanners(data || []);
    setCurrentIndex(0);
    setLoading(false);
  }

  useEffect(() => {
    fetchBanners();
  }, []);

  /*
   * Si hay más de un banner,
   * cambiamos automáticamente cada 5 segundos.
   */
  useEffect(() => {
    if (banners.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setCurrentIndex((current) => {
        if (current >= banners.length - 1) {
          return 0;
        }

        return current + 1;
      });
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [banners.length]);

  if (loading) {
    return (
      <section className="mb-10">
        <div className="relative overflow-hidden rounded-3xl h-[220px] md:h-[300px] border border-[#292929] bg-[#111111] animate-pulse" />
      </section>
    );
  }

  /*
   * Si todavía no existe ningún banner,
   * no mostramos nada.
   */
  if (banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  if (!currentBanner) {
    return null;
  }

  const hasLink =
    currentBanner.link_url &&
    currentBanner.link_url.trim().length > 0;

  const bannerContent = (
    <div className="relative overflow-hidden rounded-3xl h-[220px] md:h-[300px] border border-[#292929] bg-[#111111] shadow-[0_12px_40px_rgba(0,0,0,0.35)]">

      <Image
        src={currentBanner.image_url}
        alt={
          currentBanner.title ||
          "Banner de App Emprendedores"
        }
        priority={currentIndex === 0}
        sizes="(max-width: 768px) 100vw, 1200px"
        width={1200}
        height={300}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Oscurecemos la imagen para mejorar la lectura */}
      {(currentBanner.title ||
        currentBanner.description) && (
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/15" />
      )}

      {(currentBanner.title ||
        currentBanner.description) && (
        <div className="absolute inset-0 flex flex-col justify-center px-7 md:px-12 text-white">
          {currentBanner.title && (
            <h1 className="text-3xl md:text-5xl font-black tracking-tight max-w-2xl">
              {currentBanner.title}
            </h1>
          )}

          {currentBanner.description && (
            <p className="mt-3 text-sm md:text-base text-gray-200 max-w-xl">
              {currentBanner.description}
            </p>
          )}
        </div>
      )}

      {/* Flecha anterior */}
      {banners.length > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            setCurrentIndex((current) => {
              if (current === 0) {
                return banners.length - 1;
              }

              return current - 1;
            });
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-[#B4232D] hover:border-[#B4232D] transition-all"
          aria-label="Banner anterior"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Flecha siguiente */}
      {banners.length > 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();

            setCurrentIndex((current) => {
              if (current >= banners.length - 1) {
                return 0;
              }

              return current + 1;
            });
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-black/60 border border-white/20 flex items-center justify-center text-white hover:bg-[#B4232D] hover:border-[#B4232D] transition-all"
          aria-label="Siguiente banner"
        >
          <ChevronRight size={20} />
        </button>
      )}

      {/* Indicadores */}
      {banners.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
          {banners.map((banner, index) => (
            <button
              key={banner.id}
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                setCurrentIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? "bg-[#B4232D] w-7"
                  : "bg-white/40 w-2"
              }`}
              aria-label={`Ir al banner ${
                index + 1
              }`}
            />
          ))}
        </div>
      )}

      {/* Indicador visual cuando no hay texto */}
      {!currentBanner.title &&
        !currentBanner.description && (
          <div className="absolute left-5 top-5 w-9 h-9 rounded-xl bg-black/50 border border-white/20 flex items-center justify-center text-white">
            <Megaphone size={18} />
          </div>
        )}
    </div>
  );

  /*
   * Si el administrador cargó un enlace,
   * todo el banner se vuelve clickeable.
   */
  if (hasLink) {
    const isExternal =
      currentBanner.link_url!.startsWith(
        "http://"
      ) ||
      currentBanner.link_url!.startsWith(
        "https://"
      );

    if (isExternal) {
      return (
        <section className="mb-10">
          <a
            href={currentBanner.link_url!}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            {bannerContent}
          </a>
        </section>
      );
    }

    return (
      <section className="mb-10">
        <Link
          href={currentBanner.link_url!}
          className="block"
        >
          {bannerContent}
        </Link>
      </section>
    );
  }

  return (
    <section className="mb-10">
      {bannerContent}
    </section>
  );
}