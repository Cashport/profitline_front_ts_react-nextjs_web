"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useSWRConfig } from "swr";
import { ChevronLeft, Download, Plus, Upload } from "lucide-react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import PanelDetalleCargue from "@/modules/marketAdmin/components/market-admin-load/PanelDetalleCargue";
import ModalNuevoEtl, {
  NuevoEtlFormValues
} from "@/modules/marketAdmin/components/market-admin-load/ModalNuevoEtl";
import {
  getProfitLoaderTimelineKey,
  useProfitLoaders
} from "@/modules/marketAdmin/hooks/useProfitLoaders";
import { uploadProfitLoaderFile } from "@/services/marketAdmin/marketAdmin";
import { useMessageApi } from "@/context/MessageContext";
import { IProfitLoader } from "@/types/marketAdmin/IMarketAdmin";

const PAGE_SIZE = 20;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function MarketAdminLoad() {
  const { loaders, isLoading, mutate } = useProfitLoaders();
  const { mutate: globalMutate } = useSWRConfig();
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<number | null>(null);

  const { showMessage } = useMessageApi();

  // No existe endpoint para crear ETLs todavía: el modal queda pero sin efecto en la lista.
  const handleCreateEtl = (_values: NuevoEtlFormValues) => {
    setShowCreate(false);
    showMessage("info", "La creación de ETLs aún no está disponible.");
  };

  const triggerUpload = (id: number) => {
    uploadTargetRef.current = id;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = uploadTargetRef.current;
    // El input se resetea siempre para poder volver a elegir el mismo archivo
    e.target.value = "";
    uploadTargetRef.current = null;
    if (!file || !targetId) return;

    setUploadingId(targetId);
    try {
      await uploadProfitLoaderFile(targetId, file);
      showMessage("success", `Archivo "${file.name}" cargado correctamente.`);
      await Promise.all([mutate(), globalMutate(getProfitLoaderTimelineKey(targetId))]);
    } catch (error) {
      showMessage("error", "No se pudo cargar el archivo. Intenta de nuevo.");
    } finally {
      setUploadingId(null);
    }
  };

  const descargarTemplate = (nombre: string) => {
    showMessage("info", `Descargando plantilla para "${nombre}"...`);
  };

  const columns: ColumnsType<IProfitLoader> = [
    {
      title: "Nombre",
      dataIndex: "display_name",
      key: "display_name",
      sorter: (a, b) => a.display_name.localeCompare(b.display_name),
      onHeaderCell: headerCell,
      render: (_, loader) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#141414] truncate">{loader.display_name}</p>
          <p className="text-xs text-[#999999] break-words mt-0.5">{loader.description}</p>
        </div>
      )
    },
    {
      title: "Último archivo cargado",
      key: "ultimoArchivo",
      onHeaderCell: headerCell,
      // La lista de loaders no trae este dato; solo está disponible en el detalle (timeline).
      render: () => <span className="text-sm text-[#BBBBBB]">Sin cargues aún</span>
    },
    {
      title: "Último cargue",
      key: "ultimoCargue",
      width: 140,
      onHeaderCell: headerCell,
      render: () => <span className="text-sm text-[#BBBBBB]">—</span>
    },
    {
      title: "",
      key: "acciones",
      width: 210,
      onHeaderCell: headerCell,
      render: (_, loader) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => descargarTemplate(loader.display_name)}
            title="Descargar template"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E0E0E0] text-[#555555] hover:border-[#141414] hover:text-[#141414] transition-colors"
          >
            <Download size={13} /> Template
          </button>
          <button
            type="button"
            onClick={() => triggerUpload(loader.id)}
            disabled={uploadingId === loader.id}
            title="Cargar archivo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141414] text-white hover:bg-[#2A2A2A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload size={13} /> {uploadingId === loader.id ? "Cargando..." : "Cargar"}
          </button>
          <GenericEyeButton onClick={() => setDetailId(loader.id)} />
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen">
      <h1 className="text-2xl font-bold text-[#141414] mb-5">Cargue de información</h1>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileSelected}
      />

      <div className="bg-white rounded-lg overflow-hidden p-8 [&_.ant-table-cell:first-child]:pl-0 [&_.ant-table-cell:last-child]:pr-0 [&_.ant-table-pagination]:!mb-0">
        {/* Toolbar */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/market-admin"
            className="flex items-center justify-start w-8 h-8 rounded-lg text-[#666666] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
          >
            <ChevronLeft size={18} />
          </Link>
          <p className="text-sm text-[#999999] flex-1">
            ETLs manuales para alimentar el app cuando la sincronización automática falla.
          </p>

          {/* PrincipalButton fija height:100% con !important, por eso va dentro de un contenedor de alto fijo */}
          <div className="h-10 flex-shrink-0">
            <PrincipalButton onClick={() => setShowCreate(true)} icon={<Plus size={15} />}>
              Nuevo ETL
            </PrincipalButton>
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={loaders}
          rowKey="id"
          loading={isLoading}
          showSorterTooltip={false}
          locale={{ emptyText: "No hay ETLs configurados." }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            showSizeChanger: false,
            position: ["bottomRight"],
            showTotal: (total, range) => `Mostrando ${range[0]}–${range[1]} de ${total} ETLs`
          }}
          onChange={(pag, _filters, _sorter, extra) => {
            if (extra.action === "paginate") setPage(pag.current ?? 1);
          }}
        />
      </div>

      <PanelDetalleCargue
        open={!!detailId}
        loaderId={detailId}
        isUploading={uploadingId !== null && uploadingId === detailId}
        onClose={() => setDetailId(null)}
        onUpload={triggerUpload}
        onDownloadTemplate={descargarTemplate}
      />

      <ModalNuevoEtl
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSend={handleCreateEtl}
      />
    </div>
  );
}
