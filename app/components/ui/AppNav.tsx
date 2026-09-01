"use client";

import Link from "next/link";
import { ArrowLeft, Search, Plus } from "lucide-react";
import type { ReactNode } from "react";

type AppNavProps = {
  backHref?: string;
  backLabel?: string;
  maxWidthClassName?: string;
  rightSlot?: ReactNode;
};

export default function AppNav({
  backHref,
  backLabel = "Volver",
  maxWidthClassName = "max-w-6xl",
  rightSlot,
}: AppNavProps) {
  return (
    <nav className="sticky top-0 z-40 bg-[var(--color-surface)]/95 backdrop-blur-xl border-b border-[var(--color-border)]">
      <div
        className={`${maxWidthClassName} mx-auto px-4 py-3 flex items-center gap-3`}
      >
        {backHref ? (
          <Link
            href={backHref}
            className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-brand)] transition-colors no-underline shrink-0"
          >
            <ArrowLeft size={15} />
            {backLabel}
          </Link>
        ) : null}

        <Link
          href="/"
          className="font-extrabold text-2xl tracking-tight text-[var(--color-brand)] no-underline shrink-0"
        >
          AppEmprendedores
        </Link>

        {!backHref && (
          <>
            <div className="flex-1 min-w-0 max-w-xl mx-auto relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] pointer-events-none"
              />

              <input
                type="search"
                placeholder="Buscar..."
                aria-label="Buscar publicaciones"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--color-subtle)] border border-[var(--color-border)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none focus:border-[var(--color-brand)] transition-colors"
              />
            </div>

            <button
              type="button"
              aria-label="Buscar"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-subtle)] border border-[var(--color-border)] text-sm font-semibold text-[var(--color-text)] hover:border-[var(--color-brand)] transition-colors shrink-0"
            >
              <Search size={17} />
              <span className="hidden sm:inline">Buscar</span>
            </button>

            <Link
              href="/sell"
              aria-label="Publicar"
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-brand)] text-white font-semibold hover:opacity-90 transition-opacity no-underline shrink-0"
            >
              <Plus size={20} strokeWidth={2.5} />
              <span className="hidden sm:inline">Publicar</span>
            </Link>
          </>
        )}

        {rightSlot && (
          <div className="ml-auto flex items-center gap-3">
            {rightSlot}
          </div>
        )}
      </div>
    </nav>
  );
}
