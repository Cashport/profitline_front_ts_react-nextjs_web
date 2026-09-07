"use client";

import { Check, CheckCheck, Link2, ListFilter, MoreHorizontal, Pencil, Plus } from "lucide-react";

import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown/dropdown";

interface GroupActionsMenuProps {
  esNovedad: boolean;
  totalFacturas: number;
}

/** Acciones sobre el grupo y la selección.
 *  TODO: habilitar cada ítem cuando existan los endpoints de novedades. */
export default function GroupActionsMenu({ esNovedad, totalFacturas }: GroupActionsMenuProps) {
  const novedadItems: DropdownItem[] = [
    {
      key: "editar",
      icon: <Pencil className="h-4 w-4" />,
      label: "Editar datos de la novedad",
      disabled: true
    },
    {
      key: "estado",
      icon: <ListFilter className="h-4 w-4" />,
      label: "Cambiar estado",
      disabled: true
    },
    { key: "sep-1", type: "divider" }
  ];

  const resolverItems: DropdownItem[] = [
    { key: "sep-2", type: "divider" },
    {
      key: "resolver-sel",
      icon: <Check className="h-4 w-4" />,
      label: "Resolver las seleccionadas",
      disabled: true
    },
    {
      key: "resolver-todo",
      icon: <CheckCheck className="h-4 w-4" />,
      label: `Resolver toda la novedad (${totalFacturas})`,
      disabled: true
    }
  ];

  const items: DropdownItem[] = [
    ...(esNovedad ? novedadItems : []),
    {
      key: "crear-novedad",
      icon: <Plus className="h-4 w-4" />,
      label: "Crear novedad con la selección",
      disabled: true
    },
    {
      key: "vincular",
      icon: <Link2 className="h-4 w-4" />,
      label: "Vincular a una novedad existente",
      disabled: true
    },
    ...(esNovedad ? resolverItems : [])
  ];

  return (
    <GeneralDropdown items={items} align="end">
      <button
        type="button"
        aria-label="Acciones sobre el grupo"
        title="Acciones sobre el grupo (próximamente)"
        className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </GeneralDropdown>
  );
}
