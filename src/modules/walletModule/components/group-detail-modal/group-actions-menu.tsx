"use client";

import { useState } from "react";
import { Check, CheckCheck, Link2, ListFilter, MoreHorizontal, Pencil, Plus } from "lucide-react";

import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown/dropdown";
import ModalCreateUpdateNoveltyAndLinkInvoices, {
  NoveltyModalMode
} from "./modal-create-update-novelty-and-link-invoices";

interface GroupActionsMenuProps {
  esNovedad: boolean;
  totalFacturas: number;
  /** Facturas marcadas en la pestaña "Facturas"; habilita las acciones sobre la selección. */
  seleccionadas: number;
}

// Sin color: el popup vive en un portal fuera de .dark/.wallet-scope, así que
// los tokens de Tailwind darían el valor claro en tema oscuro. AntD ya lo tiñe.
const titulo = (texto: string) => (
  <span className="text-[10.5px] font-semibold uppercase tracking-[0.06em]">{texto}</span>
);

/** Acciones sobre el grupo y la selección.
 *  TODO: conectar el `onClick` de cada ítem cuando existan los endpoints de novedades. */
export default function GroupActionsMenu({
  esNovedad,
  totalFacturas,
  seleccionadas
}: GroupActionsMenuProps) {
  const haySeleccion = seleccionadas > 0;
  const [modalMode, setModalMode] = useState<NoveltyModalMode | null>(null);

  const novedadItems: DropdownItem[] = [
    {
      key: "novedad",
      type: "group",
      label: titulo("Novedad"),
      children: [
        {
          key: "editar",
          icon: <Pencil className="h-4 w-4" />,
          label: "Editar datos de la novedad",
          onClick: () => setModalMode("editar")
        },
        {
          key: "estado",
          icon: <ListFilter className="h-4 w-4" />,
          label: "Cambiar estado"
        }
      ]
    },
    { key: "sep-1", type: "divider" }
  ];

  const seleccionItems: DropdownItem[] = [
    {
      key: "seleccion",
      type: "group",
      label: titulo("Sobre las facturas seleccionadas"),
      children: [
        {
          key: "crear-novedad",
          icon: <Plus className="h-4 w-4" />,
          label: "Crear novedad",
          // TODO: volver a exigir `haySeleccion` cuando la selección real de
          // facturas (pestaña "Facturas") esté conectada; por ahora se deja
          // habilitado para poder probar el panel.
          onClick: () => setModalMode("crear")
        },
        {
          key: "vincular",
          icon: <Link2 className="h-4 w-4" />,
          label: "Vincular a una novedad existente",
          onClick: () => setModalMode("vincular")
        }
      ]
    }
  ];

  const resolverItems: DropdownItem[] = [
    { key: "sep-2", type: "divider" },
    {
      key: "resolver",
      type: "group",
      label: titulo("Resolver la novedad"),
      children: [
        {
          key: "resolver-sel",
          icon: <Check className="h-4 w-4" />,
          label: "Resolver las seleccionadas",
          disabled: !haySeleccion
        },
        {
          key: "resolver-todo",
          icon: <CheckCheck className="h-4 w-4" />,
          label: `Resolver toda la novedad (${totalFacturas})`
        }
      ]
    }
  ];

  const items: DropdownItem[] = [
    ...(esNovedad ? novedadItems : []),
    ...seleccionItems,
    ...(esNovedad ? resolverItems : [])
  ];

  return (
    <>
      <GeneralDropdown items={items} align="end">
        <button
          type="button"
          aria-label="Acciones sobre el grupo"
          title="Acciones sobre el grupo"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </GeneralDropdown>

      <ModalCreateUpdateNoveltyAndLinkInvoices mode={modalMode} onClose={() => setModalMode(null)} />
    </>
  );
}
