"use client";

import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@/utils/utils";

/*
 * Buscador único de Cashport (docs/DESIGN.md §8): mismo diseño y comportamiento en todas las
 * pantallas. Solo cambia el relleno según la superficie sobre la que va:
 * - "card": dentro de una tarjeta o modal blanco → relleno gris (fondo de la app).
 * - "page": sobre el fondo gris de la página (header, barras sueltas) → relleno blanco.
 */

export type SearchFieldSurface = "card" | "page";

export interface SearchFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "size"> {
  value: string;
  onChange: (value: string) => void;
  /** Sobre qué fondo va. Por defecto "card" (tarjeta blanca). */
  surface?: SearchFieldSurface;
  /** Muestra "×" para limpiar cuando hay texto. Por defecto sí. */
  allowClear?: boolean;
  /** Clases del contenedor: solo ancho/posición (p. ej. "w-[340px]", "flex-1"). */
  className?: string;
}

/** Lupa del buscador único (para inputs que no pueden ser `SearchField`, p. ej. un AutoComplete). */
export const SearchFieldIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    aria-hidden
    className="shrink-0 text-cp-ink"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/**
 * Mismo look que `SearchField` para un `Input` de antd (cuando lo exige un AutoComplete).
 * Usar solo en ese caso; en cualquier otro, `SearchField`.
 */
export const searchFieldAntdClass = (surface: SearchFieldSurface = "card") =>
  cn(
    "!h-[var(--control-h)] !gap-1 !rounded-lg !border-0 !px-3.5 !shadow-none [&_input]:!text-[13px] [&_input]:!font-medium [&_input::placeholder]:!text-[#9a9a9a]",
    surface === "page" ? "!bg-cp-surface" : "!bg-cp-bg"
  );

const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  {
    value,
    onChange,
    surface = "card",
    allowClear = true,
    className,
    placeholder = "Buscar…",
    type = "text",
    ...inputProps
  },
  ref
) {
  return (
    <label
      className={cn(
        "box-border flex h-[var(--control-h)] w-full min-w-0 cursor-text items-center gap-2.5 rounded-lg px-3.5",
        surface === "page" ? "bg-cp-surface" : "bg-cp-bg",
        className
      )}
    >
      <SearchFieldIcon />
      <input
        ref={ref}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        {...inputProps}
        className="h-full min-w-0 flex-1 border-0 bg-transparent p-0 text-[13px] font-medium text-cp-ink shadow-none outline-none placeholder:font-medium placeholder:text-[#9a9a9a]"
      />
      {allowClear && value && (
        <button
          type="button"
          aria-label="Limpiar búsqueda"
          onClick={() => onChange("")}
          className="-mr-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-0 bg-transparent p-0 text-[16px] leading-none text-[#9a9a9a] hover:text-cp-ink"
        >
          ×
        </button>
      )}
    </label>
  );
});

export default SearchField;
