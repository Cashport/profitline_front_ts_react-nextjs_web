import React from "react";
import { Filter, ChevronDown } from "lucide-react";

interface FilterTriggerProps {
  count: number;
  onClick: () => void;
  disabled?: boolean;
  label?: string;
  className?: string;
  showChevron?: boolean;
}

const DEFAULT_CLASS =
  "shrink-0 flex items-center justify-center gap-2 bg-card border border-border px-5 py-2.5 rounded-xl text-foreground hover:bg-secondary transition-colors shadow-sm";

export default function FilterTrigger({
  count,
  onClick,
  disabled,
  label = "Filtros",
  className,
  showChevron
}: FilterTriggerProps) {
  return (
    <div className="relative shrink-0">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={`relative ${className ?? DEFAULT_CLASS}`}
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm font-bold">{label}</span>
        {showChevron && <ChevronDown className="w-4 h-4" />}
      </button>
      {count > 0 && (
        <span className="absolute -top-2 -right-2 w-[22px] h-[22px] bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
          {count}
        </span>
      )}
    </div>
  );
}
