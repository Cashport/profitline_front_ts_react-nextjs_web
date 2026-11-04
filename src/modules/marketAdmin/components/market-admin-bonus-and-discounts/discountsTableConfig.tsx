import { useTranslations } from "use-intl";
import { getActiveLocale } from "@/i18n/translator";

const ACTIVE_STYLE = "bg-[#E8F9E8] text-[#1A7A1A]";
const INACTIVE_STYLE = "bg-[#F0F0F0] text-[#999999]";

const TIPO_STYLES: Record<string, string> = {
  Flex: "bg-[#141414] text-white",
  "Promos Mes": "bg-[#F5F0FF] text-[#7C4DFF]"
};

export const PAGE_SIZE = 20;

// El backend recibe `active` como 1/0; "todos" significa no enviar el parámetro.
export const ESTADO_FILTER_ALL = "todos";

export const useEstadoFilterOptions = () => {
  const tCommon = useTranslations("common.status");
  return [
    { value: ESTADO_FILTER_ALL, label: tCommon("all") },
    { value: "1", label: tCommon("active") },
    { value: "0", label: tCommon("inactive") }
  ];
};

// Mismo alto que el buscador (--control-h); el line-height descuenta los 2px de borde.
export const ESTADO_SELECT_CLASSNAME = [
  "!h-[var(--control-h)]",
  "[&_.ant-select-selector]:!h-[var(--control-h)]",
  "[&_.ant-select-selector]:!rounded-lg",
  "[&_.ant-select-selector]:!border-[#E0E0E0]",
  "[&_.ant-select-selection-item]:!leading-[calc(var(--control-h)-2px)]",
  "[&_.ant-select-selection-placeholder]:!leading-[calc(var(--control-h)-2px)]"
].join(" ");

export const headerCell = () => ({ style: { color: "#141414", fontWeight: 600 } });

export const formatDate = (iso: string) => {
  const date = new Date(iso);
  if (isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(getActiveLocale(), {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(date);
};

export const StatusPill = ({ active }: { active: number }) => {
  const tCommon = useTranslations("common.status");
  const isActive = active === 1;
  return (
    <span
      className={`text-[13px] font-semibold px-2 py-0.5 rounded-full w-fit ${isActive ? ACTIVE_STYLE : INACTIVE_STYLE}`}
    >
      {isActive ? tCommon("active") : tCommon("inactive")}
    </span>
  );
};

export const TypePill = ({ tipo }: { tipo: string }) => (
  <span
    className={`text-[13px] font-semibold px-2 py-0.5 rounded-full w-fit ${TIPO_STYLES[tipo] ?? "bg-[#F0F0F0] text-[#666666]"}`}
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
