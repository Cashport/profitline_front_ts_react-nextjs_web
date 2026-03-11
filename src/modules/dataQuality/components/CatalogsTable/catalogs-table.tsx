"use client";

import { ReactNode, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button as AntButton, Dropdown, Pagination, Spin, message } from "antd";
import { DotsThreeVertical, DropboxLogo } from "@phosphor-icons/react";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import UiSearchInput from "@/components/ui/search-input";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/modules/chat/ui/table";
import { IGetCatalogs, ICreateCatalogRequest } from "@/types/dataQuality/IDataQuality";
import ModalAddEditCatalog, { CatalogFormData } from "../ModalAddEditCatalog/ModalAddEditCatalog";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import {
  createCatalog,
  editCatalog,
  deleteCatalog,
  convertMaterialToPack,
  downloadCatalogFile,
  uploadCatalogMaterial
} from "@/services/dataQuality/dataQuality";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import { CatalogMaterialsActionsModal } from "../CatalogMaterialsActionsModal/CatalogMaterialsActionsModal";
import { useCatalogsDataQuality } from "../../hooks/useCatalogsDataQuality";
import "./catalogs-table.scss";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Activo":
      return (
        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
          {status}
        </Badge>
      );
    case "Sin equivalencia":
      return (
        <Badge variant="secondary" className="text-xs bg-red-100 text-red-800">
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
};

