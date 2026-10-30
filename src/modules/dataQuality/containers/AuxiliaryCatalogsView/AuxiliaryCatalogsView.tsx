"use client";

import { useState } from "react";
import { message } from "antd";

import Header from "@/components/organisms/header";
import { AuxiliaryFilesTable } from "../../components/AuxiliaryFilesTable";
import { CountryClientsActionsModal } from "../../components/CountryClientsActionsModal/CountryClientsActionsModal";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import { ModalGmnOficiales } from "../../components/ModalGmnOficiales/ModalGmnOficiales";

import { Button } from "@/modules/chat/ui/button";

import { useAppStore } from "@/lib/store/store";
import { canManageAuxiliaries } from "@/utils/utils";
import {
  downloadUnifiedCatalogFile,
  downloadCatalogFile,
  downloadPointsOfSaleFile,
  uploadCatalogMaterial,
  uploadPointsOfSaleFile,
  uploadPacksFile
} from "@/services/dataQuality/dataQuality";
import { useIntakeStructureUpload } from "@/components/molecules/modals/ModalIntakeStructure/useIntakeStructureUpload";

type UploadKind = "materials" | "pos" | "packs";

export default function AuxiliaryCatalogsView() {
  const selectedProject = useAppStore((projects) => projects.selectedProject);
  const canManage = canManageAuxiliaries(selectedProject);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [gmnOpen, setGmnOpen] = useState(false);
  const [uploadKind, setUploadKind] = useState<UploadKind>("materials");
  const [uploading, setUploading] = useState(false);
  const [downloadingCatalog, setDownloadingCatalog] = useState(false);
  const { runUpload, structureModals } = useIntakeStructureUpload();

  const runDownload = async (fn: () => Promise<{ url: string }>, ok: string) => {
    const hide = message.open({ type: "loading", content: "Descargando...", duration: 0 });
    try {
      const res = await fn();
      window.open(res.url, "_blank");
      message.success(ok);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al descargar el archivo.");
    } finally {
      hide();
    }
  };

  const openUpload = (kind: UploadKind) => {
    setUploadKind(kind);
    setActionsOpen(false);
    setUploadOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const uploaded = await runUpload((useAsTemplate) => {
        if (uploadKind === "materials") return uploadCatalogMaterial(file, useAsTemplate);
        if (uploadKind === "pos") return uploadPointsOfSaleFile(file, useAsTemplate);
        return uploadPacksFile(file, useAsTemplate);
      });
      if (!uploaded) return;
      message.success("Archivo cargado exitosamente.");
      setUploadOpen(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al cargar el archivo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="cp-page">
      {/* Sin data-readonly no existe "vista general": el landing reducido de /data-quality
          expone el acceso a Auxiliares, por eso "‹" vuelve allí. */}
      <Header
        title="Auxiliares LATAM"
        back="/data-quality"
        actionsExtra={
          canManage && (
            <Button
              variant="outline"
              className="text-[#141414]"
              onClick={() => setActionsOpen(true)}
            >
              Acciones
            </Button>
          )
        }
      />
      {/* Main Content */}
      <div className="cp-card flex flex-col gap-2 px-[18px] py-[14px]">
        <AuxiliaryFilesTable />
      </div>

      {canManage && (
        <CountryClientsActionsModal
          isOpen={actionsOpen}
          onClose={() => setActionsOpen(false)}
          onlyGmnOficiales
          onDownloadCatalog={() => {
            setDownloadingCatalog(true);
            runDownload(
              () => downloadUnifiedCatalogFile({}),
              "Catálogo descargado exitosamente."
            ).finally(() => setDownloadingCatalog(false));
          }}
          isDownloadCatalogLoading={downloadingCatalog}
          onDownloadMaterials={() =>
            runDownload(() => downloadCatalogFile({}), "Auxiliar de materiales descargado.")
          }
          onUploadMaterialsAuxiliary={() => openUpload("materials")}
          onDownloadPointsOfSale={() =>
            runDownload(() => downloadPointsOfSaleFile({}), "Puntos de venta descargados.")
          }
          onUploadPointsOfSale={() => openUpload("pos")}
          onUploadPacks={() => openUpload("packs")}
          onUploadGmnOficiales={() => {
            setActionsOpen(false);
            setGmnOpen(true);
          }}
        />
      )}

      <ModalGmnOficiales isOpen={gmnOpen} onClose={() => setGmnOpen(false)} />

      <ModalUploadFile
        isOpen={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onFileUpload={handleUpload}
        loading={uploading}
        allowedExtensions={uploadKind === "pos" ? [".xls", ".xlsx", ".csv"] : [".xls", ".xlsx"]}
      />

      {structureModals}
    </div>
  );
}
