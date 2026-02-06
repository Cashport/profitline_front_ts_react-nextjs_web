import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/utils/utils";

interface InputClickableStyledProps {
  placeholder?: string;
  value?: string;
  error?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
}

export function InputClickableStyled({
  placeholder = "Seleccionar frecuencia",
  value,
  error,
  disabled,
  onClick,
  className
}: InputClickableStyledProps) {
  const handleClick = () => {
    if (!disabled) onClick();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        "flex w-full items-center justify-between rounded-md border border-[#DDDDDD] bg-transparent px-3 py-2 text-sm h-9 cursor-pointer shadow-xs transition-[color,box-shadow] outline-none",
        error && "border-red-500 border-dashed",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <span className={cn("truncate", !value && "text-muted-foreground")}>
        {value || placeholder}
      </span>
      <ChevronDownIcon className="size-4 opacity-50 shrink-0" />
    </button>
  );
}