export function CatalogsTable() {
  const params = useParams();
  const countryId = Number(params.countryId) || 0;
  const clientId = Number(params.clientId) || 0;

  const {
    data: equivalencies = [],
    isLoading,
    mutate
  } = useCatalogsDataQuality(String(params.clientId), String(params.countryId));

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedCatalog, setSelectedCatalog] = useState<IGetCatalogs | null>(null);
  const [whichModalOpen, setWhichModalOpen] = useState({ selected: 0 });
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [isDownloadCatalogLoading, setIsDownloadCatalogLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);

  const itemsPerPage = 25;

  const filteredEquivalencies = equivalencies.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.customer_product_cod?.toLowerCase().includes(term) ||
      item.customer_product_description?.toLowerCase().includes(term) ||
      item.material_name?.toLowerCase().includes(term)
    );
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquivalencies = filteredEquivalencies.slice(startIndex, startIndex + itemsPerPage);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleEdit = (item: IGetCatalogs) => {
    setMode("edit");
    setSelectedCatalog(item);
    setWhichModalOpen({ selected: 1 });
  };

  const handleMarkAsPack = async (item: IGetCatalogs) => {
    try {
      await convertMaterialToPack(item.id);
      mutate();
      message.success("Material marcado como pack exitosamente");
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleDownloadCatalog = async () => {
    setIsDownloadCatalogLoading(true);
    const hide = message.open({
      type: "loading",
      content: "Descargando catálogo...",
      duration: 0
    });
    try {
      const res = await downloadCatalogFile({ clientId });
      const link = document.createElement("a");
      link.href = res.url;
      link.setAttribute("download", res.filename || "catalogo.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success("Catálogo descargado exitosamente.");
      setWhichModalOpen({ selected: 0 });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || "Error al descargar el catálogo.";
      message.error(errorMessage);
    } finally {
      hide();
      setIsDownloadCatalogLoading(false);
    }
  };

  const handleUploadMaterialsAuxiliary = async (file: File) => {
    setIsUploadLoading(true);
    try {
      await uploadCatalogMaterial(file);
      message.success("Archivo de auxiliar de materiales cargado exitosamente.");
      setWhichModalOpen({ selected: 0 });
      mutate();
    } catch (error) {
      message.error(
        error instanceof Error
          ? error.message
          : "Error al cargar el archivo de auxiliar de materiales."
      );
    } finally {
      setIsUploadLoading(false);
    }
  };

  const handleAddNew = () => {
    setMode("create");
    setSelectedCatalog(null);
    setWhichModalOpen({ selected: 1 });
  };

  const handleClose = () => {
    setWhichModalOpen({ selected: 0 });
    setSelectedCatalog(null);
  };

  const handleSave = async (data: CatalogFormData) => {
    const modelData: ICreateCatalogRequest = {
      id_client: clientId,
      id_country: countryId,
      customer_product_cod: data.customer_product_cod,
      customer_product_description: data.customer_product_description,
      product_type: Number(data.product_type),
      type_vol: Number(data.type_vol),
      material_code: Number(data.material_code),
      factor: data.factor
    };
    setIsLoadingAction(true);
    try {
      if (mode === "create") {
        await createCatalog(modelData);
        mutate();
        message.success("Catálogo creado exitosamente");
      } else {
        if (!selectedCatalog) return;
        await editCatalog(selectedCatalog.id, modelData);
        mutate();
        message.success("Catálogo actualizado exitosamente");
      }
      setWhichModalOpen({ selected: 0 });
      setSelectedCatalog(null);
    } catch (error) {
      message.error(
        mode === "create" ? "Error al crear el catálogo" : "Error al actualizar el catálogo"
      );
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteCatalog = async (catalog: IGetCatalogs) => {
    setIsLoadingAction(true);
    try {
      await deleteCatalog(catalog.id);
      mutate();
      message.success("Catálogo eliminado exitosamente");
      setWhichModalOpen({ selected: 0 });
      setSelectedCatalog(null);
    } catch (error) {
      message.error("Error al eliminar el catálogo");
    } finally {
      setIsLoadingAction(false);
    }
  };

  return (
    <Spin spinning={isLoading}>
      <div>
        {/* Toolbar */}
        <div className="flex items-center justify-between pb-4 gap-2 ">
          <div className="flex items-center gap-3">
            <UiSearchInput
              placeholder="Buscar por ID"
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <GenerateActionButton onClick={() => setWhichModalOpen({ selected: 3 })} />
          </div>
          <Button
            onClick={handleAddNew}
            className="text-sm font-medium"
            style={{
              backgroundColor: "#CBE71E",
              color: "#141414",
              border: "none"
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva Equivalencia
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={{ borderColor: "#DDDDDD" }}>
              <TableHead style={{ color: "#141414" }}>Código Cliente</TableHead>
              <TableHead style={{ color: "#141414" }}>Producto Cliente</TableHead>
              <TableHead style={{ color: "#141414" }}>SKU</TableHead>
              <TableHead style={{ color: "#141414" }}>Nombre Producto</TableHead>
              <TableHead style={{ color: "#141414" }}>Factor</TableHead>
              <TableHead style={{ color: "#141414" }}>Estado</TableHead>
              <TableHead style={{ color: "#141414" }}>Fecha Actualización</TableHead>
              <TableHead style={{ color: "#141414" }}>Usuario</TableHead>
              <TableHead style={{ color: "#141414" }}>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEquivalencies.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-gray-50"
                style={{ borderColor: "#DDDDDD" }}
              >
                <TableCell>
                  <span className="font-medium" style={{ color: "#141414" }}>
                    {item.customer_product_cod}
                  </span>
                </TableCell>
                <TableCell>
                  <span style={{ color: "#141414" }}>{item.customer_product_description}</span>
                </TableCell>
                <TableCell>
                  <span style={{ color: "#141414" }}>{item.material_code}</span>
                </TableCell>
                <TableCell>
                  <span style={{ color: "#141414" }}>{item.material_name}</span>
                </TableCell>
                <TableCell>
                  <span style={{ color: "#141414" }}>{item.factor}</span>
                </TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell>
                  <span style={{ color: "#141414" }}>-</span>
                </TableCell>
                <TableCell>
                  <span style={{ color: "#141414" }}>-</span>
                </TableCell>
                <TableCell>
                  {(() => {
                    const items = [
                      {
                        key: "1",
                        label: (
                          <AntButton
                            icon={<Edit className="w-4 h-4" />}
                            className="buttonNoBorder"
                            onClick={() => handleEdit(item)}
                          >
                            Editar
                          </AntButton>
                        )
                      },
                      {
                        key: "2",
                        label: (
                          <AntButton
                            icon={<Trash2 className="w-4 h-4" />}
                            className="buttonNoBorder"
                            onClick={() => {
                              setSelectedCatalog(item);
                              setWhichModalOpen({ selected: 2 });
                            }}
                          >
                            Eliminar
                          </AntButton>
                        )
                      },
                      {
                        key: "3",
                        label: (
                          <AntButton
                            icon={<DropboxLogo size={16} />}
                            className="buttonNoBorder"
                            onClick={() => handleMarkAsPack(item)}
                          >
                            Marcar como pack
                          </AntButton>
                        )
                      }
                    ];
                    const customDropdown = (menu: ReactNode) => (
                      <div className="dropdownCatalogsTable">{menu}</div>
                    );
                    return (
                      <Dropdown
                        dropdownRender={customDropdown}
                        menu={{ items }}
                        placement="bottomLeft"
                        trigger={["click"]}
                      >
                        <AntButton className="dotsBtn">
                          <DotsThreeVertical size={16} />
                        </AntButton>
                      </Dropdown>
                    );
                  })()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div
          className="mt-4 pt-4 border-t flex items-center justify-between"
          style={{ borderColor: "#DDDDDD" }}
        >
          <div className="text-sm" style={{ color: "#141414" }}>
            Mostrando {paginatedEquivalencies.length} de {filteredEquivalencies.length} productos
          </div>
          <Pagination
            current={currentPage}
            onChange={(page) => setCurrentPage(page)}
            total={filteredEquivalencies.length}
            pageSize={itemsPerPage}
            showSizeChanger={false}
          />
        </div>

        <ModalAddEditCatalog
          isOpen={whichModalOpen.selected === 1}
          onClose={handleClose}
          mode={mode}
          catalogData={selectedCatalog}
          onSave={handleSave}
          isLoadingCreateEdit={isLoadingAction}
          countryId={countryId}
        />

        <ModalConfirmAction
          isOpen={whichModalOpen.selected === 2}
          onClose={() => setWhichModalOpen({ selected: 0 })}
          onOk={() => {
            if (selectedCatalog) handleDeleteCatalog(selectedCatalog);
          }}
          title="¿Está seguro de eliminar?"
          okText="Eliminar"
          okLoading={isLoadingAction}
        />

        <CatalogMaterialsActionsModal
          isOpen={whichModalOpen.selected === 3}
          onClose={() => setWhichModalOpen({ selected: 0 })}
          onDownloadCatalog={handleDownloadCatalog}
          isDownloadCatalogLoading={isDownloadCatalogLoading}
          onUploadMaterialsAuxiliary={() => setWhichModalOpen({ selected: 4 })}
        />

        <ModalUploadFile
          isOpen={whichModalOpen.selected === 4}
          onClose={handleClose}
          onFileUpload={handleUploadMaterialsAuxiliary}
          loading={isUploadLoading}
          allowedExtensions={[
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".xls",
            ".xlsx",
            ".csv",
            ".txt",
            ".eml",
            ".msg"
          ]}
        />
      </div>
    </Spin>
  );
}
