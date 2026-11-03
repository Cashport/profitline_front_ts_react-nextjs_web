"use client";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useMarketAdminRoles } from "@/modules/marketAdmin/hooks/useMarketAdminRoles";

export interface IMarketAdminUsersFilter {
  roleId: number | null;
  status: 0 | 1 | null;
}

const ESTADO_OPTIONS: FilterOptionItem[] = [
  { id: "1", name: "Activo" },
  { id: "0", name: "Inactivo" }
];


interface FilterUsersModalProps {
  value: IMarketAdminUsersFilter;
  onChange: (next: IMarketAdminUsersFilter) => void;
}

export default function FilterUsersModal({ value, onChange }: FilterUsersModalProps) {
  const { data: roles, isLoading: isLoadingRoles } = useMarketAdminRoles();

  const rolOptions: FilterOptionItem[] = roles.map((r) => ({
    id: String(r.ID),
    name: r.ROL_NAME
  }));

  const rolId = value.roleId !== null ? String(value.roleId) : null;

  const selection: FilterSelection = {
    rol: rolId ? [{ id: rolId, name: rolOptions.find((o) => o.id === rolId)?.name ?? rolId }] : [],
    estado:
      value.status !== null
        ? [{ id: String(value.status), name: value.status === 1 ? "Activo" : "Inactivo" }]
        : []
  };

  const selectionToDomain = (sel: FilterSelection): IMarketAdminUsersFilter => {
    const estadoId = sel.estado?.[0]?.id;
    return {
      roleId: sel.rol?.[0] ? Number(sel.rol[0].id) : null,
      status: estadoId === "1" ? 1 : estadoId === "0" ? 0 : null
    };
  };

  const categories: FilterCategoryConfig[] = [
    {
      key: "rol",
      label: "Rol",
      selectMode: "single",
      options: rolOptions,
      status: isLoadingRoles ? "loading" : undefined
    },
    {
      key: "estado",
      label: "Estado",
      selectMode: "single",
      options: ESTADO_OPTIONS
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      onApply={(sel) => onChange(selectionToDomain(sel))}
      onValueChange={(sel) => onChange(selectionToDomain(sel))}
      onClearAll={() => onChange({ roleId: null, status: null })}
    />
  );
}
