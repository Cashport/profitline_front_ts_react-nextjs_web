"use client";

import { ShieldCheck, UserCog } from "lucide-react";
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
  },
  {
    href: "/market-admin/logistica-inversa/usuarios",
    icon: UserCog,
    label: "Usuarios",
    description: "Crea usuarios de Pharma 360, cambia su rol, actívalos o desactívalos."
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
