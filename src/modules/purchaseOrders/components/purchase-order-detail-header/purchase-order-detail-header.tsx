import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Dropdown as AntDropdown } from "antd";
import {
  ArrowLeft,
  Edit,
  MoreHorizontal,
  Save,
  Check,
  X,
  ChevronDown,
  Receipt,
  PackageCheck,
  Boxes,
  FileOutput
} from "lucide-react";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown";
import { IPurchaseOrderDetail } from "@/types/purchaseOrders/purchaseOrders";
import { useAppStore } from "@/lib/store/store";

interface PurchaseOrderDetailHeaderProps {
  data: IPurchaseOrderDetail;
  orderId: string;
  isEditMode: boolean;
  onEditToggle: () => void;
  onOpenModal: (modal: number) => void;
  onDownloadCSV: () => void;
}

export function PurchaseOrderDetailHeader({
  data,
  orderId,
  isEditMode,
  onEditToggle,
  onOpenModal,
  onDownloadCSV
}: PurchaseOrderDetailHeaderProps) {
  const router = useRouter();
  const formatMoney = useAppStore((state) => state.formatMoney);

  const currentSiblingOrder = useMemo(() => {
    return data.package?.sibilingOrders?.find((order) => String(order.id) === orderId);
  }, [data.package?.sibilingOrders, orderId]);

  const siblingOrders = data.package?.sibilingOrders ?? [];

  const actionItems: DropdownItem[] = [
    {
      key: "invoice",
      label: "Cargar factura",
      icon: <Receipt className="h-4 w-4" />,
      onClick: () => onOpenModal(3)
    },
    {
      key: "dispatch",
      label: "Confirmar despacho",
      icon: <PackageCheck className="h-4 w-4" />,
      onClick: () => onOpenModal(4)
    },
    {
      key: "back-order",
      label: "Marcar como Backorder",
      icon: <Boxes className="h-4 w-4" />,
      onClick: () => onOpenModal(8)
    },
    {
      key: "divider-1",
      type: "divider"
    },
    {
      key: "download",
      label: "Descargar plano",
      icon: <FileOutput className="h-4 w-4" />,
      onClick: onDownloadCSV
    }
  ];

  return (
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
        <Button
          variant="ghost"
          size="sm"
          onClick={onEditToggle}
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
      </div>
      <div className="flex items-center gap-2">
        {!!data.approvation && (
          <div className="flex items-center gap-2 mr-2">
            <Button
              variant="outline"
              onClick={() => onOpenModal(5)}
              className="rounded-full border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 h-auto flex items-center gap-2"
            >
              <Check className="h-4 w-4" style={{ color: "#CBE71E" }} />
              <span className="text-sm font-medium text-black">Aprobar</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenModal(6)}
              className="rounded-full border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 h-auto flex items-center gap-2"
            >
              <X className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-black">Rechazar</span>
            </Button>
          </div>
        )}
        {!!data.approvation && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {}}
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
                  <span className="text-xs text-gray-500">{data.package.totalOrders} ordenes</span>
                  <span className="text-sm font-bold">{formatMoney(data.package.totalAmount)}</span>
                </div>
              </div>
            )}
          >
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-gray-300 bg-white hover:bg-gray-50 cursor-pointer">
              <span className="text-sm font-medium">
                {currentSiblingOrder?.orderNumber ?? data.purchase_order_number}
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
          style={{ backgroundColor: data.status_color || "#B0BEC5" }}
        >
          {data.status_name ? data.status_name : "Desconocido"}
        </Badge>
      </div>
    </div>
  );
}
