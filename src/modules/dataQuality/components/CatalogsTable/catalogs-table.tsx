"use client";

import { ReactNode, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit, Trash2, History } from "lucide-react";
import { Button as AntButton, Dropdown, Pagination, Spin, message } from "antd";
import { DotsThreeVertical, DropboxLogo } from "@phosphor-icons/react";
import { useTranslations } from "use-intl";
import { Badge } from "@/modules/chat/ui/badge";
import { Button } from "@/modules/chat/ui/button";
import { Switch } from "@/modules/chat/ui/switch";
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
import { ModalMaterialEquivalences } from "../ModalMaterialEquivalences/ModalMaterialEquivalences";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import {
  createCatalog,
  editCatalog,
  deleteCatalog,
  convertMaterialToPack,
  downloadUnifiedCatalogFile,
  uploadCatalogMaterial
} from "@/services/dataQuality/dataQuality";
import { ModalUploadFile } from "@/components/atoms/ModalUploadFile/ModalUploadFile";
import { CatalogMaterialsActionsModal } from "../CatalogMaterialsActionsModal/CatalogMaterialsActionsModal";
import { useCatalogsDataQuality } from "../../hooks/useCatalogsDataQuality";
import { useDebounce } from "@/hooks/useDeabouce";
import "./catalogs-table.scss";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Activo":
      return (
        <Badge variant="secondary" className="text-[13px] bg-green-100 text-green-800">
          {status}
        </Badge>
      );
    case "Sin equivalencia":
      return (
        <Badge variant="secondary" className="text-[13px] bg-red-100 text-red-800">
          {status}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-[13px]">
          {status}
        </Badge>
      );
  }
};

