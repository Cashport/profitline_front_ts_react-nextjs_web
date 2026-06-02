// ── Mock data (display only) ─────────────────────────────────────────────
const CARTERA = {
  total: 12652106,
  vencida: 5711609,
  cupoTotal: 20000000,
  cupoDisponible: 14300000
};

function CarteraCard() {
  const cupoUsado = CARTERA.cupoTotal - CARTERA.cupoDisponible;
  const cupoUsadoPct = Math.round((cupoUsado / CARTERA.cupoTotal) * 100);
  const cupoDisponiblePct = 100 - cupoUsadoPct;
  const fmt = (n: number) => "$ " + n.toLocaleString("es-CO");

  return (
    <div className="bg-white rounded-xl border border-[#DDDDDD] overflow-hidden">
      <div className="px-5 py-3 border-b border-[#F0F0F0]">
        <p className="text-xs font-semibold text-[#141414]">Cartera</p>
      </div>
      <div className="grid grid-cols-2 divide-x divide-[#F0F0F0] border-b border-[#F0F0F0]">
        <div className="px-5 py-4">
          <p className="text-[11px] text-[#999999] mb-1">Cartera total</p>
          <p className="text-sm font-bold text-[#141414]">{fmt(CARTERA.total)}</p>
        </div>
        <div className="px-5 py-4">
          <p className="text-[11px] text-[#999999] mb-1">Cartera vencida</p>
          <p className="text-sm font-bold text-red-500">{fmt(CARTERA.vencida)}</p>
        </div>
      </div>
      <div className="px-5 py-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] text-[#999999] mb-0.5">Cupo total</p>
            <p className="text-sm font-bold text-[#141414]">{fmt(CARTERA.cupoTotal)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] text-[#999999] mb-0.5">Cupo disponible</p>
            <p className="text-sm font-bold text-[#141414]">{fmt(CARTERA.cupoDisponible)}</p>
          </div>
        </div>
        <div>
          <div className="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#CBE71E] rounded-full transition-all duration-500"
              style={{ width: `${cupoDisponiblePct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[10px] text-[#999999]">Usado: {cupoUsadoPct}%</p>
            <p className="text-[10px] font-semibold text-[#141414]">
              {cupoDisponiblePct}% disponible
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CarteraCard;
