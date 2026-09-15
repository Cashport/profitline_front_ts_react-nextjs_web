"use client";

import { useRef, useState } from "react";
import type { DropdownProps } from "antd";
import {
  Check,
  CheckCheck,
  ChevronDown,
  Link2,
  ListFilter,
  MoreHorizontal,
  Pencil,
  Plus
} from "lucide-react";

import { cn } from "@/utils/utils";
import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown/dropdown";
import { useNoveltyStatuses } from "@/modules/noveltiesModule/hooks/useNoveltyStatuses";
import ModalCreateUpdateNoveltyAndLinkInvoices, {
  NoveltyModalMode
} from "./modal-create-update-novelty-and-link-invoices";

interface GroupActionsMenuProps {
  esNovedad: boolean;
  totalFacturas: number;
  /** Facturas marcadas en la pestaña "Facturas"; habilita las acciones sobre la selección. */
  seleccionadas: number;
  /** Id del estado actual de la novedad (catálogo /invoice/novelty-status). */
  estadoActualId?: number;
  /** Cambia el estado de la novedad; devuelve si quedó aplicado. */
  onChangeStatus: (statusId: number) => Promise<boolean>;
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
  seleccionadas,
  estadoActualId,
  onChangeStatus
}: GroupActionsMenuProps) {
  const haySeleccion = seleccionadas > 0;
  const [modalMode, setModalMode] = useState<NoveltyModalMode | null>(null);

  // AntD Dropdown sólo soporta submenús laterales, así que la lista de estados
  // se despliega "inline": los estados entran como ítems normales bajo
  // "Cambiar estado" y `open` se controla porque AntD cierra el menú en cada
  // clic de ítem (onOpenChange(false, { source: "menu" }) después del onClick
  // del ítem). El ref marca ese único clic que debe mantenerlo abierto.
  const [open, setOpen] = useState(false);
  const [estadoAbierto, setEstadoAbierto] = useState(false);
  const mantenerAbierto = useRef(false);
  const { statuses, isLoading: isLoadingStatuses } = useNoveltyStatuses();

  const handleOpenChange: DropdownProps["onOpenChange"] = (next, info) => {
    if (!next && info.source === "menu" && mantenerAbierto.current) {
      mantenerAbierto.current = false;
      return;
    }
    setOpen(next);
    if (!next) setEstadoAbierto(false);
  };

  const handleToggleStatusList = () => {
    mantenerAbierto.current = true;
    setEstadoAbierto((v) => !v);
  };

  const estadoItems: DropdownItem[] = isLoadingStatuses
    ? [{ key: "estado-cargando", label: "Cargando estados…", disabled: true }]
    : statuses.map((s) => {
        const actual = s.id === estadoActualId;
        return {
          key: `estado-${s.id}`,
          disabled: actual,
          // AntD cierra el menú solo tras este clic.
          onClick: () => onChangeStatus(s.id),
          label: (
            <span className="flex items-center gap-2.5 pl-5">
              {/* El color es el hex del catálogo, no un token del tema. */}
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="flex-1">{s.description}</span>
              {actual && <span className="text-[10.5px] opacity-60">actual</span>}
            </span>
          )
        };
      });

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
          label: (
            <span className="flex items-center gap-2">
              <span className="flex-1">Cambiar estado</span>
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", estadoAbierto && "rotate-180")}
              />
            </span>
          ),
          onClick: handleToggleStatusList
        },
        ...(estadoAbierto ? estadoItems : [])
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
      <GeneralDropdown items={items} align="end" open={open} onOpenChange={handleOpenChange}>
        <button
          type="button"
          aria-label="Acciones sobre el grupo"
          title="Acciones sobre el grupo"
          className="flex h-[30px] w-[30px] items-center justify-center rounded-[7px] border border-border bg-muted text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </GeneralDropdown>

      <ModalCreateUpdateNoveltyAndLinkInvoices
        mode={modalMode}
        onClose={() => setModalMode(null)}
      />
    </>
  );
}
