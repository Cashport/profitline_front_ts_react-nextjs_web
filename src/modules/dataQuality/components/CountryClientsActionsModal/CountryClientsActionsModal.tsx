import React, { ReactNode } from "react";
import { Modal } from "antd";
import {
  ArrowsClockwise,
  DownloadSimple,
  EnvelopeSimple,
  FilePlus,
  Plus,
  UploadSimple
} from "@phosphor-icons/react";

import ActionTile, { ActionTone } from "@/components/ui/action-tile/action-tile";
import ActionTileGroup from "@/components/ui/action-tile/action-tile-group";

type CountryClientsActionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDownloadCatalog: () => void;
  isDownloadCatalogLoading: boolean;
  onUploadFile?: () => void;
  onDownloadIqviaCatalog?: () => void;
  isDownloadIqviaCatalogLoading?: boolean;
  onUploadIqviaCatalog?: () => void;
  onDownloadIqviaProductCatalog?: () => void;
  isDownloadIqviaProductCatalogLoading?: boolean;
  onUploadIqviaProductCatalog?: () => void;
  onUploadMaterialsAuxiliary?: () => void;
  onUploadPointsOfSale?: () => void;
  onDownloadMaterials?: () => void;
  onDownloadPointsOfSale?: () => void;
  onUploadPacks?: () => void;
  onUploadGmnOficiales?: () => void;
  onUploadInTransitHaleon?: () => void;
  onAddEmails?: () => void;
  /** Client detail: file setup actions (shown first). */
  onCreateIntake?: () => void;
  onCreateFile?: () => void;
  onReprocessDates?: () => void;
  isInDetailView?: boolean;
  downloadCatalogOnly?: boolean;
  /** Deja en el modal únicamente la acción "Cargar Maestra Productos". */
  onlyGmnOficiales?: boolean;
};

export const CountryClientsActionsModal: React.FC<CountryClientsActionsModalProps> = ({
  isOpen,
  onClose,
  onDownloadCatalog,
  isDownloadCatalogLoading,
  onUploadFile,
  onDownloadIqviaCatalog,
  isDownloadIqviaCatalogLoading = false,
  onUploadIqviaCatalog,
  onDownloadIqviaProductCatalog,
  isDownloadIqviaProductCatalogLoading = false,
  onUploadIqviaProductCatalog,
  onUploadMaterialsAuxiliary,
  onUploadPointsOfSale,
  onDownloadMaterials,
  onDownloadPointsOfSale,
  onUploadPacks,
  onUploadGmnOficiales,
  onUploadInTransitHaleon,
  onAddEmails,
  onCreateIntake,
  onCreateFile,
  onReprocessDates,
  isInDetailView = false,
  downloadCatalogOnly = false,
  onlyGmnOficiales = false
}) => {
  type Tile = {
    key: string;
    icon: ReactNode;
    label: string;
    onClick?: () => void;
    disabled?: boolean;
  };
  const tile = (
    key: string,
    icon: ReactNode,
    label: string,
    onClick?: () => void,
    disabled?: boolean
  ): Tile | null => (onClick ? { key, icon, label, onClick, disabled } : null);

  const canEdit = !downloadCatalogOnly && !onlyGmnOficiales;

  const groups: Array<{ title: string; tone: ActionTone; tiles: Array<Tile | null> }> =
    onlyGmnOficiales
      ? [
          {
            title: "Catálogos",
            tone: "blue",
            tiles: [tile("gmn", <UploadSimple />, "Cargar Maestra Productos", onUploadGmnOficiales)]
          }
        ]
      : [
          {
            title: "Archivos del cliente",
            tone: "emerald",
            tiles: canEdit
              ? [
                  tile("intake", <Plus />, "Crear nueva ingesta", onCreateIntake),
                  tile("file", <FilePlus />, "Crear nuevo archivo", onCreateFile),
                  tile("reprocess", <ArrowsClockwise />, "Calcular periodicidad", onReprocessDates),
                  isInDetailView
                    ? tile("history", <UploadSimple />, "Cargar histórico", onUploadFile)
                    : null,
                  isInDetailView
                    ? tile(
                        "transit",
                        <UploadSimple />,
                        "Cargar In-Transit Haleon",
                        onUploadInTransitHaleon
                      )
                    : null
                ]
              : []
          },
          {
            title: "Catálogos",
            tone: "blue",
            tiles: [
              tile(
                "catalog",
                <DownloadSimple />,
                "Descargar catálogo",
                onDownloadCatalog,
                isDownloadCatalogLoading
              ),
              tile(
                "iqvia-dl",
                <DownloadSimple />,
                "Descargar IQVIA Clientes",
                onDownloadIqviaCatalog,
                isDownloadIqviaCatalogLoading
              ),
              tile(
                "iqvia-prod-dl",
                <DownloadSimple />,
                "Descargar IQVIA Productos",
                onDownloadIqviaProductCatalog,
                isDownloadIqviaProductCatalogLoading
              ),
              ...(canEdit
                ? [
                    tile(
                      "iqvia-up",
                      <UploadSimple />,
                      "Cargar IQVIA Clientes",
                      onUploadIqviaCatalog
                    ),
                    tile(
                      "iqvia-prod-up",
                      <UploadSimple />,
                      "Cargar IQVIA Productos",
                      onUploadIqviaProductCatalog
                    ),
                    tile(
                      "mat-dl",
                      <DownloadSimple />,
                      "Descargar auxiliar materiales",
                      onDownloadMaterials
                    ),
                    tile(
                      "mat-up",
                      <UploadSimple />,
                      "Cargar auxiliar materiales",
                      onUploadMaterialsAuxiliary
                    ),
                    tile("gmn", <UploadSimple />, "Cargar Maestra Productos", onUploadGmnOficiales)
                  ]
                : [])
            ]
          },
          {
            title: "Puntos de venta y packs",
            tone: "violet",
            tiles: canEdit
              ? [
                  tile(
                    "pos-dl",
                    <DownloadSimple />,
                    "Descargar puntos de venta",
                    onDownloadPointsOfSale
                  ),
                  tile("pos-up", <UploadSimple />, "Cargar puntos de venta", onUploadPointsOfSale),
                  tile("packs", <UploadSimple />, "Cargar packs", onUploadPacks)
                ]
              : []
          },
          {
            title: "Configuración",
            tone: "orange",
            tiles: canEdit
              ? [tile("emails", <EnvelopeSimple />, "Editar reglas de correo", onAddEmails)]
              : []
          }
        ];

  return (
    <Modal
      width={720}
      open={isOpen}
      centered
      onCancel={onClose}
      footer={null}
      title={
        <div className="pr-6">
          <h2 className="text-xl font-semibold text-foreground">
            {onlyGmnOficiales ? "Cargar Maestra Productos" : "Generar acción"}
          </h2>
          <p className="mt-1 text-sm font-normal text-muted-foreground">
            Selecciona la acción que vas a realizar
          </p>
        </div>
      }
    >
      <div className="mt-5 space-y-5">
        {groups.map((group) => {
          const tiles = group.tiles.filter((t): t is Tile => t !== null);
          if (!tiles.length) return null;
          return (
            <ActionTileGroup key={group.title} title={group.title} tone={group.tone}>
              {tiles.map((t) => (
                <ActionTile
                  key={t.key}
                  icon={t.icon}
                  label={t.label}
                  tone={group.tone}
                  onClick={t.onClick}
                  disabled={t.disabled}
                />
              ))}
            </ActionTileGroup>
          );
        })}
      </div>
    </Modal>
  );
};
