"use client";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import { useProjectUsersByRole } from "@/hooks/useProjectUsers";
import { useMarketAdminLines } from "@/modules/marketAdmin/hooks/useMarketAdminLines";
import type { IUserWithRole } from "@/types/users/IUser";

export interface IMarketAdminClientsFilter {
  linea: string | null; // el listado de clientes filtra por NOMBRE de línea, no por id
  status: 0 | 1 | null;
  // Responsables: emails, igual que en la configuración del cliente
  asigned_user: string[];
  coordinator: string[];
  kam: string[];
  kam_lider: string[];
}

export const EMPTY_CLIENTS_FILTER: IMarketAdminClientsFilter = {
  linea: null,
  status: null,
  asigned_user: [],
  coordinator: [],
  kam: [],
  kam_lider: []
};

type ResponsableKey = "asigned_user" | "coordinator" | "kam" | "kam_lider";

// Mismas claves y etiquetas que los selects de responsables de ConfiguracionesTab.
// La clave de la categoría es el campo del filtro, así el mapeo es directo.
// Cada categoría solo ofrece los usuarios con su rol en el proyecto (rol_id).
const RESPONSABLE_CATEGORIES: { key: ResponsableKey; label: string; rolId: number }[] = [
  { key: "asigned_user", label: "Ejecutivo", rolId: 4 },
  { key: "coordinator", label: "Coordinador", rolId: 3 },
  { key: "kam", label: "KAM", rolId: 14 },
  { key: "kam_lider", label: "KAM líder", rolId: 31 }
];

const ESTADO_OPTIONS: FilterOptionItem[] = [
  { id: "1", name: "Activo" },
  { id: "0", name: "Inactivo" }
];

const TRIGGER_CLASS =
  "h-12 flex items-center gap-2 border border-[#E0E0E0] rounded-lg px-4 bg-white text-[#141414] hover:bg-[#F0F0F0] transition-colors";

interface FilterClientsModalProps {
  value: IMarketAdminClientsFilter;
  onChange: (next: IMarketAdminClientsFilter) => void;
}

export default function FilterClientsModal({ value, onChange }: FilterClientsModalProps) {
  const { data: lines, isLoading: isLoadingLines } = useMarketAdminLines();
  const { users, isLoading: isLoadingUsers } = useProjectUsersByRole();

  // El id de la opción es el propio nombre: es el valor que espera el endpoint,
  // así reconstruir la selección no necesita un lookup inverso.
  const lineaOptions: FilterOptionItem[] = lines.map((l) => ({
    id: l.description_line,
    name: l.description_line
  }));

  // El cliente guarda el email de cada responsable, así que ese es el id. La etiqueta
  // es el nombre; si no llega, el email.
  const toUserOption = (u: IUserWithRole): FilterOptionItem => ({
    id: u.email,
    name: u.user_name?.trim() || u.email
  });
  const usersWithEmail = users.filter((u) => u.email);
  const userLabelByEmail = new Map(usersWithEmail.map(toUserOption).map((o) => [o.id, o.name]));

  // Mientras cargan los usuarios, el tag muestra solo el email.
  const toUserItems = (emails: string[]): FilterOptionItem[] =>
    emails.map((email) => ({ id: email, name: userLabelByEmail.get(email) ?? email }));

  const selection: FilterSelection = {
    linea: value.linea ? [{ id: value.linea, name: value.linea }] : [],
    estado:
      value.status !== null
        ? [{ id: String(value.status), name: value.status === 1 ? "Activo" : "Inactivo" }]
        : [],
    asigned_user: toUserItems(value.asigned_user),
    coordinator: toUserItems(value.coordinator),
    kam: toUserItems(value.kam),
    kam_lider: toUserItems(value.kam_lider)
  };

  const selectionToDomain = (sel: FilterSelection): IMarketAdminClientsFilter => {
    const estadoId = sel.estado?.[0]?.id;
    const emails = (key: ResponsableKey) => (sel[key] ?? []).map((o) => o.id);
    return {
      linea: sel.linea?.[0]?.id ?? null,
      status: estadoId === "1" ? 1 : estadoId === "0" ? 0 : null,
      asigned_user: emails("asigned_user"),
      coordinator: emails("coordinator"),
      kam: emails("kam"),
      kam_lider: emails("kam_lider")
    };
  };

  const categories: FilterCategoryConfig[] = [
    {
      key: "linea",
      label: "Línea",
      selectMode: "single",
      options: lineaOptions,
      status: isLoadingLines ? "loading" : undefined
    },
    {
      key: "estado",
      label: "Estado",
      selectMode: "single",
      options: ESTADO_OPTIONS
    },
    // Sin selectMode (multi): se pueden elegir varios usuarios por responsable
    ...RESPONSABLE_CATEGORIES.map(
      ({ key, label, rolId }): FilterCategoryConfig => ({
        key,
        label,
        options: usersWithEmail.filter((u) => u.rol_id === rolId).map(toUserOption),
        status: isLoadingUsers ? "loading" : undefined
      })
    )
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      trigger={{ className: TRIGGER_CLASS, showChevron: true }}
      onApply={(sel) => onChange(selectionToDomain(sel))}
      onValueChange={(sel) => onChange(selectionToDomain(sel))}
      onClearAll={() => onChange(EMPTY_CLIENTS_FILTER)}
    />
  );
}
