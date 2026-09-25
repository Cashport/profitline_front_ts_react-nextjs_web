"use client";

import React, { FC } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";
import { cn } from "@/utils/utils";

interface GenericEyeButtonProps {
  href?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  size?: number;
  title?: string;
  className?: string;
  disabled?: boolean;
}

// hover:/active: text colors are required, not decorative: AntD injects a global
// `a:hover { color: colorLinkHover }` that outranks a bare `text-[#141414]` utility
// and would turn the icon blue.
const baseClasses = cn(
  "flex items-center justify-center w-8 h-8 ml-auto rounded-md",
  "bg-[#F7F7F7] text-[#141414] border border-transparent",
  "hover:border-[#141414] hover:text-[#141414] active:text-[#141414]",
  "focus-visible:outline-none focus-visible:border-[#141414]",
  "transition-colors"
);

const GenericEyeButton: FC<GenericEyeButtonProps> = ({
  href,
  onClick,
  size = 19,
  title = "Ver detalle",
  className,
  disabled = false
}) => {
  // Every call site sits inside a clickable table row, so the click must not bubble
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    onClick?.(event);
  };

  const icon = <Eye size={size} />;

  if (href) {
    return (
      <Link
        href={href}
        title={title}
        aria-label={title}
        onClick={handleClick}
        className={cn(baseClasses, className)}
      >
        {icon}
      </Link>
    );
  }

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={handleClick}
      disabled={disabled}
      className={cn(baseClasses, disabled && "opacity-50 cursor-not-allowed", className)}
    >
      {icon}
    </button>
  );
};

export default GenericEyeButton;
