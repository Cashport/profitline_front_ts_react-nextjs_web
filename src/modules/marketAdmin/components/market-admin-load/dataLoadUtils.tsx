import { IMarketAdminEtlHistory } from "@/types/marketAdmin/IMarketAdmin";

const ESTADO_STYLES: Record<IMarketAdminEtlHistory["estado"], string> = {
  Exitoso: "bg-[#E8F9E8] text-[#1A7A1A]",
  "Con errores": "bg-[#FFF0E6] text-[#B84A00]"
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// Se parte el string en vez de usar `new Date(iso)`: para un "YYYY-MM-DD" el
// constructor asume UTC y en UTC-5 devolvería el día anterior.
export const formatDate = (iso: string | null) => {
  if (!iso) return "—";
  const [y, m, d] = iso.split("-");
  const month = MONTHS[Number(m) - 1];
  if (!month) return iso;
  return `${d} ${month} ${y}`;
};

export const EstadoPill = ({ estado }: { estado: IMarketAdminEtlHistory["estado"] }) => (
  <span
    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${ESTADO_STYLES[estado] ?? ""}`}
  >
    {estado}
  </span>
);
