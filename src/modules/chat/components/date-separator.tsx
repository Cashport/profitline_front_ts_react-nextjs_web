import { formatDateLabel } from "../utils/format";

interface DateSeparatorProps {
  date: string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  return (
    <div className="sticky top-0 z-10 flex justify-center py-2 pointer-events-none">
      <span className="text-xs text-gray-500 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
        {formatDateLabel(date)}
      </span>
    </div>
  );
}
