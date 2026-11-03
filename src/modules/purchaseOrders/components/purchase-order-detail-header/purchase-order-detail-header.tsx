import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown as AntDropdown, message } from "antd";
import { useTranslations } from "use-intl";
import {
  Edit,
  MoreHorizontal,
  Save,
  ChevronDown,
  Receipt,
  PackageCheck,
  Boxes,
  FileOutput,
  FileText
} from "lucide-react";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown";
import { IPurchaseOrderDetail } from "@/types/purchaseOrders/purchaseOrders";
import { useAppStore } from "@/lib/store/store";
import {
  sendPackageToBilling,
  sendPurchaseOrderToRebilling,
  downloadMvpTxt,
  downloadMvpTxtV2
} from "@/services/purchaseOrders/purchaseOrders";
import { ApiError } from "@/utils/api/api";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { Invoice } from "@phosphor-icons/react";

interface PurchaseOrderDetailHeaderProps {
  isCreating?: boolean;
  files?: File[];
  activeFileIndex?: number;
  onFileChange?: (index: number) => void;
  data?: IPurchaseOrderDetail;
  orderId?: string;
  isEditMode?: boolean;
  canEdit?: boolean;
  onEditToggle?: () => void;
  onOpenModal?: (modal: number) => void;
  onDownloadCSV?: () => void;
  formId?: string;
  mutate?: () => void;
  onNavigate?: (url: string) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

export function PurchaseOrderDetailHeader({
  isCreating,
  files,
  activeFileIndex = 0,
  onFileChange,
  data,
  orderId,
  isEditMode,
  canEdit,
  onEditToggle,
  onOpenModal,
  onDownloadCSV,
  formId,
  mutate,
  onNavigate
}: PurchaseOrderDetailHeaderProps) {
  const t = useTranslations("purchaseOrders.detailHeader");
  const tActions = useTranslations("purchaseOrders.actionsModal");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const formatMoney = useAppStore((state) => state.formatMoney);

  const currentSiblingOrder = useMemo(() => {
    return data?.package?.sibilingOrders?.find((order) => String(order.id) === orderId);
  }, [data?.package?.sibilingOrders, orderId]);

  const siblingOrders = data?.package?.sibilingOrders ?? [];

  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isBillingConfirmOpen, setIsBillingConfirmOpen] = useState(false);
  const [isRebillingConfirmOpen, setIsRebillingConfirmOpen] = useState(false);
  const [isTxtErpLoading, setIsTxtErpLoading] = useState(false);
  const [isTxtEanLoading, setIsTxtEanLoading] = useState(false);

  const allowedStatesForDownload = ["En despacho", "Entregado"];
  const allowedStatesForBackOrder = ["Procesado", "En aprobaciones", "Novedad"];

  // Abbott 204: en "Generación TXT ERP" solo queda disponible "Descargar TXT ERP".
  const txtErpLocked = data?.status_name === "Generación TXT ERP";

  // TEMPORAL (Abbott 204): "Generar TXT ERP" oculto.
  // Para reactivarlo, cambiar únicamente este flag a true; el item del dropdown,
  // el handler y la llamada a downloadMvpTxt se conservan completos.
  const isTxtErpEnabled = false;

