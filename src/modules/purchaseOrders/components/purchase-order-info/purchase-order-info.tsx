import React from "react";
import { Input } from "@/modules/chat/ui/input";

// Interfaces de datos
interface GeneralInfo {
  numeroFactura: string;
  comprador: string;
  fechaFactura: string;
  vendedor: string;
  fechaVencimiento: string;
}

interface DeliveryInfo {
  fechaEntrega: string;
  direccion: string;
  ciudad: string;
  observacion: string;
}

// Props del componente
interface PurchaseOrderInfoProps {
  isEditMode: boolean;
  generalInfo: GeneralInfo;
  deliveryInfo: DeliveryInfo;
  onGeneralInfoChange: (field: keyof GeneralInfo, value: string) => void;
  onDeliveryInfoChange: (field: keyof DeliveryInfo, value: string) => void;
}

export function PurchaseOrderInfo({
  isEditMode,
  generalInfo,
  deliveryInfo,
  onGeneralInfoChange,
  onDeliveryInfoChange
}: PurchaseOrderInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-8 mb-6">
      <div>
        <h3 className="text-lg font-semibold text-cashport-black mb-4">
          Información General
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground tracking-wide">
              Orden de compra
            </label>
            {isEditMode ? (
              <Input
                value={generalInfo.numeroFactura}
                onChange={(e) => onGeneralInfoChange("numeroFactura", e.target.value)}
                className="mt-1 h-8 text-sm font-semibold"
              />
            ) : (
              <p className="text-sm font-semibold text-cashport-black mt-1">
                {generalInfo.numeroFactura}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground tracking-wide">
              Cliente
            </label>
            {isEditMode ? (
              <Input
                value={generalInfo.comprador}
                onChange={(e) => onGeneralInfoChange("comprador", e.target.value)}
                className="mt-1 h-8 text-sm font-semibold"
              />
            ) : (
              <p className="text-sm font-semibold text-cashport-black mt-1">
                {generalInfo.comprador}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground tracking-wide">
              Fecha
            </label>
            {isEditMode ? (
              <Input
                value={generalInfo.fechaFactura}
                onChange={(e) => onGeneralInfoChange("fechaFactura", e.target.value)}
                className="mt-1 h-8 text-sm font-semibold"
              />
            ) : (
              <p className="text-sm font-semibold text-cashport-black mt-1">
                {generalInfo.fechaFactura}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-cashport-black mb-4">
          Información de Entrega
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground tracking-wide">
              Fecha/Hora entrega
            </label>
            {isEditMode ? (
              <Input
                value={deliveryInfo.fechaEntrega}
                onChange={(e) => onDeliveryInfoChange("fechaEntrega", e.target.value)}
                className="mt-1 h-8 text-sm font-semibold"
              />
            ) : (
              <p className="text-sm font-semibold text-cashport-black mt-1">
                {deliveryInfo.fechaEntrega || "-"}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground tracking-wide">
              Dirección completa
            </label>
            {isEditMode ? (
              <Input
                value={
                  deliveryInfo.direccion && deliveryInfo.ciudad
                    ? `${deliveryInfo.direccion}, ${deliveryInfo.ciudad}`
                    : deliveryInfo.direccion || deliveryInfo.ciudad || ""
                }
                onChange={(e) => {
                  const parts = e.target.value.split(",");
                  onDeliveryInfoChange("direccion", parts[0]?.trim() || "");
                  onDeliveryInfoChange("ciudad", parts[1]?.trim() || "");
                }}
                className="mt-1 h-8 text-sm font-semibold"
                placeholder="Dirección, Ciudad"
              />
            ) : (
              <p className="text-sm font-semibold text-cashport-black mt-1">
                {deliveryInfo.direccion && deliveryInfo.ciudad
                  ? `${deliveryInfo.direccion}, ${deliveryInfo.ciudad}`
                  : deliveryInfo.direccion || deliveryInfo.ciudad || "-"}
              </p>
            )}
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground tracking-wide">
              Observación
            </label>
            {isEditMode ? (
              <Input
                value={deliveryInfo.observacion}
                onChange={(e) => onDeliveryInfoChange("observacion", e.target.value)}
                className="mt-1 h-8 text-sm font-semibold"
              />
            ) : (
              <p className="text-sm font-semibold text-cashport-black mt-1">
                {deliveryInfo.observacion || "-"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export type { GeneralInfo, DeliveryInfo };
