"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  href?: string;
  label?: string;
};

export default function BackButton({
  href = "/",
  label = "Volver al inicio",
}: BackButtonProps) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="
        flex
        h-10
        w-10
        shrink-0
        items-center
        justify-center
        border-2
        border-[#292929]
        bg-[#111111]
        text-white
        transition-colors
        hover:border-[#B4232D]
        hover:text-[#B4232D]
      "
    >
      <ArrowLeft size={19} strokeWidth={2.5} />
    </Link>
  );
}