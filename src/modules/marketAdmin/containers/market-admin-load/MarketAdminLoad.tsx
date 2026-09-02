"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, Download, FileSpreadsheet, Plus, Upload } from "lucide-react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import GenericEyeButton from "@/components/ui/generic-eye-button";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import ModalDetalleCargue from "@/modules/marketAdmin/components/market-admin-load/ModalDetalleCargue";
import ModalNuevoEtl, {
  NuevoEtlFormValues
} from "@/modules/marketAdmin/components/market-admin-load/ModalNuevoEtl";
import { formatDate } from "@/modules/marketAdmin/components/market-admin-load/dataLoadUtils";
import { ETL_MOCK } from "@/modules/marketAdmin/mocks/dataLoad";
import { useMessageApi } from "@/context/MessageContext";
import { IMarketAdminEtl } from "@/types/marketAdmin/IMarketAdmin";

const PAGE_SIZE = 20;

const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export default function MarketAdminLoad() {
  const [etls, setEtls] = useState<IMarketAdminEtl[]>(ETL_MOCK);
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<string | null>(null);

  const { showMessage } = useMessageApi();

  const detailEtl = etls.find((e) => e.id === detailId) ?? null;

  const handleCreateEtl = (values: NuevoEtlFormValues) => {
    const nuevo: IMarketAdminEtl = {
      id: `etl${Date.now()}`,
      nombre: values.nombre,
      observacion: values.observacion || "Sin observación registrada.",
      detalle: values.observacion || "Sin información adicional registrada para este ETL.",
      ultimoArchivo: null,
      ultimoCargue: null,
      historial: []
    };
    setEtls((prev) => [nuevo, ...prev]);
    setShowCreate(false);
    setPage(1);
  };

  const triggerUpload = (id: string) => {
    uploadTargetRef.current = id;
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetId = uploadTargetRef.current;
    // El input se resetea siempre para poder volver a elegir el mismo archivo
    e.target.value = "";
    uploadTargetRef.current = null;
    if (!file || !targetId) return;

    const today = new Date().toISOString().slice(0, 10);
    setEtls((prev) =>
      prev.map((etl) =>
        etl.id === targetId
          ? {
              ...etl,
              ultimoArchivo: file.name,
              ultimoCargue: today,
              historial: [
                {
                  archivo: file.name,
                  fecha: today,
                  usuario: "tu.usuario@galderma.com",
                  estado: "Exitoso" as const
                },
                ...etl.historial
              ]
            }
          : etl
      )
    );
  };

  const descargarTemplate = (nombre: string) => {
    showMessage("info", `Descargando plantilla para "${nombre}"...`);
  };

  const descargarArchivo = (archivo: string) => {
    showMessage("info", `Descargando "${archivo}"...`);
  };

  const columns: ColumnsType<IMarketAdminEtl> = [
    {
      title: "Nombre",
      dataIndex: "nombre",
      key: "nombre",
      sorter: (a, b) => a.nombre.localeCompare(b.nombre),
      onHeaderCell: headerCell,
      render: (_, etl) => (
        <div className="min-w-0">
          <p className="text-sm font-medium text-[#141414] truncate">{etl.nombre}</p>
          <p className="text-xs text-[#999999] truncate mt-0.5">{etl.observacion}</p>
        </div>
      )
    },
    {
      title: "Último archivo cargado",
      dataIndex: "ultimoArchivo",
      key: "ultimoArchivo",
      onHeaderCell: headerCell,
      render: (archivo: string | null) =>
        archivo ? (
          <div className="flex items-center gap-2 min-w-0">
            <FileSpreadsheet size={14} className="text-[#1A7A1A] flex-shrink-0" />
            <span className="text-sm text-[#141414] truncate">{archivo}</span>
          </div>
        ) : (
          <span className="text-sm text-[#BBBBBB]">Sin cargues aún</span>
        )
    },
    {
      title: "Último cargue",
      dataIndex: "ultimoCargue",
      key: "ultimoCargue",
      width: 140,
      sorter: (a, b) => (a.ultimoCargue ?? "").localeCompare(b.ultimoCargue ?? ""),
      onHeaderCell: headerCell,
      render: (fecha: string | null) => (
        <span className="text-sm text-[#141414]">{formatDate(fecha)}</span>
      )
    },
    {
      title: "",
      key: "acciones",
      width: 210,
      onHeaderCell: headerCell,
      render: (_, etl) => (
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => descargarTemplate(etl.nombre)}
            title="Descargar template"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#E0E0E0] text-[#555555] hover:border-[#141414] hover:text-[#141414] transition-colors"
          >
            <Download size={13} /> Template
          </button>
          <button
            type="button"
            onClick={() => triggerUpload(etl.id)}
            title="Cargar archivo"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#141414] text-white hover:bg-[#2A2A2A] transition-colors"
          >
            <Upload size={13} /> Cargar
          </button>
          <GenericEyeButton onClick={() => setDetailId(etl.id)} />
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
          dataSource={etls}
          rowKey="id"
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

      <ModalDetalleCargue
        open={!!detailEtl}
        etl={detailEtl}
        onClose={() => setDetailId(null)}
        onUpload={triggerUpload}
        onDownloadTemplate={descargarTemplate}
        onDownloadFile={descargarArchivo}
      />

      <ModalNuevoEtl
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSend={handleCreateEtl}
      />
    </div>
  );
}
