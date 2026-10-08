interface StatusPillProps {
  label: string;
  /** Color del estado en hex de 6 dígitos (de la paleta). */
  color: string;
}

/** Estado del asesor: punto del color del estado sobre el mismo color al 20%. */
export default function StatusPill({ label, color }: StatusPillProps) {
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-[9px] py-0.5 text-[11.5px] font-semibold text-foreground"
      style={{ background: `${color}33` }}
    >
      <i className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