export function CatalogsTable() {
  const t = useTranslations("dataQuality.catalogsTable");
  const tUploads = useTranslations("dataQuality.countryView");
  const tCommon = useTranslations("common");
  const params = useParams();
  const countryId = Number(params.countryId) || 0;
  const clientId = Number(params.clientId) || 0;

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 400);
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: equivalencies = [],
    isLoading,
    error,
    mutate
  } = useCatalogsDataQuality(String(params.clientId), String(params.countryId), debouncedSearch);

  const [mode, setMode] = useState<"create" | "edit">("create");
  const [selectedCatalog, setSelectedCatalog] = useState<IGetCatalogs | null>(null);
  const [whichModalOpen, setWhichModalOpen] = useState({ selected: 0 });
  const [isLoadingAction, setIsLoadingAction] = useState(false);
  const [isDownloadCatalogLoading, setIsDownloadCatalogLoading] = useState(false);
  const [isUploadLoading, setIsUploadLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const itemsPerPage = 25;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquivalencies = equivalencies.slice(startIndex, startIndex + itemsPerPage);

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
      message.success(t("markedAsPack"));
    } catch (error) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  const handleToggleExclusion = async (item: IGetCatalogs, excluded: number) => {
    setIsLoadingAction(true);
    try {
      await editCatalog(item.id, { excluded });
      mutate();
      message.success(excluded ? t("productExcluded") : t("productIncluded"));
    } catch (error) {
      message.error(t("exclusionError"));
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDownloadCatalog = async () => {
    setIsDownloadCatalogLoading(true);
    const hide = message.open({
      type: "loading",
      content: tUploads("downloadingCatalog"),
      duration: 0
    });
    try {
      const res = await downloadUnifiedCatalogFile({ clientId, countryId });
      const link = document.createElement("a");
      link.href = res.url;
      link.setAttribute("download", res.filename || "catalogo.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      message.success(tUploads("catalogDownloaded"));
      setWhichModalOpen({ selected: 0 });
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || error?.message || tUploads("catalogDownloadError");
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
      message.success(tUploads("materialsAuxUploaded"));
      setWhichModalOpen({ selected: 0 });
      mutate();
    } catch (error) {
      message.error(error instanceof Error ? error.message : tUploads("materialsAuxUploadError"));
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
      factor: data.factor,
      excluded: data.excluded ? 1 : 0
    };
    setIsLoadingAction(true);
    try {
      if (mode === "create") {
        await createCatalog(modelData);
        mutate();
        message.success(t("created"));
      } else {
        if (!selectedCatalog) return;
        await editCatalog(selectedCatalog.id, modelData);
        mutate();
        message.success(t("updated"));
      }
      setWhichModalOpen({ selected: 0 });
      setSelectedCatalog(null);
    } catch (error) {
      message.error(mode === "create" ? t("createError") : t("updateError"));
    } finally {
      setIsLoadingAction(false);
    }
  };

  const handleDeleteCatalog = async (catalog: IGetCatalogs) => {
    setIsLoadingAction(true);
    try {
      await deleteCatalog(catalog.id);
      mutate();
      message.success(t("deleted"));
      setWhichModalOpen({ selected: 0 });
      setSelectedCatalog(null);
    } catch (error) {
      message.error(t("deleteError"));
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
              placeholder={tCommon("placeholders.search")}
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
            {t("newEquivalence")}
          </Button>
        </div>
        {error ? (
          <div className="bg-white rounded-lg p-6 text-center">
            <p className="text-red-600">
              {error instanceof Error ? error.message : t("loadError")}
            </p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow style={{ borderColor: "#DDDDDD" }}>
                  <TableHead style={{ color: "#141414" }}>{t("columns.customerCode")}</TableHead>
                  <TableHead style={{ color: "#141414" }}>{t("columns.customerProduct")}</TableHead>
                  <TableHead style={{ color: "#141414" }}>GMN</TableHead>
                  <TableHead style={{ color: "#141414" }}>MATCH</TableHead>
                  <TableHead style={{ color: "#141414" }}>{t("columns.productName")}</TableHead>
                  <TableHead style={{ color: "#141414" }}>{t("columns.factor")}</TableHead>
                  <TableHead style={{ color: "#141414" }}>{t("columns.exclusion")}</TableHead>
                  <TableHead style={{ color: "#141414" }}>{t("columns.status")}</TableHead>
                  <TableHead style={{ color: "#141414" }}>{t("columns.updatedAt")}</TableHead>
                  <TableHead style={{ color: "#141414" }}>{t("columns.user")}</TableHead>
                  <TableHead style={{ color: "#141414" }}>{t("columns.actions")}</TableHead>
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
                      <span
                        style={{
                          color: item.MATCH === "TRUE" ? "#166534" : "#B91C1C",
                          fontWeight: 600
                        }}
                      >
                        {item.MATCH === "TRUE" ? "MATCH" : "NO MATCH"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span style={{ color: "#141414" }}>{item.material_name}</span>
                    </TableCell>
                    <TableCell>
                      <span style={{ color: "#141414" }}>{item.factor}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={item.excluded === 1}
                          disabled={isLoadingAction}
                          onCheckedChange={(checked) =>
                            handleToggleExclusion(item, checked ? 1 : 0)
                          }
                        />
                        <span style={{ color: item.excluded === 1 ? "#cf1322" : "#141414" }}>
                          {item.excluded === 1 ? t("excluded") : t("included")}
                        </span>
                      </div>
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
                                {tCommon("actions.edit")}
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
                                {tCommon("actions.delete")}
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
                                {t("markAsPack")}
                              </AntButton>
                            )
                          },
                          {
                            key: "4",
                            label: (
                              <AntButton
                                icon={<History className="w-4 h-4" />}
                                className="buttonNoBorder"
                                onClick={() => {
                                  setSelectedCatalog(item);
                                  setHistoryOpen(true);
                                }}
                              >
                                {t("viewHistory")}
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
                {t("showing", {
                  count: paginatedEquivalencies.length,
                  total: equivalencies.length
                })}
              </div>
              <Pagination
                current={currentPage}
                onChange={(page) => setCurrentPage(page)}
                total={equivalencies.length}
                pageSize={itemsPerPage}
                showSizeChanger={false}
              />
            </div>
          </>
        )}

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
          title={t("confirmDelete")}
          okText={tCommon("actions.delete")}
          okLoading={isLoadingAction}
        />

        <CatalogMaterialsActionsModal
          isOpen={whichModalOpen.selected === 3}
          onClose={() => setWhichModalOpen({ selected: 0 })}
          activeTab="materiales"
          onDownloadCatalog={handleDownloadCatalog}
          isDownloadCatalogLoading={isDownloadCatalogLoading}
          onUploadMaterialsAuxiliary={() => setWhichModalOpen({ selected: 4 })}
        />

        <ModalMaterialEquivalences
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          catalogMaterialId={selectedCatalog?.id}
          clientCode={selectedCatalog?.customer_product_cod}
          clientName={selectedCatalog?.customer_product_description}
          onReopenParent={() => setHistoryOpen(true)}
          mutateMaterials={() => mutate()}
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
