"use client";

import { Plus, Trash2 } from "lucide-react";
import { Product } from "@/types/products/products";
import { IGrupoPremio } from "@/types/marketAdmin/IMarketAdmin";
import ProductSelect from "./ProductSelect";

// Editor de un grupo de productos (fijo o pool). Lo usan los regalos de
// promociones y los bonificados manuales.
export default function GrupoPremioEditor({
  grupo,
  products,
  canRemove,
  onChange,
  onRemove
}: {
  grupo: IGrupoPremio;
  products: Product[];
  canRemove: boolean;
  onChange: (grupo: IGrupoPremio) => void;
  onRemove: () => void;
}) {
  const esPool = grupo.modo === "pool";

  const firstAvailableId = (used: number[]) => products.find((p) => !used.includes(p.id))?.id ?? 0;

  const updatePool = (unidades: number) => onChange({ ...grupo, unidadesPool: unidades });

  const addProducto = () => {
    const ppId = `pp${Date.now()}`;
    onChange({
      ...grupo,
      productos: [
        ...grupo.productos,
        { id: ppId, productId: firstAvailableId(grupo.productos.map((pp) => pp.productId)) }
      ],
      cantidadesFijas:
        grupo.modo === "fijo"
          ? { ...(grupo.cantidadesFijas ?? {}), [ppId]: 1 }
          : grupo.cantidadesFijas
    });
  };

  const updateProducto = (ppId: string, productId: number) =>
    onChange({
      ...grupo,
      productos: grupo.productos.map((pp) => (pp.id === ppId ? { ...pp, productId } : pp))
    });

  const updateCantidadFija = (ppId: string, cantidad: number) =>
    onChange({ ...grupo, cantidadesFijas: { ...(grupo.cantidadesFijas ?? {}), [ppId]: cantidad } });

  const removeProducto = (ppId: string) =>
    onChange({
      ...grupo,
      productos: grupo.productos.filter((pp) => pp.id !== ppId),
      cantidadesFijas: Object.fromEntries(
        Object.entries(grupo.cantidadesFijas ?? {}).filter(([k]) => k !== ppId)
      )
    });

  return (
    <div
      className={`rounded-lg border ${esPool ? "border-[#FDE68A] bg-[#FFFEF5]" : "border-[#EEEEEE] bg-[#FAFAFA]"} overflow-hidden`}
    >
      {/* Grupo header */}
      <div
        className={`flex items-center justify-between px-2.5 py-1.5 ${esPool ? "bg-[#FFFBEB]" : "bg-[#F5F5F5]"}`}
      >
        <div className="flex items-center gap-2">
          {esPool ? (
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#92400E]">El cliente elige</span>
              <input
                type="number"
                min={1}
                value={grupo.unidadesPool ?? 5}
                onChange={(e) => updatePool(parseInt(e.target.value) || 1)}
                className="w-10 px-1.5 py-0.5 text-xs font-semibold text-[#92400E] bg-white border border-[#FDE68A] rounded text-center outline-none"
              />
              <span className="text-[10px] text-[#92400E]">und. entre:</span>
            </div>
          ) : (
            <span className="text-[10px] text-[#666666] font-medium">Fijo</span>
          )}
        </div>
        {canRemove && (
          <button
            onClick={onRemove}
            className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={10} />
          </button>
        )}
      </div>

      {/* Productos del grupo */}
      <div className="p-2 flex flex-col gap-1.5">
        {grupo.productos.map((pp) => (
          <div key={pp.id} className="flex items-center gap-2">
            <ProductSelect
              products={products}
              value={pp.productId}
              excludedIds={grupo.productos.filter((x) => x.id !== pp.id).map((x) => x.productId)}
              onChange={(productId) => updateProducto(pp.id, productId)}
              className="[&_.ant-select-selector]:!bg-white [&_.ant-select-selector]:!border-[#EEEEEE]"
            />
            {!esPool && (
              <div className="flex items-center border border-[#EEEEEE] rounded overflow-hidden w-[72px] flex-shrink-0">
                <span className="px-1.5 py-1 text-[10px] text-[#999999] bg-[#F7F7F7] border-r border-[#EEEEEE]">
                  und.
                </span>
                <input
                  type="number"
                  min={1}
                  value={grupo.cantidadesFijas?.[pp.id] ?? 1}
                  onChange={(e) => updateCantidadFija(pp.id, parseInt(e.target.value) || 1)}
                  className="w-8 px-1 py-1 text-sm text-[#141414] outline-none bg-white text-center"
                />
              </div>
            )}
            {grupo.productos.length > 1 && (
              <button
                onClick={() => removeProducto(pp.id)}
                className="w-5 h-5 rounded flex items-center justify-center text-[#CCCCCC] hover:text-red-500 hover:bg-red-50 transition-colors flex-shrink-0"
              >
                <Trash2 size={10} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addProducto}
          disabled={grupo.productos.length >= products.length}
          className="flex items-center gap-1 text-[10px] text-[#6AB000] hover:underline w-fit disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
        >
          <Plus size={9} /> Agregar producto
        </button>
      </div>
    </div>
  );
}
