"use client";

import Link from "next/link";
import { BellSimpleRinging } from "phosphor-react";

interface AlertsPillProps {
  href: string;
  count?: number;
}

/** Rounded pill next to the page title (same shape as "Proyectar a cierre" in Clientes). */
export function AlertsPill({ href, count }: AlertsPillProps) {
  return (
    <Link
      href={href}
      className="inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-3.5 text-[13px] font-medium text-[#141414] no-underline transition-colors hover:bg-[#f2f2f2] hover:text-[#141414]"
    >
      <BellSimpleRinging size={15} />
      Alertas
      {count !== undefined && count > 0 && (
        <span className="rounded-full bg-[#e5262b] px-1.5 text-[13px] font-semibold leading-[20px] text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
