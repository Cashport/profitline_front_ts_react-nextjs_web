"use client";

import { useMemo, useState } from "react";
import { Select, Divider } from "antd";

import { ICityWarehouse } from "@/types/commerce/ICommerce";

import "./cities-select.scss";

interface ICitiesSelectProps {
  value?: string;
  // eslint-disable-next-line no-unused-vars
  onChange: (city: string) => void;
  /**
   * Emite el `warehouse_id` asociado a la ciudad recién seleccionada. Para
   * ciudades existentes se toma el `warehouse_id` de `cities`; para ciudades
   * recién creadas se emite `0` (sin bodega asignada).
   */
  // eslint-disable-next-line no-unused-vars
  onChangeWarehouseId: (warehouseId: number) => void;
  /** Lista de ciudades que llega del backend (source-of-truth). */
  cities: ICityWarehouse[];
  /** Estado de carga del fetch de `cities`. */
  isLoading?: boolean;
  placeholder?: string;
  disabled?: boolean;
  size?: "small" | "middle" | "large";
  className?: string;
  status?: "error" | "warning";
  autoFocus?: boolean;
}

export default function CitiesSelect({
  value,
  onChange,
  onChangeWarehouseId,
  cities,
  isLoading = false,
  placeholder = "Seleccione o escriba una ciudad",
  disabled = false,
  size = "middle",
  className,
  status,
  autoFocus
}: ICitiesSelectProps) {
  // Ciudades que el usuario creó desde este Select (no vienen del backend).
  // Se mergean con `cities` (prop) para armar la lista final de opciones,
  // sin caer en el anti-pattern de `useState(prop)` (que ignora updates).
  const [addedCities, setAddedCities] = useState<ICityWarehouse[]>([]);
  const [searchValue, setSearchValue] = useState("");

  const allCities = useMemo(() => [...cities, ...addedCities], [cities, addedCities]);

  // Deduplica por nombre (case-insensitive) — una ciudad puede venir asociada
  // a varias bodegas en el listado del backend.
  const options = useMemo(() => {
    const seen = new Set<string>();
    const result: { value: string; label: string; warehouseId: number }[] = [];
    for (const c of allCities) {
      const key = c.city_name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({ value: c.city_name, label: c.city_name, warehouseId: c.warehouse_id });
      }
    }
    return result;
  }, [allCities]);

  const trimmedSearch = searchValue.trim();

  const filteredOptions = useMemo(() => {
    if (!trimmedSearch) return options;
    const lower = trimmedSearch.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(lower));
  }, [options, trimmedSearch]);

  const exactMatch = useMemo(() => {
    if (!trimmedSearch) return true;
    return options.some((o) => o.label.toLowerCase() === trimmedSearch.toLowerCase());
  }, [options, trimmedSearch]);

  const handleAddNew = () => {
    if (!trimmedSearch || exactMatch) return;
    const newCity: ICityWarehouse = {
      id: 0,
      city_name: trimmedSearch,
      sort_order: allCities.length + 1,
      warehouse_id: 0,
      warehouse_name: ""
    };
    setAddedCities((prev) => [...prev, newCity]);
    onChange(trimmedSearch);
    onChangeWarehouseId(0);
    setSearchValue("");
  };

  const handleSelect = (cityName: string) => {
    onChange(cityName);
    const warehouseId =
      allCities.find((c) => c.city_name === cityName)?.warehouse_id ?? 0;
    onChangeWarehouseId(warehouseId);
    setSearchValue("");
  };

  return (
    <Select
      showSearch
      autoFocus={autoFocus}
      placeholder={placeholder}
      value={value}
      onChange={handleSelect}
      onSearch={setSearchValue}
      searchValue={searchValue}
      disabled={disabled}
      loading={isLoading}
      size={size}
      status={status}
      className={`citiesSelect ${className ?? ""}`}
      popupClassName="citiesSelectPopup"
      style={{ width: "100%" }}
      filterOption={false}
      notFoundContent={null}
      options={filteredOptions}
      dropdownRender={(menu) => (
        <>
          {menu}
          {trimmedSearch && !exactMatch && (
            <>
              <Divider style={{ margin: "4px 0" }} />
              <div
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleAddNew}
                className="citiesSelect__add"
              >
                Agregar &quot;{trimmedSearch}&quot;
              </div>
            </>
          )}
        </>
      )}
    />
  );
}
