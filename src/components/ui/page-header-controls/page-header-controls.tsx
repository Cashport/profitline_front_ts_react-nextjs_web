"use client";

import SearchField from "@/components/ui/search-field/search-field";
import { cn } from "@/utils/utils";

/* Controles del header de página (docs/DESIGN.md §4 y §8). Medidas en px CSS,
   ya compensadas por el zoom global (tokens de tailwind.css). */

interface HeaderSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/** Buscador fijo del header: el buscador único sobre el fondo gris (relleno blanco). */
export function HeaderSearch({
  value,
  onChange,
  placeholder = "Buscar…",
  className
}: HeaderSearchProps) {
  return (
    <SearchField
      surface="page"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={cn("w-[var(--search-w)] shrink", className)}
    />
  );
}

interface FilterButtonProps {
  onClick: () => void;
  /** Filtros activos; con más de 0 se muestra el badge lima. */
  count?: number;
  label?: string;
  disabled?: boolean;
}

/** Botón "Filtrar ▾" que abre el modal Filtros Avanzados. Sin borde: relleno blanco sobre el gris
    de la página y gris dentro de tarjetas blancas (`cp-control-fill`). */
export function FilterButton({
  onClick,
  count = 0,
  label = "Filtrar",
  disabled
}: FilterButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="box-border flex h-[var(--control-h)] shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap cp-control-fill rounded-lg border-0 px-3.5 text-[13px] font-medium text-cp-ink-4 transition-colors hover:text-cp-ink disabled:cursor-default disabled:opacity-50 disabled:hover:text-cp-ink-4"
    >
      {label}
      {count > 0 && (
        <span className="box-border flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-cp-lime px-1.5 text-[13px] font-semibold text-[#141414]">
          {count}
        </span>
      )}
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </button>
  );
}

export interface FilterChipItem {
  key: string;
  /** Categoría ("Zona"). */
  label: string;
  /** Valores ("Norte, Suba"). */
  value: string;
  onRemove: () => void;
}

interface FilterChipsProps {
  chips: FilterChipItem[];
  /** Chips visibles antes de agrupar el resto en "+N". */
  max?: number;
}

/**
 * Chips de filtros aplicados, pegados a la izquierda de Filtrar: crecen hacia la
 * izquierda, nunca saltan de línea y el excedente se agrupa en "+N".
 */
export function FilterChips({ chips, max = 2 }: FilterChipsProps) {
  if (!chips.length) return null;
  const shown = chips.slice(0, max);
  const rest = chips.slice(max);
  const chip =
    "box-border flex h-[var(--chip-h)] min-w-0 items-center gap-1.5 whitespace-nowrap rounded-[9px] bg-cp-surface pl-3 text-[15px] text-cp-ink";

  return (
    <div className="flex min-w-0 shrink flex-nowrap items-center justify-end gap-1.5 overflow-hidden">
      {rest.length > 0 && (
        <span
          title={rest.map((c) => `${c.label}: ${c.value}`).join("\n")}
          className={cn(chip, "shrink-0 px-3 font-semibold")}
        >
          +{rest.length}
        </span>
      )}
      {shown.map((c) => (
        <span key={c.key} title={`${c.label}: ${c.value}`} className={cn(chip, "pr-1")}>
          <b className="shrink-0 font-semibold">{c.label}:</b>
          <span className="min-w-0 truncate">{c.value}</span>
          <button
            type="button"
            onClick={c.onRemove}
            aria-label={`Quitar ${c.label}`}
            className="flex h-full shrink-0 cursor-pointer items-center border-0 bg-transparent px-1.5 text-[18px] leading-none text-cp-ink-4 hover:text-cp-ink"
          >
            ×
          </button>
        </span>
      ))}
    </div>
  );
}

interface MiniSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: React.ReactNode;
  /** Texto completo en tooltip. */
  title?: string;
}

/** Switch pequeño del header (22×12 visibles): apagado #c4c4c4, encendido lima. */
export function MiniSwitch({ checked, onChange, label, title }: MiniSwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      title={title}
      onClick={() => onChange(!checked)}
      className="flex cursor-pointer select-none items-center gap-1.5 whitespace-nowrap border-0 bg-transparent p-0 text-inherit"
    >
      <span
        className={cn(
          "relative h-4 w-[29px] shrink-0 rounded-full transition-colors",
          checked ? "bg-cp-lime" : "bg-[#c4c4c4]"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-3 w-3 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,.25)] transition-[left]",
            checked ? "left-[15px]" : "left-0.5"
          )}
        />
      </span>
      {label}
    </button>
  );
}
