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

// El backend recibe `active` como 1/0; "todos" significa no enviar el parámetro.
export const ESTADO_FILTER_ALL = "todos";

export const ESTADO_FILTER_OPTIONS = [
  { value: ESTADO_FILTER_ALL, label: "Todos" },
  { value: "1", label: "Activo" },
  { value: "0", label: "Inactivo" }
];

// 48px de alto para igualar el buscador; el line-height descuenta los 2px de borde.
export const ESTADO_SELECT_CLASSNAME = [
  "!h-12",
  "[&_.ant-select-selector]:!h-12",
  "[&_.ant-select-selector]:!rounded-lg",
  "[&_.ant-select-selector]:!border-[#E0E0E0]",
  "[&_.ant-select-selection-item]:!leading-[46px]",
  "[&_.ant-select-selection-placeholder]:!leading-[46px]"
].join(" ");

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
