"use client";

import { useEffect, useMemo, useState } from "react";
import { Select } from "antd";

import { IAllWarehouse } from "@/types/commerce/ICommerce";
import { getAllWarehouses } from "@/services/commerce/commerce";

import "./warehouse-select.scss";

interface IWarehouseSelectProps {
  value?: number;
  warehouseForced?: number;
  // eslint-disable-next-line no-unused-vars
  onChange: (warehouseId: number) => void;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
  status?: "error" | "warning";
}

export default function WarehouseSelect({
  value,
  warehouseForced,
  onChange,
  disabled = false,
  size = "middle",
  className,
  status
}: IWarehouseSelectProps) {
  const [warehouses, setWarehouses] = useState<IAllWarehouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchCityWarehouses = async () => {
      setIsLoading(true);
      try {
        const response = await getAllWarehouses();
        if (!cancelled) setWarehouses(response.data ?? []);
      } catch (error) {
        console.error("Error al obtener las bodegas por ciudad:", error);
        if (!cancelled) setWarehouses([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchCityWarehouses();
    return () => {
      cancelled = true;
    };
  }, []);

  const options = useMemo(() => {
    const warehousesFiltered = warehouseForced
      ? warehouses.filter((w) => w.id === warehouseForced)
      : warehouses;
    return warehousesFiltered.map((w) => ({
      key: w.id,
      value: w.id,
      label: `${w.warehouse} - ${w.warehouse_description}`
    }));
  }, [warehouses, warehouseForced]);

  // Cuando `warehouseForced` viene definido, el Select se bloquea en esa
  // bodega y queda deshabilitado. Se usa cuando el canal (businessUnit) del
  // contexto determina la bodega automáticamente vía `warehouseBu`.
  const isLocked = warehouseForced !== undefined;
  const effectiveDisabled = disabled || isLocked;
  const effectiveValue = isLocked ? warehouseForced : value;

  return (
    <Select
      showSearch
      optionFilterProp="label"
      placeholder="Seleccione una bodega"
      value={effectiveValue}
      onChange={(val: number) => onChange(val)}
      disabled={effectiveDisabled}
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
