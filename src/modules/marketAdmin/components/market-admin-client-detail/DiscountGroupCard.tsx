"use client";

import { useState } from "react";
import { AutoComplete, Input, Select } from "antd";
import { Percent, Plus, Search, Trash2, X } from "lucide-react";
import { IDiscountGroup, IDiscountGroupProduct } from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  group: IDiscountGroup;
  index: number;
  catalog: IDiscountGroupProduct[];
  usedInOtherGroups: Set<number>;
  lineOptions: { label: string; value: number }[];
  isLoadingLines: boolean;
  onChange: (group: IDiscountGroup) => void;
  onRemove: () => void;
};

export default function DiscountGroupCard({
  group,
  index,
  catalog,
  usedInOtherGroups,
  lineOptions,
  isLoadingLines,
  onChange,
  onRemove
}: Props) {
  const [search, setSearch] = useState("");

  const lineName = lineOptions.find((l) => l.value === group.lineId)?.label;
  const idsInGroup = new Set(group.products.map((p) => p.id));
  const availableInLine = catalog.filter(
    (p) =>
      !idsInGroup.has(p.id) &&
      !usedInOtherGroups.has(p.id) &&
      (!group.lineId || p.lineId === group.lineId)
  );
  const results = search.trim()
    ? availableInLine.filter((p) => p.description.toLowerCase().includes(search.toLowerCase()))
    : availableInLine;

  const handleAddProduct = (productId: string) => {
    const product = availableInLine.find((p) => String(p.id) === productId);
    if (product) onChange({ ...group, products: [...group.products, product] });
    setSearch("");
  };

  const handleAddAll = () => {
    onChange({ ...group, products: [...group.products, ...availableInLine] });
    setSearch("");
  };

  const handleRemoveProduct = (productId: number) =>
    onChange({ ...group, products: group.products.filter((p) => p.id !== productId) });

  const handleLineChange = (lineId?: number) => {
    onChange({ ...group, lineId });
    setSearch("");
  };

  return (
    <div className="border border-[#EEEEEE] rounded-2xl bg-white">
      <div className="px-5 py-4 bg-[#FAFAFA] border-b border-[#EEEEEE] rounded-t-2xl">
        <div className="flex items-center gap-4 mb-1.5 pl-10">
          <span className="w-24 text-xs font-medium text-[#666666]">Descuento</span>
          <span className="w-28 text-xs font-medium text-[#666666]">Cantidad mínima</span>
          <span className="w-44 text-xs font-medium text-[#666666]">Línea</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="w-6 h-6 rounded-full bg-[#141414] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <div className="relative w-24">
            <input
              type="number"
              min={0}
              max={100}
              value={group.discount === 0 ? "" : group.discount}
              placeholder="0"
              onChange={(e) =>
                onChange({
                  ...group,
                  discount: Math.min(100, Math.max(0, Number(e.target.value)))
                })
              }
              className="w-full h-8 text-sm font-medium border border-[#DDDDDD] rounded-lg px-3 pr-7 focus:outline-none focus:border-[#141414] appearance-none text-right bg-white"
            />
            <Percent
              size={11}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#AAAAAA] pointer-events-none"
            />
          </div>
          <input
            type="number"
            min={1}
            value={group.units}
            onChange={(e) =>
              onChange({ ...group, units: Math.max(1, parseInt(e.target.value) || 1) })
            }
            className="w-28 h-8 text-sm font-medium border border-[#DDDDDD] rounded-lg px-3 focus:outline-none focus:border-[#141414] bg-white text-right"
          />
          <Select
            allowClear
            placeholder="Todas las líneas"
            value={group.lineId}
            options={lineOptions}
            loading={isLoadingLines}
            onChange={handleLineChange}
            className="w-44 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#DDDDDD]"
            popupClassName="[&_.ant-select-item]:!text-sm"
          />
          <button
            type="button"
            onClick={onRemove}
            title="Eliminar grupo"
            className="ml-auto w-8 h-8 flex items-center justify-center rounded-lg text-[#AAAAAA] hover:text-[#E53E3E] hover:bg-[#FFF5F5] transition-colors flex-shrink-0"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <AutoComplete
            value={search}
            onChange={setSearch}
            onSelect={handleAddProduct}
            filterOption={false}
            options={results.map((p) => ({
              value: String(p.id),
              label: (
                <div className="flex items-center justify-between gap-2 py-1">
                  <div>
                    <p className="text-sm text-[#141414]">{p.description}</p>
                    <p className="text-xs text-[#999999]">{p.lineName}</p>
                  </div>
                  <Plus size={14} className="text-[#141414] flex-shrink-0" />
                </div>
              )
            }))}
            notFoundContent={
              <span className="text-xs text-[#999999]">
                {search.trim()
                  ? "Sin resultados disponibles."
                  : "No hay más productos disponibles."}
              </span>
            }
            className="flex-1"
          >
            <Input
              prefix={<Search size={14} className="text-[#AAAAAA] mr-1.5" />}
              placeholder={
                lineName ? `Buscar producto de ${lineName}` : "Buscar producto para agregar..."
              }
              className="!rounded-lg !border-[#DDDDDD]"
            />
          </AutoComplete>
          {availableInLine.length > 0 && (
            <button
              type="button"
              onClick={handleAddAll}
              className="text-xs font-semibold text-[#141414] underline decoration-[#DDDDDD] hover:decoration-[#141414] transition-colors whitespace-nowrap flex-shrink-0"
            >
              Agregar todos
            </button>
          )}
        </div>

        {group.products.length === 0 ? (
          <p className="text-xs text-[#BBBBBB] px-1 py-1">
            Busca y agrega los productos a los que aplica este descuento.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {group.products.map((p) => (
              <span
                key={p.id}
                className="flex items-center gap-2 text-xs font-medium bg-[#F5F5F5] text-[#141414] pl-3 pr-2 py-1.5 rounded-full"
              >
                {p.description}
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(p.id)}
                  className="text-[#AAAAAA] hover:text-[#E53E3E] transition-colors"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
