"use client";

type ProductSku = { sku: string; descripcion: string; precio: string };

export default function ProductSkusTable({ skuList }: { skuList: ProductSku[] }) {
  return (
    <div>
      <p className="text-base font-bold text-[#141414] mb-3">SKUs</p>
      <div className="grid grid-cols-[1fr_1fr_auto] gap-4 pb-2">
        {["SKU", "Descripción", "Precio"].map((h) => (
          <span key={h} className="text-xs font-bold text-[#141414]">
            {h}
          </span>
        ))}
      </div>
      {skuList.map((s) => (
        <div
          key={s.sku}
          className="grid grid-cols-[1fr_1fr_auto] gap-4 py-3 border-t border-[#F5F5F5] items-center"
        >
          <span className="text-sm font-mono text-[#141414]">{s.sku}</span>
          <span className="text-sm text-[#141414]">{s.descripcion}</span>
          <span className="text-sm font-bold text-[#141414]">{s.precio}</span>
        </div>
      ))}
    </div>
  );
}
