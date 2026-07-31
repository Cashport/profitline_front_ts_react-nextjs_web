const canalColors: Record<string, { bg: string; text: string }> = {
  Institucional: { bg: "#1a2035", text: "#ffffff" },
  Retail: { bg: "#F97316", text: "#ffffff" },
  Droguería: { bg: "#F97316", text: "#ffffff" },
  Cadena: { bg: "#EAB308", text: "#111827" },
  Mayorista: { bg: "#1a2035", text: "#ffffff" },
  FARMA: { bg: "#F97316", text: "#ffffff" },
  ETB: { bg: "#1a2035", text: "#ffffff" },
  SLO: { bg: "#F97316", text: "#ffffff" },
  STK: { bg: "#1a2035", text: "#ffffff" },
  RET: { bg: "#F97316", text: "#ffffff" },
  INS: { bg: "#1a2035", text: "#ffffff" }
};

const canalAbbr = (label: string) => {
  const known: Record<string, string> = {
    Institucional: "INS",
    Retail: "RET",
    Droguería: "DRG",
    Cadena: "CAD",
    Mayorista: "MAY",
    FARMA: "FAR",
    ETB: "ETB"
  };
  return known[label] ?? label.slice(0, 3).toUpperCase();
};

export function CanalBadge({ label, secondary = false }: { label: string; secondary?: boolean }) {
  const colors =
    canalColors[label] ??
    (secondary ? { bg: "#EAB308", text: "#111827" } : { bg: "#1a2035", text: "#ffffff" });
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[10px] font-semibold leading-none select-none flex-shrink-0"
      style={{ backgroundColor: colors.bg, color: colors.text }}
      title={label}
    >
      {canalAbbr(label)}
    </span>
  );
}
