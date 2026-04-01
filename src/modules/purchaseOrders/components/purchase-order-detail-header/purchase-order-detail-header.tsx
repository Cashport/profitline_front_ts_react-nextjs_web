import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Dropdown as AntDropdown, message } from "antd";
import {
  ArrowLeft,
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
import { sendPackageToBilling } from "@/services/purchaseOrders/purchaseOrders";
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
  mutate
}: PurchaseOrderDetailHeaderProps) {
  const router = useRouter();
  const formatMoney = useAppStore((state) => state.formatMoney);

  const currentSiblingOrder = useMemo(() => {
    return data?.package?.sibilingOrders?.find((order) => String(order.id) === orderId);
  }, [data?.package?.sibilingOrders, orderId]);

  const siblingOrders = data?.package?.sibilingOrders ?? [];

  const [isBillingLoading, setIsBillingLoading] = useState(false);
  const [isBillingConfirmOpen, setIsBillingConfirmOpen] = useState(false);

  const allowedStatesForDownload = ["En despacho", "Entregado"];
  const allowedStatesForBackOrder = ["Procesado", "En aprobaciones", "Novedad"];

  if (isCreating) {
    const activeFile = files?.[activeFileIndex];
    return (
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/purchase-orders")}
            className="text-cashport-black hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>
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
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatFileSize(file.size)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 px-4 py-2.5">
                    <span className="text-xs text-gray-500">{files.length} archivos</span>
                  </div>
                </div>
              )}
            >
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">
                <FileText className="h-3.5 w-3.5 text-cashport-green" />
                <span className="text-sm font-medium truncate max-w-[200px]">
                  {activeFile?.name ?? "Sin archivo"}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </AntDropdown>
          )}
          {files && files.length === 1 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50">
              <FileText className="h-3.5 w-3.5 text-cashport-green" />
              <span className="text-sm font-medium truncate max-w-[200px]">
                {activeFile?.name ?? "Sin archivo"}
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
    const hideLoading = message.loading("Enviando pedido a facturación...", 0);

    try {
      await sendPackageToBilling(String(packageId), send_approval ? 1 : 0);
      message.success("Pedido enviado a facturación exitosamente");
      mutate?.();
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.data?.misstake_type === "INSUFFICIENT_QUOTA") {
          setIsBillingConfirmOpen(true);
        } else {
          message.error(error.message || "Error enviando pedido a facturación");
        }
      } else {
        message.error("Error enviando pedido a facturación");
      }
    } finally {
      hideLoading();
      setIsBillingLoading(false);
    }
  };

  const actionItems: DropdownItem[] = [
    {
      key: "billing",
      label: "Enviar a facturación",
      icon: <Invoice className="h-4 w-4" />,
      onClick: () => handleSendToBilling(),
      disabled: data?.status_name !== "Procesado" || isBillingLoading
    },
    {
      key: "invoice",
      label: "Cargar factura",
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => onOpenModal?.(3),
      disabled: data?.status_name !== "En facturación"
    },
    {
      key: "dispatch",
      label: "Confirmar despacho/entrega",
      icon: <PackageCheck className="h-4 w-4" />,
      onClick: () => onOpenModal?.(4),
      disabled: data?.status_name !== "En despacho"
    },
    {
      key: "back-order",
      label: "Marcar como Backorder",
      icon: <Boxes className="h-4 w-4" />,
      onClick: () => onOpenModal?.(8),
      disabled: !allowedStatesForBackOrder.includes(data?.status_name ?? "")
    },
    {
      key: "divider-1",
      type: "divider"
    },
    {
      key: "download",
      label: "Descargar plano",
      icon: <FileOutput className="h-4 w-4" />,
      onClick: onDownloadCSV,
      disabled: !allowedStatesForDownload.includes(data?.status_name ?? "")
    }
  ];

  return (
    <>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/purchase-orders")}
            className="text-cashport-black hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 " />
            Volver
          </Button>
          <GeneralDropdown items={actionItems} align="start" customDropdownClass="m-0">
            <ButtonGenerateAction
              icon={<MoreHorizontal className="h-4 w-4" />}
              title="Generar acción"
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
                  Guardar
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4" />
                  Editar
                </>
              )}
            </Button>
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
              Ver aprobación
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
                        onClick={() => router.push(`/purchase-orders/${sibling.id}`)}
                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 ${
                          String(sibling.id) === orderId ? "bg-gray-100" : ""
                        }`}
                      >
                        <Badge
                          className="text-white text-xs font-medium border-transparent flex-shrink-0"
                          style={{
                            backgroundColor: sibling.statusColor || "#B0BEC5",
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "6px"
                          }}
                        >
                          {sibling.status}
                        </Badge>
                        <span className="text-sm font-medium truncate flex-1">
                          {sibling.orderNumber}
                        </span>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatMoney(sibling.totalAmount)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-gray-200 px-4 py-2.5 flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {data?.package.totalOrders} ordenes
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
                <span className="text-xs text-gray-400">
                  {formatMoney(currentSiblingOrder?.totalAmount ?? 0)}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </AntDropdown>
          )}
          <Badge
            className="text-white px-3 py-1 text-sm font-medium"
            style={{ backgroundColor: data?.status_color || "#B0BEC5" }}
          >
            {data?.status_name ? data.status_name : "Desconocido"}
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
        title="¿Desea enviar a aprobación? "
        content="El cliente no tiene cupo suficiente para gestionar el pedido"
        okText="Enviar aprobación"
        cancelText="Cancelar"
      />
    </>
  );
}
