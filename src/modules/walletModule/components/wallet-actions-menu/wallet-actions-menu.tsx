"use client";

import { FileSpreadsheet, MoreHorizontal } from "lucide-react";

import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown/dropdown";

interface WalletActionsMenuProps {
  onDownloadExcel: () => void;
  /** Hay una descarga en curso: la opción se deshabilita para no pedirla dos veces. */
  downloading?: boolean;
}

/** Acciones de la barra superior. Misma superficie que el botón de tema. */
export default function WalletActionsMenu({
  onDownloadExcel,
  downloading
}: WalletActionsMenuProps) {
  // Sin color en el label: el popup vive en un portal fuera de .dark/.wallet-scope
  // y AntD ya lo tiñe con el tema del módulo.
  const items: DropdownItem[] = [
    {
      key: "descargar-excel",
      icon: <FileSpreadsheet className="h-4 w-4" />,
      label: "Descargar a excel",
      disabled: downloading,
      onClick: onDownloadExcel
    }
  ];

  return (
    <GeneralDropdown items={items} align="end">
      <button
        type="button"
        aria-label="Más acciones"
        title="Más acciones"
        className="flex h-[var(--control-h)] w-[var(--control-h)] shrink-0 items-center justify-center rounded-lg border-0 bg-cp-surface text-cp-ink transition-colors hover:bg-cp-muted"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </GeneralDropdown>
  );
}
