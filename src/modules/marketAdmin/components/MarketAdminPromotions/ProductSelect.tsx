"use client";

import { Select } from "antd";
import { cn } from "@/utils/utils";
import { Product } from "@/types/products/products";

export default function ProductSelect({
  products,
  value,
  excludedIds,
  size = "middle",
  className,
  onChange
}: {
  products: Product[];
  value: number;
  excludedIds: number[];
  size?: "small" | "middle";
  className?: string;
  onChange: (productId: number) => void;
}) {
  const taken = new Set(excludedIds);
  // El valor propio siempre queda en la lista: sin él AntD muestra el id crudo en vez del label.
  const options = products
    .filter((p) => p.id === value || !taken.has(p.id))
    .map((p) => ({ value: p.id, label: p.description }));

  return (
    <Select
      showSearch
      size={size}
      placeholder="Selecciona un producto"
      value={value || undefined}
      options={options}
      onChange={onChange}
      notFoundContent="Sin productos disponibles"
      filterOption={(input, option) =>
        (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
      }
      className={cn(
        "flex-1 min-w-0 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#DDDDDD]",
        className
      )}
      popupClassName="[&_.ant-select-item]:!text-sm"
    />
  );
}
