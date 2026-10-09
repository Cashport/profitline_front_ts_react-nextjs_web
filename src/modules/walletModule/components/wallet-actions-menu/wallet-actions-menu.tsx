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
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition-colors hover:bg-secondary"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>
    </GeneralDropdown>
  );
}
