"use client";

import { ReactNode } from "react";
import { InputNumber } from "antd";
import { useTranslations } from "use-intl";
import { IProfit360DevolucionResumen } from "@/types/reverseLogistics/IReverseLogistics";
import { DevolucionFotos } from "../DevolucionFotos/DevolucionFotos";

interface DevolucionInfoCardsProps {
  resumen: IProfit360DevolucionResumen;
  editing: boolean;
  onChangeCantidadEmbalaje: (cantidad: string) => void;
}

const Campo = ({ label, children }: { label: string; children: ReactNode }) => (
  <>
    <span className="text-xs text-gray-400">{label}</span>
    <div className="min-w-0 break-words text-sm text-gray-900">{children}</div>
  </>
);

// Tarjetas "Cliente" y "Embalaje y evidencia" del detalle. En edición solo la
// cantidad del embalaje es editable: precintos y fotos no se pueden actualizar
// (el endpoint pide `Precintos.Id` y la respuesta solo trae los códigos).
export function DevolucionInfoCards({
  resumen,
  editing,
  onChangeCantidadEmbalaje
}: DevolucionInfoCardsProps) {
  const t = useTranslations("reverseLogistics.returnDetail.infoCards");
  const precintos = resumen.precintos
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  const fotos = [
    {
      key: "packaging",
      label: t("photoGroups.packaging"),
      urls: resumen.imgsembalaje.filter(Boolean)
    },
    {
      key: "products",
      label: t("photoGroups.products"),
      urls: resumen.imgsproductos.filter(Boolean)
    }
  ];

  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-gray-200 md:grid-cols-2">
      <section className="flex flex-col gap-3 p-4">
        <h3 className="text-sm font-semibold text-gray-900">{t("customerTitle")}</h3>
        <div className="grid grid-cols-[88px_1fr] items-baseline gap-x-4 gap-y-2">
          <Campo label={t("customer")}>{resumen.cliente}</Campo>
          <Campo label={t("address")}>{resumen.direccion}</Campo>
          <Campo label={t("soldTo")}>
            {resumen.soldto}
            <span className="ml-4 mr-1.5 text-xs text-gray-400">{t("shipTo")}</span>
            {resumen.shipto}
          </Campo>
          <Campo label={t("contact")}>
            {[resumen.contacto, resumen.telefono].filter(Boolean).join(" · ")}
            {resumen.email ? (
              <a href={`mailto:${resumen.email}`} className="ml-3 break-all text-[#1677ff]">
                {resumen.email}
              </a>
            ) : null}
          </Campo>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-t border-gray-200 p-4 md:border-l md:border-t-0">
        <h3 className="text-sm font-semibold text-gray-900">{t("packagingTitle")}</h3>
        <div className="grid grid-cols-[88px_1fr] items-center gap-x-4 gap-y-2">
          <Campo label={t("packaging")}>
            <span className="flex items-center gap-1.5">
              {resumen.embalaje}
              <span className="text-gray-400">{t("quantity")}</span>
              {editing ? (
                <InputNumber
                  size="small"
                  min={1}
                  value={Number(resumen.cantidadEmbalaje)}
                  onChange={(value) => value !== null && onChangeCantidadEmbalaje(String(value))}
                />
              ) : (
                resumen.cantidadEmbalaje
              )}
            </span>
          </Campo>
          <Campo label={t("seals")}>
            {precintos.length ? (
              <div className="flex flex-wrap gap-1.5">
                {precintos.map((precinto) => (
                  <span
                    key={precinto}
                    className="inline-flex h-[22px] items-center rounded-md border border-gray-200 px-2 text-xs font-semibold"
                  >
                    {precinto}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400">{t("noSeals")}</span>
            )}
          </Campo>
          <Campo label={t("photos")}>
            <div className="flex flex-col gap-2">
              {fotos.map(({ key, label, urls }) => (
                <div key={key} className="flex flex-wrap items-center gap-2">
                  <span className="w-24 text-xs text-gray-500">
                    {t("photoCount", { label, count: urls.length })}
                  </span>
                  <DevolucionFotos urls={urls} />
                </div>
              ))}
            </div>
          </Campo>
        </div>
      </section>
    </div>
  );
}
