"use client";

export default function ProductLotes({ lotes }: { lotes: string[] }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-[#141414]">Lotes</p>
        <span className="text-xs text-[#999999]">
          {lotes.length} lote{lotes.length !== 1 ? "s" : ""}
        </span>
      </div>
      {lotes.length === 0 ? (
        <p className="text-sm text-[#999999]">Sin lotes disponibles.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {lotes.map((lote) => (
            <span
              key={lote}
              className="text-xs font-mono bg-[#F5F5F5] text-[#141414] px-3 py-1.5 rounded-lg"
            >
              {lote}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
