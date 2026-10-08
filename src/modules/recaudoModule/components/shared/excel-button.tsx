"use client";

import { useState } from "react";
import { Button, Tooltip } from "antd";
import { Download } from "lucide-react";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { downloadCollectionTowerExcel } from "@/services/collectionTower/collectionTower";
import type { ITowerExportState, TowerExportTable } from "@/types/collectionTower/ICollectionTower";
import { USE_TOWER_MOCK } from "../../constants";
import { useTowerFilters } from "../../contexts/tower-filters-context";

interface ExcelButtonProps {
  table: TowerExportTable;
  /** Agrupación, vista y orden de la tabla: el archivo trae lo que se ve. */
  state: ITowerExportState;
  /** Nombre de la tabla para el archivo: "<tabla> <mes> <año>.xlsx". */
  name: string;
  /** "Septiembre 2026". */
  periodLabel: string;
}

/**
 * Botón discreto de descarga a Excel en la esquina de cada tabla. El archivo lo
 * arma el backend; mientras la torre lee datos de ejemplo queda deshabilitado.
 */
export default function ExcelButton({ table, state, name, periodLabel }: ExcelButtonProps) {
  const projectId = useAppStore((s) => s.selectedProject?.ID);
  const { filters } = useTowerFilters();
  const { showMessage, messageApi } = useMessageApi();
  const [downloading, setDownloading] = useState(false);

  const download = async () => {
    if (!projectId || downloading) return;
    const hide = messageApi.open({ type: "loading", content: "Descargando Excel…", duration: 0 });
    try {
      setDownloading(true);
      await downloadCollectionTowerExcel(
        projectId,
        table,
        filters,
        state,
        `${name} ${periodLabel.toLowerCase()}.xlsx`
      );
    } catch (error) {
      showMessage("error", error instanceof Error ? error.message : "No se pudo descargar el Excel.");
    } finally {
      hide();
      setDownloading(false);
    }
  };

  return (
    <Tooltip title={USE_TOWER_MOCK ? "Disponible al conectar el API" : "Descargar en Excel"}>
      <Button
        type="text"
        size="small"
        aria-label="Descargar en Excel"
        icon={<Download className="h-[15px] w-[15px]" />}
        disabled={USE_TOWER_MOCK || !projectId}
        loading={downloading}
        onClick={download}
      />
    </Tooltip>
  );
}
