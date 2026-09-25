"use client";

import { X } from "lucide-react";

import { DateDraft, formatDateTagValue } from "./FilterDateTab";

interface DateFilterTagProps {
  value: DateDraft;
  onClear: () => void;
  label?: string;
}

// Committed counterpart of FilterDateTab, rendered by FilterModal through the
// "fecha" category's renderTag. Styling mirrors the option tags in ActiveFilterTags.
export function DateFilterTag({ value, onClear, label = "Fecha" }: DateFilterTagProps) {
  if (!value.from && !value.to) return null;

  return (
    <div className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-xs">
      <span className="text-muted-foreground font-medium">{label}:</span>
      <span className="font-bold text-foreground">{formatDateTagValue(value)}</span>
      <button
        type="button"
        onClick={onClear}
        className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
