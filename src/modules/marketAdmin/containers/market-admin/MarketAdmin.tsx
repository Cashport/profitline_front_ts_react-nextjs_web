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
  ChevronRight
} from "lucide-react";
import { Chats } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import Header from "@/components/organisms/header";
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

export default function MarketAdmin() {
  const t = useTranslations("marketAdmin.home");
  return (
    <div className="cp-page min-h-full">
      <Header title={t("title")} />

      {/* Single white card — full width, sized to its content */}
      <div className="cp-card overflow-hidden">
        <div className="grid grid-cols-2">
          {sections.map(({ href, icon: Icon, key, disabled }) => {
            const label = t(`sections.${key}.label`);
            const description = t(`sections.${key}.description`);
            const inner = (
              <div
                className={`group flex items-center gap-5 px-7 py-7 border-b border-r border-[#F0F0F0] transition-all h-full ${
                  disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FAFAFA] cursor-pointer"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    disabled
                      ? "bg-[#F5F5F5]"
                      : "bg-[#F5F5F5] group-hover:bg-cashport-green group-active:bg-cashport-green"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      disabled ? "text-[#AAAAAA]" : "text-[#141414]"
                    }`}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#141414]">{label}</p>
                  <p className="text-[13px] text-[#999999] mt-0.5 leading-relaxed">{description}</p>
                </div>

                {/* Arrow */}
                {!disabled && (
                  <ChevronRight
                    size={16}
                    className="text-[#CCCCCC] group-hover:text-[#141414] transition-colors flex-shrink-0"
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
      </div>
    </div>
  );
}
