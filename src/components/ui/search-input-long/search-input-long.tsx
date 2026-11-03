import React, { FC } from "react";

import UiSearchInput from "@/components/ui/search-input/search-input";
import type { SearchFieldSurface } from "@/components/ui/search-field/search-field";
import { cn } from "@/utils/utils";

interface UiSearchInputProps {
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  value?: string;
  showBorder?: boolean;
  surface?: SearchFieldSurface;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Buscador único (`SearchField`) a todo el ancho disponible. */
const UiSearchInputLong: FC<UiSearchInputProps> = ({ className, ...props }) => (
  <UiSearchInput {...props} className={cn("max-w-none", className)} />
);

export default UiSearchInputLong;
