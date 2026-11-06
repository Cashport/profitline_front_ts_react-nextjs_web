"use client";

import Link from "next/link";
import { ComponentType } from "react";
import { ChevronRight } from "lucide-react";

export type AdminSection = {
  href: string;
  icon: ComponentType<{ size?: string | number; className?: string }>;
  label: string;
  description: string;
  disabled?: boolean;
  /** Tamaño del ícono en px (18 por defecto). */
  iconSize?: number;
};

/** Tarjeta con las opciones de administración; las líneas entre opciones salen del gap de 1px sobre --cp-line. */
export default function AdminSectionsGrid({ sections }: { sections: AdminSection[] }) {
  return (
    <section className="cp-card overflow-hidden">
      <div className="grid grid-cols-1 gap-px bg-cp-line md:grid-cols-2">
        {sections.map(({ href, icon: Icon, label, description, disabled, iconSize = 18 }) => {
          const inner = (
            <div
              className={`group flex h-full items-center gap-4 bg-cp-surface px-6 py-5 transition-colors ${
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-cp-subtle"
              }`}
            >
              <div
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-cp-muted transition-colors ${
                  disabled ? "" : "group-hover:bg-cp-lime"
                }`}
              >
                <Icon
                  size={iconSize}
                  className={`transition-colors ${
                    disabled ? "text-cp-ink-4" : "text-cp-ink group-hover:text-[#141414]"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-cp-ink">{label}</p>
                <p className="mt-0.5 text-[13px] leading-snug text-cp-ink-3">{description}</p>
              </div>

              {!disabled && (
                <ChevronRight
                  size={16}
                  className="flex-shrink-0 text-cp-ink-4 transition-colors group-hover:text-cp-ink"
                />
              )}
            </div>
          );

          return disabled ? (
            <div key={label}>{inner}</div>
          ) : (
            <Link key={label} href={href} className="block">
              {inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
