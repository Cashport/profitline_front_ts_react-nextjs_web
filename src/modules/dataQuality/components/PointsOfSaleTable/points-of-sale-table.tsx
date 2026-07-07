"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";

import { message } from "antd";

import { usePointsOfSale } from "../../hooks/usePointsOfSale";
import { useDebounce } from "@/hooks/useDeabouce";
import { IPOS } from "@/types/dataQuality/IDataQuality";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { Plus } from "@phosphor-icons/react";
import { Edit, Trash2 } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { ModalAddEditPOS } from "../ModalAddEditPOS";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { CatalogMaterialsActionsModal } from "../CatalogMaterialsActionsModal/CatalogMaterialsActionsModal";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import {
  deletePointOfSale,
  downloadPointsOfSaleFile,
  uploadPointsOfSaleFile
} from "@/services/dataQuality/dataQuality";

export function PointsOfSaleTable() {
  const params = useParams();
  const clientId = params.clientId as string;
  const countryId = params.countryId as string;

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, mutate } = usePointsOfSale(clientId, countryId, debouncedSearch);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedPOS, setSelectedPOS] = useState<IPOS | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [whichModalOpen, setWhichModalOpen] = useState({ selected: 0 });
  const [isDownloadPointsOfSaleLoading, setIsDownloadPointsOfSaleLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const handleDownloadPointsOfSale = async () => {
    setIsDownloadPointsOfSaleLoading(true);
    const hide = message.open({
      type: "loading",
      content: "Descargando puntos de venta...",
      duration: 0
    });
    try {
      const res = await downloadPointsOfSaleFile({ clientId });
      const link = document.createElement("a");
      link.href = res.url;
      link.setAttribute("download", res.filename || "puntos_de_venta.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Puntos de venta descargados exitosamente.");
      setWhichModalOpen({ selected: 0 });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Error al descargar los puntos de venta.";
      message.error(errorMessage);
    } finally {
      hide();
      setIsDownloadPointsOfSaleLoading(false);
    }
  };

  const handleUploadPointsOfSale = async (file: File) => {
    setIsUploadLoading(true);
    try {
      await uploadPointsOfSaleFile(file);
      message.success("Archivo de puntos de venta cargado exitosamente.");
      setWhichModalOpen({ selected: 0 });
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error ? error.message : "Error al cargar el archivo de puntos de venta."
      );
    } finally {
      setIsUploadLoading(false);
    }
  };

  const handleEdit = (record: IPOS) => {
    setMode("edit");
    setSelectedPOS(record);
    setIsModalOpen(true);
  };

  const handleDeletePOS = async () => {
    if (!selectedPOS) return;
    setIsLoadingDelete(true);
    try {
      await deletePointOfSale(selectedPOS.id);
      mutate();
      message.success("Punto de venta eliminado exitosamente");
      setIsDeleteModalOpen(false);
      setSelectedPOS(null);
    } catch {
      message.error("Error al eliminar el punto de venta");
    } finally {
      setIsLoadingDelete(false);
    }
  };

  const columns: ColumnsType<IPOS> = [
    {
      title: "POS ID",
      dataIndex: "pos_id",
      key: "pos_id",
      onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
    },
    {
      title: "POS Name",
      dataIndex: "pos_name",
      key: "pos_name",
      onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
    },
    {
      title: "Channel",
      dataIndex: "channel",
      key: "channel",
      onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
    },
    {
      title: "Sub Channel",
      dataIndex: "sub_channel",
      key: "sub_channel",
      onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
    },
    {
      title: "Internal Sales Representation",
      dataIndex: "pos_internal_sales_representative",
      key: "pos_internal_sales_representative",
      onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } })
    },
    {
      title: "Acciones",
      key: "acciones",
      align: "right",
      onHeaderCell: () => ({ style: { color: "#141414", fontWeight: 600 } }),
      render: (_, record) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              setSelectedPOS(record);
              setIsDeleteModalOpen(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <UiSearchInput placeholder="Buscar" onChange={(e) => setSearch(e.target.value)} />
          <GenerateActionButton onClick={() => setWhichModalOpen({ selected: 1 })} />
        </div>

        <Button
          className="text-sm font-medium"
          style={{
            backgroundColor: "#CBE71E",
            color: "#141414",
            border: "none"
          }}
          onClick={() => {
            setMode("create");
            setSelectedPOS(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo POS
        </Button>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 7 }}
        size="small"
      />

      <ModalAddEditPOS
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPOS(null);
        }}
        clientId={Number(clientId)}
        countryId={Number(countryId)}
        onSuccess={mutate}
        mode={mode}
        posData={selectedPOS}
      />

      <ModalConfirmAction
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedPOS(null);
        }}
        onOk={handleDeletePOS}
        title="¿Está seguro de eliminar?"
        okText="Eliminar"
        okLoading={isLoadingDelete}
      />

      <CatalogMaterialsActionsModal
        isOpen={whichModalOpen.selected === 1}
        onClose={() => setWhichModalOpen({ selected: 0 })}
        activeTab="puntos-de-venta"
        onDownloadPointsOfSale={handleDownloadPointsOfSale}
        isDownloadPointsOfSaleLoading={isDownloadPointsOfSaleLoading}
        onUploadPointsOfSale={() => setWhichModalOpen({ selected: 2 })}
      />

      <ModalUploadFile
        isOpen={whichModalOpen.selected === 2}
        onClose={() => setWhichModalOpen({ selected: 0 })}
        onFileUpload={handleUploadPointsOfSale}
        loading={isUploadLoading}
        allowedExtensions={[".xls", ".xlsx", ".csv"]}
      />
    </div>
  );
}
