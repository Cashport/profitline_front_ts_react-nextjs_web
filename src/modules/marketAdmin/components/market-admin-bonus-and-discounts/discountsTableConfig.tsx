const ESTADO_STYLES: Record<string, string> = {
  Activo: "bg-[#E8F9E8] text-[#1A7A1A]",
  Inactivo: "bg-[#F0F0F0] text-[#999999]"
};

const TIPO_STYLES: Record<string, string> = {
  Flex: "bg-[#141414] text-white",
  "Promos Mes": "bg-[#F5F0FF] text-[#7C4DFF]"
};

const MONTHS = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export const PAGE_SIZE = 20;

export const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
};

export const getStatusLabel = (active: number) => (active === 1 ? "Activo" : "Inactivo");

export const StatusPill = ({ active }: { active: number }) => {
  const label = getStatusLabel(active);
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${ESTADO_STYLES[label] ?? ""}`}
    >
      {label}
    </span>
  );
};

export const TypePill = ({ tipo }: { tipo: string }) => (
  <span
    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${TIPO_STYLES[tipo] ?? "bg-[#F0F0F0] text-[#666666]"}`}
  >
    {tipo}
  </span>
);

export const DateCell = ({ value }: { value?: string | null }) =>
  value ? (
    <span className="text-sm text-[#141414]">{formatDate(value)}</span>
  ) : (
    <span className="text-sm text-[#999999]">—</span>
  );

export const TextCell = ({ value }: { value?: string | null }) =>
  value ? (
    <span className="text-sm text-[#141414]">{value}</span>
  ) : (
    <span className="text-sm text-[#999999]">—</span>
  );
