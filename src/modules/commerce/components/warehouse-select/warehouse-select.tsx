"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "antd";

import { ICityWarehouse } from "@/types/commerce/ICommerce";
import { getCityWarehouses } from "@/services/commerce/commerce";

import "./warehouse-select.scss";

interface IWarehouseSelectProps {
  value?: number;
  // eslint-disable-next-line no-unused-vars
  onChange: (warehouseId: number) => void;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
  status?: "error" | "warning";
}

// Reusable dispatch-warehouse select. Fetches the city/warehouse catalog once on
// mount and reports the chosen warehouse_id up via onChange. The label shows
// "CIUDAD - BODEGA"; the option value is the warehouse_id sent to the backend.
// Type-ahead search filters against the label (matches city or warehouse name).
export default function WarehouseSelect({
  value,
  onChange,
  disabled = false,
  size = "middle",
  className,
  status
}: IWarehouseSelectProps) {
  const [cityWarehouses, setCityWarehouses] = useState<ICityWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCityWarehouses = async () => {
      setIsLoading(true);
      try {
        const response = await getCityWarehouses();
        if (!cancelled) setCityWarehouses(response.data ?? []);
      } catch (error) {
        console.error("Error al obtener las bodegas por ciudad:", error);
        if (!cancelled) setCityWarehouses([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchCityWarehouses();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(
    () =>
      [...cityWarehouses]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((w) => ({
          key: w.id,
          value: w.warehouse_id,
          label: `${w.city_name} - ${w.warehouse_name}`
        })),
    [cityWarehouses]
  );

  return (
    <Select
      showSearch
      optionFilterProp="label"
      placeholder="Seleccione una bodega"
      value={value}
      onChange={(val: number) => onChange(val)}
      disabled={disabled}
      loading={isLoading}
      options={options}
      size={size}
      status={status}
      className={`warehouseSelect ${className ?? ""}`}
      popupClassName="warehouseSelectPopup"
      style={{ width: "100%" }}
    />
  );
}
