import { Calendar } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { Input } from "@/modules/chat/ui/input";

interface DateRangeFilterProps {
  dateRange: { start: string | null; end: string | null };
  onDateRangeChange: (start: string, end: string) => void;
  onClear: () => void;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  clearLabel?: string;
  showLabel?: boolean;
}

export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
  onClear,
  label = "Rango de fechas",
  startLabel = "Fecha inicio",
  endLabel = "Fecha fin",
  clearLabel = "Limpiar fechas",
  showLabel = true
}: DateRangeFilterProps) {
  return (
    <div>
      {showLabel && (
        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2 block">
          <Calendar className="h-3 w-3 inline mr-1" />
          {label}
        </label>
      )}
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-600 mb-1 block">{startLabel}</label>
            <Input
              type="date"
              value={dateRange.start || ""}
              onChange={(e) =>
                onDateRangeChange(e.target.value, dateRange.end || "")
              }
              className="bg-cashport-white border-cashport-gray-light text-sm"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600 mb-1 block">{endLabel}</label>
            <Input
              type="date"
              value={dateRange.end || ""}
              onChange={(e) =>
                onDateRangeChange(dateRange.start || "", e.target.value)
              }
              className="bg-cashport-white border-cashport-gray-light text-sm"
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onClear}
          className="w-full border-cashport-gray-light text-cashport-black hover:bg-cashport-gray-lighter"
        >
          {clearLabel}
        </Button>
      </div>
    </div>
  );
}
