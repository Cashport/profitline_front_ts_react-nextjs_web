"use client";

import { Users, User, Package, Boxes, Tag, UploadCloud, Settings, ShieldCheck } from "lucide-react";
import { Chats } from "@phosphor-icons/react";
import Header from "@/components/organisms/header";
import { useAppStore } from "@/lib/store/store";
import AdminSectionsGrid, { AdminSection } from "../../components/admin-sections-grid/admin-sections-grid";
import ReverseLogisticsIcon from "../../components/reverse-logistics-icon/reverse-logistics-icon";

const sections: AdminSection[] = [
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
    href: "/market-admin/logistica-inversa",
    icon: ReverseLogisticsIcon,
    iconSize: 24,
    label: "Logística inversa",
    description: "Precintos y sucursales de devolución del proyecto."
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

const superAdminSections: AdminSection[] = [
  {
    href: "/plataforma/roles",
    icon: ShieldCheck,
    label: "Roles y permisos",
    description: "Solo Profitline: roles por proyecto, qué puede hacer cada rol y su catálogo."
  }
];

export default function MarketAdmin() {
  const isSuperAdmin = useAppStore((s) => Boolean(s.selectedProject?.isSuperAdmin));
  const visibleSections = isSuperAdmin ? [...sections, ...superAdminSections] : sections;

  return (
    <div className="cp-page min-h-full">
      <Header title="Administración" />
      <AdminSectionsGrid sections={sections} />
    </div>
  );
}