  const handleDownloadTxtErp = async () => {
    if (!orderId) return;
    setIsTxtErpLoading(true);
    const hideLoading = message.loading(t("generatingTxtErp"), 0);
    try {
      await downloadMvpTxt({ orderIds: [Number(orderId)], variant: "sku" });
      message.success(t("txtErpGenerated"));
      mutate?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("txtErpError"));
    } finally {
      hideLoading();
      setIsTxtErpLoading(false);
    }
  };

  const handleDownloadTxtEan = async () => {
    if (!orderId) return;
    setIsTxtEanLoading(true);
    const hideLoading = message.loading(tActions("generatingTxtEan"), 0);
    try {
      await downloadMvpTxtV2({ orderIds: [Number(orderId)], variant: "sku" });
      message.success(tActions("txtEanGenerated"));
      mutate?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : tActions("txtEanError"));
    } finally {
      hideLoading();
      setIsTxtEanLoading(false);
    }
  };

  if (isCreating) {
    const activeFile = files?.[activeFileIndex];
    return (
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        {/* El "‹" volver vive en el header compartido (DESIGN.md §4). */}
        <div className="flex items-center gap-2" />
        <div className="flex items-center gap-2">
          {files && files.length > 1 && (
            <AntDropdown
              trigger={["click"]}
              placement="bottomRight"
              dropdownRender={() => (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[300px]">
                  <div className="max-h-[300px] overflow-y-auto py-1">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        onClick={() => onFileChange?.(index)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 ${
                          index === activeFileIndex ? "bg-gray-100" : ""
                        }`}
                      >
                        <FileText className="h-4 w-4 text-cashport-green flex-shrink-0" />
                        <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                        <span className="text-[13px] text-gray-400 flex-shrink-0">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 px-4 py-2.5">
                    <span className="text-[13px] text-gray-500">
                      {t("filesCount", { count: files.length })}
                    </span>
                  </div>
                </div>
              )}
            >
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">
                <FileText className="h-3.5 w-3.5 text-cashport-green" />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {activeFile?.name ?? t("noFile")}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </AntDropdown>
          )}
          {files && files.length === 1 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50">
              <FileText className="h-3.5 w-3.5 text-cashport-green" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {activeFile?.name ?? t("noFile")}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleSendToBilling = async (send_approval?: boolean) => {
    const packageId = currentSiblingOrder?.packageId;
    if (!packageId) return;

    setIsBillingLoading(true);
    const hideLoading = message.loading(tActions("sendingToBilling"), 0);

    try {
      await sendPackageToBilling(String(packageId), send_approval ? 1 : 0);
      message.success(tActions("sentToBilling"));
      mutate?.();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.data?.misstake_type === "INSUFFICIENT_QUOTA") {
          setIsBillingConfirmOpen(true);
        } else {
          message.error(error.message || tActions("sendToBillingError"));
        }
      } else {
        message.error(tActions("sendToBillingError"));
      }
    } finally {
      hideLoading();
      setIsBillingLoading(false);
    }
  };

  const handleSendToRebilling = async () => {
    if (!orderId) return;

    const hideLoading = message.loading(t("sendingToRebilling"), 0);

    try {
      await sendPurchaseOrderToRebilling(orderId);
      message.success(t("sentToRebilling"));
      mutate?.();
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message || t("sendToRebillingError"));
      } else {
        message.error(t("sendToRebillingError"));
      }
    } finally {
      hideLoading();
    }
  };

  const actionItems: DropdownItem[] = [
    {
      key: "billing",
      label: tActions("sendToBilling"),
      icon: <Invoice className="h-4 w-4" />,
      onClick: () => handleSendToBilling(),
      disabled: data?.status_name !== "Procesado" || isBillingLoading || txtErpLocked
    },
    {
      key: "invoice",
      label: t("uploadInvoice"),
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => onOpenModal?.(3),
      disabled: data?.status_name !== "En facturación" || txtErpLocked
    },
    {
      key: "dispatch",
      label: t("confirmDispatchDelivery"),
      icon: <PackageCheck className="h-4 w-4" />,
      onClick: () => onOpenModal?.(4),
      disabled: data?.status_name !== "En despacho" || txtErpLocked
    },
    {
      key: "back-order",
      label: t("markAsBackorder"),
      icon: <Boxes className="h-4 w-4" />,
      onClick: () => onOpenModal?.(8),
      disabled: !allowedStatesForBackOrder.includes(data?.status_name ?? "") || txtErpLocked
    },
    {
      key: "rebilling",
      label: t("rebill"),
      icon: <Invoice className="h-4 w-4" />,
      onClick: () => setIsRebillingConfirmOpen(true),
      disabled: data?.status_name !== "Facturado" || txtErpLocked
    },
    {
      key: "confirm-rebilling",
      label: t("confirmRebilling"),
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => onOpenModal?.(11),
      disabled: data?.status_name !== "En refacturación" || txtErpLocked
    },
    // TEMPORAL (Abbott 204): ERP oculto; el item se conserva para reactivación.
    ...(isTxtErpEnabled && data?.project_id === 204
      ? [
          {
            key: "txt-erp",
            label: tActions("downloadTxtErp"),
            icon: <FileOutput className="h-4 w-4" />,
            onClick: handleDownloadTxtErp,
            disabled: isTxtErpLoading
          } as DropdownItem
        ]
      : []),
    ...(data?.project_id === 204
      ? [
          {
            key: "txt-ean",
            label: tActions("downloadTxtEan"),
            icon: <FileOutput className="h-4 w-4" />,
            onClick: handleDownloadTxtEan,
            disabled: isTxtEanLoading
          } as DropdownItem
        ]
      : []),
    {
      key: "divider-1",
      type: "divider"
    },
    {
      key: "download",
      label: tActions("downloadFlatFile"),
      icon: <FileOutput className="h-4 w-4" />,
      onClick: onDownloadCSV,
      disabled: !allowedStatesForDownload.includes(data?.status_name ?? "") || txtErpLocked
    }
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* El "‹" volver vive en el header compartido (DESIGN.md §4). */}
          <GeneralDropdown items={actionItems} align="start" customDropdownClass="m-0">
            <ButtonGenerateAction
              icon={<MoreHorizontal className="h-4 w-4" />}
              title={t("generateAction")}
              hideArrow
            />
          </GeneralDropdown>
          {canEdit && (
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={() => {
                if (isEditMode) {
                  const form = document.getElementById(formId!) as HTMLFormElement;
                  if (form) form.requestSubmit();
                } else {
                  onEditToggle?.();
                }
              }}
              className="h-[48px] px-4 bg-[#f7f7f7] border border-transparent font-semibold text-cashport-black hover:bg-gray-200"
            >
              {isEditMode ? (
                <>
                  <Save className="h-4 w-4 " />
                  {tCommon("actions.save")}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  {tCommon("actions.edit")}
                </>
              )}
            </Button>
          )}
          {data?.project_id === 204 && (data?.region || data?.delivery_destination_code) && (
            <span className="ml-2 text-[13px] text-gray-500">
              {data?.region ? t("region", { region: data.region }) : ""}
              {data?.region && data?.delivery_destination_code ? " · " : ""}
              {data?.delivery_destination_code
                ? t("destination", { code: data.delivery_destination_code })
                : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!!data?.approvation && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenModal?.(10)}
              className="h-[48px] px-4 bg-[#f7f7f7] border border-transparent font-semibold text-cashport-black hover:bg-gray-200"
            >
              {t("viewApproval")}
            </Button>
          )}
          {siblingOrders.length > 1 && (
            <AntDropdown
              trigger={["click"]}
              placement="bottomRight"
              dropdownRender={() => (
                <div className="bg-white rounded-lg shadow-lg border border-gray-200 min-w-[300px]">
                  <div className="max-h-[300px] overflow-y-auto py-1">
                    {siblingOrders.map((sibling) => (
                      <div
                        key={sibling.id}
                        onClick={() =>
                          (onNavigate ?? router.push)(`/purchase-orders/${sibling.id}`)
                        }
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 ${
                          String(sibling.id) === orderId ? "bg-gray-100" : ""
                        }`}
                      >
                        <Badge
                          className="text-white text-[13px] font-medium border-transparent flex-shrink-0"
                          style={{
                            backgroundColor: sibling.statusColor || "#B0BEC5",
                            fontSize: "13px",
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {sibling.status}
                        </Badge>
                        <span className="text-sm font-medium truncate flex-1">
                          {sibling.orderNumber}
                        </span>
                        <span className="text-[13px] text-gray-400 flex-shrink-0">
                          {formatMoney(sibling.totalAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 px-4 py-2.5 flex items-center justify-between">
                    <span className="text-[13px] text-gray-500">
                      {t("ordersCount", { count: data?.package.totalOrders ?? 0 })}
                    </span>
                    <span className="text-sm font-bold">
                      {formatMoney(data?.package.totalAmount ?? 0)}
                    </span>
                  </div>
                </div>
              )}
            >
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">
                <span className="text-sm font-medium">
                  {currentSiblingOrder?.orderNumber ?? data?.purchase_order_number}
                </span>
                <span className="text-[13px] text-gray-400">
                  {formatMoney(currentSiblingOrder?.totalAmount ?? 0)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </AntDropdown>
          )}
          <Badge
            className="text-white px-3 py-1 text-sm font-medium"
            style={{
              // Abbott (204) + novedad "OC duplicada": solo se cambia el fondo a rojo.
              backgroundColor:
                data?.project_id === 204 &&
                Array.isArray(data?.novelties) &&
                data.novelties.some((n) => n.novelty_type_name === "OC duplicada")
                  ? "#FF0000"
                  : data?.status_color || "#B0BEC5"
            }}
          >
            {data?.status_name ? data.status_name : t("unknownStatus")}
          </Badge>
        </div>
      </div>

      <ModalConfirmAction
        isOpen={isBillingConfirmOpen}
        onClose={() => setIsBillingConfirmOpen(false)}
        onOk={() => {
          setIsBillingConfirmOpen(false);
          handleSendToBilling(true);
        }}
        title={tActions("confirmSendToApproval")}
        content={tActions("insufficientCredit")}
        okText={tActions("sendForApproval")}
        cancelText={tCommon("actions.cancel")}
      />

      <ModalConfirmAction
        isOpen={isRebillingConfirmOpen}
        onClose={() => setIsRebillingConfirmOpen(false)}
        onOk={() => {
          setIsRebillingConfirmOpen(false);
          handleSendToRebilling();
        }}
        title={t("confirmRebillTitle")}
        content={t("confirmRebillContent")}
        okText={tCommon("actions.confirm")}
        cancelText={tCommon("actions.cancel")}
      />
    </>
  );
}
