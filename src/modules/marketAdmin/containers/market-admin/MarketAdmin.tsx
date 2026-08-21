"use client";

import Link from "next/link";
import { Users, User, Package, Tag, ChevronRight } from "lucide-react";

type Section = {
  href: string;
  icon: typeof Users;
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
    href: "/market-admin/bonusAndDiscounts",
    icon: Tag,
    label: "Descuentos y bonificados",
    description: "Gestiona descuentos y bonificados: reglas, fechas, estado y categoría.",
    disabled: true
  }
];

export default function MarketAdmin() {
  return (
    <div className="min-h-screen">
      {/* Title outside the card */}
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Administración</h1>

      {/* Single white card — full width, sized to its content */}
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-2">
          {sections.map(({ href, icon: Icon, label, description, disabled }) => {
            const inner = (
              <div
                className={`group flex items-center gap-5 px-7 py-7 border-b border-r border-[#F0F0F0] transition-all h-full ${
                  disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FAFAFA] cursor-pointer"
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                    disabled ? "bg-[#F5F5F5]" : "bg-[#F5F5F5] group-hover:bg-[#141414]"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      disabled ? "text-[#AAAAAA]" : "text-[#141414] group-hover:text-white"
                    }`}
                  />
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#141414]">{label}</p>
                  <p className="text-xs text-[#999999] mt-0.5 leading-relaxed">{description}</p>
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
              <div key={label}>{inner}</div>
            ) : (
              <Link key={label} href={href} className="block">
                {inner}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
