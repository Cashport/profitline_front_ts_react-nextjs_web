"use client";

import Link from "next/link";
import { ComponentType } from "react";
import {
  Users,
  User,
  Package,
  Boxes,
  Tag,
  UploadCloud,
  Settings,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { Chats } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import Header from "@/components/organisms/header";
import { useAppStore } from "@/lib/store/store";
import type { Messages } from "@/i18n/types";

type Section = {
  href: string;
  icon: ComponentType<{ size?: string | number; className?: string }>;
  /** Clave en marketAdmin.home.sections */
  key: keyof Messages["marketAdmin"]["home"]["sections"];
  disabled?: boolean;
};

const sections: Section[] = [
  {
    href: "/market-admin/clients",
    icon: Users,
    key: "clients"
  },
  {
    href: "/market-admin/users",
    icon: User,
    key: "users"
  },
  {
    href: "/market-admin/products",
    icon: Package,
    key: "products"
  },
  {
    href: "/market-admin/packs",
    icon: Boxes,
    key: "packs"
  },
  {
    href: "/market-admin/bonuses-and-discounts",
    icon: Tag,
    key: "discounts"
  },
  {
    href: "/market-admin/load",
    icon: UploadCloud,
    key: "load"
  },
  {
    href: "/seals",
    icon: ShieldCheck,
    key: "seals"
  },
  {
    href: "/mass-communications",
    icon: Chats,
    key: "massCommunications"
  },
  {
    href: "/settings",
    icon: Settings,
    key: "settings"
  }
];

const superAdminSections: Section[] = [
  {
    href: "/platform/roles",
    icon: ShieldCheck,
    key: "roles"
  }
];

export default function MarketAdmin() {
  const t = useTranslations("marketAdmin.home");
  const isSuperAdmin = useAppStore((s) => Boolean(s.selectedProject?.isSuperAdmin));
  const visibleSections = isSuperAdmin ? [...sections, ...superAdminSections] : sections;

  return (
    <div className="cp-page min-h-full">
      <Header title={t("title")} />

      {/* Una sola tarjeta; las líneas entre opciones salen del gap de 1px sobre --cp-line */}
      <section className="cp-card overflow-hidden">
        <div className="grid grid-cols-1 gap-px bg-cp-line md:grid-cols-2">
          {sections.map(({ href, icon: Icon, key, disabled }) => {
            const label = t(`sections.${key}.label`);
            const description = t(`sections.${key}.description`);
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
                    size={18}
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
              <div key={key}>{inner}</div>
            ) : (
              <Link key={key} href={href} className="block">
                {inner}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
