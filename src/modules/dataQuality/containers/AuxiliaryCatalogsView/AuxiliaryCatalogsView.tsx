"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { message } from "antd";

import Header from "@/components/organisms/header";
import { AuxiliaryFilesTable } from "../../components/AuxiliaryFilesTable";
import { CountryClientsActionsModal } from "../../components/CountryClientsActionsModal/CountryClientsActionsModal";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import { ModalGmnOficiales } from "../../components/ModalGmnOficiales/ModalGmnOficiales";

import { Button } from "@/modules/chat/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/modules/chat/ui/card";

import { useAppStore } from "@/lib/store/store";
import { canManageAuxiliaries, canReadDataQuality } from "@/utils/utils";
import {
  downloadUnifiedCatalogFile,
  downloadCatalogFile,
  downloadPointsOfSaleFile,
  uploadCatalogMaterial,
  uploadPointsOfSaleFile,
  uploadPacksFile
} from "@/services/dataQuality/dataQuality";

type UploadKind = "materials" | "pos" | "packs";

export default function AuxiliaryCatalogsView() {
  const router = useRouter();
  const selectedProject = useAppStore((projects) => projects.selectedProject);
  const canManage = canManageAuxiliaries(selectedProject);
  const canSeeGeneral = canReadDataQuality(selectedProject);

  const [actionsOpen, setActionsOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [gmnOpen, setGmnOpen] = useState(false);
  const [uploadKind, setUploadKind] = useState<UploadKind>("materials");
  const [uploading, setUploading] = useState(false);
  const [downloadingCatalog, setDownloadingCatalog] = useState(false);

  // Navegación determinista: sin data-readonly no existe "vista general", el landing
  // reducido de /data-quality expone el acceso a Auxiliares.
  const handleGoBack = () => router.push("/data-quality");

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
      if (uploadKind === "materials") {
        await uploadCatalogMaterial(file);
      } else if (uploadKind === "pos") {
        await uploadPointsOfSaleFile(file);
      } else {
        await uploadPacksFile(file);
      }
      message.success("Archivo cargado exitosamente.");
      setUploadOpen(false);
    } catch (error) {
      message.error(error instanceof Error ? error.message : "Error al cargar el archivo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Header title="Auxiliares LATAM" />
      {/* Main Content */}
      <Card className="border-none gap-2 p-6">
        <div className="flex items-center justify-between">
          <Button
            onClick={handleGoBack}
            variant="ghost"
            size="sm"
            className="text-gray-700 hover:text-gray-900 w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            {canSeeGeneral ? "Volver a vista general" : "Volver"}
          </Button>

          {canManage && (
            <Button
              variant="outline"
              className="text-[#141414]"
              onClick={() => setActionsOpen(true)}
            >
              Acciones
            </Button>
          )}
        </div>

        <AuxiliaryFilesTable />
      </Card>

      {canManage && (
        <CountryClientsActionsModal
          isOpen={actionsOpen}
          onClose={() => setActionsOpen(false)}
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
    </div>
  );
}
