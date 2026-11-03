import React, { FC, useState } from "react";

import SearchField, { type SearchFieldSurface } from "@/components/ui/search-field/search-field";
import { cn } from "@/utils/utils";

interface UiSearchInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  /** @deprecated El buscador único no lleva borde; se ignora. */
  showBorder?: boolean;
  /** Fondo sobre el que va: "card" (tarjeta blanca, por defecto) o "page" (fondo gris). */
  surface?: SearchFieldSurface;
  /**
   * Si se pasa, el input queda controlado por el padre. Sirve para tener dos
   * buscadores sobre la misma consulta sin que se desincronicen. Si se omite,
   * el componente mantiene su propio estado, como siempre.
   */
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/** API histórica (eventos de cambio) sobre el buscador único `SearchField`. */
const UiSearchInput: FC<UiSearchInputProps> = ({
  id = "ui-search-input",
  name,
  placeholder,
  className,
  surface,
  value,
  onChange
}) => {
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState("");
  const inputValue = isControlled ? value : internalValue;

  const handleChange = (next: string) => {
    if (!isControlled) setInternalValue(next);
    onChange?.({ target: { value: next } } as React.ChangeEvent<HTMLInputElement>);
  };

  return (
    <SearchField
      id={id}
      name={name}
      placeholder={placeholder}
      surface={surface}
      value={inputValue}
      onChange={handleChange}
      className={cn("max-w-[25rem] flex-1", className)}
    />
  );
};

export default UiSearchInput;
