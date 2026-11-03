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
import Header from "@/components/organisms/header";

type Section = {
  href: string;
  icon: ComponentType<{ size?: string | number; className?: string }>;
  label: string;
  description: string;
  disabled?: boolean;
};

const sections: Section[] = [
  {
    href: "/market-admin/clientes",
    icon: Users,
    label: "Clientes",
    description: "Gestiona clientes, sus productos, descuentos y usuarios asignados."
  },
  {
    href: "/market-admin/usuarios",
    icon: User,
    label: "Usuarios",
    description: "Administra los usuarios del Marketplace, roles y clientes asociados."
  },
  {
    href: "/market-admin/productos",
    icon: Package,
    label: "Productos",
    description: "Revisa el catálogo: líneas, canales, SKUs, lotes, precios e imágenes."
  },
  {
    href: "/market-admin/packs",
    icon: Boxes,
    label: "Packs de productos",
    description: "Arma packs con productos del catálogo: SKU propio, imagen y cantidades."
  },
  {
    href: "/market-admin/bonusAndDiscounts",
    icon: Tag,
    label: "Descuentos y bonificados",
    description: "Gestiona descuentos y bonificados: reglas, fechas, estado y categoría."
  },
  {
    href: "/market-admin/load",
    icon: UploadCloud,
    label: "Cargue de información",
    description: "Alimenta el app con ETLs manuales: inventario, precios, clientes y más."
  },
  {
    href: "/precintos",
    icon: ShieldCheck,
    label: "Precintos",
    description: "Controla el inventario de precintos: bodega, ejecutivos y asignaciones."
  },
  {
    href: "/mass-communications",
    icon: Chats,
    label: "Comunicaciones masivas",
    description: "Envía comunicaciones masivas a los clientes en minutos."
  },
  {
    href: "/settings",
    icon: Settings,
    label: "Configuraciones",
    description: "Gestión administrativa del proyecto."
  }
];

export default function MarketAdmin() {
  return (
    <div className="cp-page min-h-full">
      <Header title="Administración" />

      {/* Una sola tarjeta; las líneas entre opciones salen del gap de 1px sobre --cp-line */}
      <section className="cp-card overflow-hidden">
        <div className="grid grid-cols-1 gap-px bg-cp-line md:grid-cols-2">
          {sections.map(({ href, icon: Icon, label, description, disabled }) => {
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
              <div key={label}>{inner}</div>
            ) : (
              <Link key={label} href={href} className="block">
                {inner}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
