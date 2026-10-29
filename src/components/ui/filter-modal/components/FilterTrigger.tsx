import React from "react";
import { Filter, ChevronDown } from "lucide-react";

import { FilterButton } from "@/components/ui/page-header-controls/page-header-controls";

interface FilterTriggerProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  showChevron?: boolean;
}

/** Por defecto es el mismo botón "Filtrar ▾" del header (docs/DESIGN.md §4); `className` lo reemplaza. */
export default function FilterTrigger({
  count,
  onClick,
  disabled,
  label = "Filtrar",
  className,
  showChevron
}: FilterTriggerProps) {
  if (!className) {
    return <FilterButton count={count} onClick={onClick} label={label} disabled={disabled} />;
  }

  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`relative ${className}`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-bold">{label}</span>
        {showChevron && <ChevronDown className="w-4 h-4" />}
      </button>
      {count > 0 && (
        <span className="absolute -top-2.5 -right-2.5 min-w-[24px] h-[24px] px-1 bg-primary text-primary-foreground text-[13px] font-bold rounded-full flex items-center justify-center shadow-md">
          {count}
        </span>
      )}
    </div>
  );
}
