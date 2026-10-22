import { fmtFileSize } from "../../utils/reports-format";

interface HtmlFileChipProps {
  file: File;
  onRemove: () => void;
  disabled?: boolean;
}

/** Archivo elegido para publicar: nombre, peso y "Quitar". */
export default function HtmlFileChip({ file, onRemove, disabled }: HtmlFileChipProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-secondary px-3.5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#2b4a5f] text-[10px] font-bold text-white">
        HTML
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-medium text-foreground">{file.name}</div>
        <div className="text-[11.5px] text-muted-foreground">
          {fmtFileSize(file.size)} · Listo para publicar
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="text-[12.5px] font-semibold text-destructive disabled:opacity-50"
      >
        Quitar
      </button>
    </div>
  );
}
