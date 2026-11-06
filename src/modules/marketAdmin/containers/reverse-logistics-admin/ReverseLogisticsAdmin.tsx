"use client";

import { ShieldCheck } from "lucide-react";
import Header from "@/components/organisms/header";
import BranchesIcon from "@/modules/branches/components/branches-icon/branches-icon";
import AdminSectionsGrid, { AdminSection } from "../../components/admin-sections-grid/admin-sections-grid";

const sections: AdminSection[] = [
  {
    href: "/precintos",
    icon: ShieldCheck,
    label: "Precintos",
    description: "Controla el inventario de precintos: bodega, ejecutivos y asignaciones."
  },
  {
    href: "/branches",
    icon: BranchesIcon,
    label: "Sucursales",
    description: "Consulta las sucursales de devolución: lista de precios, estado y ejecutivos."
  }
];

/** Submenú de Configuración (/market-admin/logistica-inversa): precintos y sucursales de devolución. */
export default function ReverseLogisticsAdmin() {
  return (
    <div className="cp-page min-h-full">
      <Header title="Logística inversa" back="/market-admin" />
      <AdminSectionsGrid sections={sections} />
    </div>
  );
}
