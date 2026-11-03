"use client";

import { useTranslations } from "use-intl";
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
// La etiqueta sale de marketAdmin.shared.responsibles.<key>.
const RESPONSABLE_CATEGORIES: { key: ResponsableKey; rolId: number }[] = [
  { key: "asigned_user", rolId: 4 },
  { key: "coordinator", rolId: 3 },
  { key: "kam", rolId: 14 },
  { key: "kam_lider", rolId: 31 }
];

interface FilterClientsModalProps {
  value: IMarketAdminClientsFilter;
  onChange: (next: IMarketAdminClientsFilter) => void;
}

export default function FilterClientsModal({ value, onChange }: FilterClientsModalProps) {
  const t = useTranslations("marketAdmin.clients.filters");
  const tShared = useTranslations("marketAdmin.shared");
  const tCommon = useTranslations("common");
  const { data: lines, isLoading: isLoadingLines } = useMarketAdminLines();

  const estadoOptions: FilterOptionItem[] = [
    { id: "1", name: tCommon("status.active") },
    { id: "0", name: tCommon("status.inactive") }
  ];
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
        ? [
            {
              id: String(value.status),
              name: value.status === 1 ? tCommon("status.active") : tCommon("status.inactive")
            }
          ]
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
      label: t("line"),
      selectMode: "single",
      options: lineaOptions,
      status: isLoadingLines ? "loading" : undefined
    },
    {
      key: "estado",
      label: tCommon("fields.status"),
      selectMode: "single",
      options: estadoOptions
    },
    // Sin selectMode (multi): se pueden elegir varios usuarios por responsable
    ...RESPONSABLE_CATEGORIES.map(
      ({ key, rolId }): FilterCategoryConfig => ({
        key,
        label: tShared(`responsibles.${key}`),
        options: usersWithEmail.filter((u) => u.rol_id === rolId).map(toUserOption),
        status: isLoadingUsers ? "loading" : undefined
      })
    )
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      onApply={(sel) => onChange(selectionToDomain(sel))}
      onValueChange={(sel) => onChange(selectionToDomain(sel))}
      onClearAll={() => onChange(EMPTY_CLIENTS_FILTER)}
    />
  );
}
