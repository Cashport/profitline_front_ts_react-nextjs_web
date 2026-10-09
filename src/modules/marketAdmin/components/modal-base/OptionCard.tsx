"use client";

import { Tag } from "lucide-react";

type OptionCardProps = {
  icon: typeof Tag;
  iconColor: string;
  bg: string;
  bgHover: string;
  title: string;
  description: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function OptionCard({
  icon: Icon,
  iconColor,
  bg,
  bgHover,
  title,
  description,
  onClick,
  disabled = false
}: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-4 w-full text-left border border-transparent rounded-lg px-4 py-4 transition-colors group ${
        disabled
          ? "opacity-40 cursor-not-allowed"
          : "hover:border-[#141414] hover:bg-[#FAFAFA] cursor-pointer"
      }`}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ backgroundColor: bg }}
        onMouseEnter={(e) => {
          if (!disabled) e.currentTarget.style.backgroundColor = bgHover;
        }}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = bg)}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <div>
        <p className="text-sm font-semibold text-[#141414]">{title}</p>
        <p className="text-xs text-[#999999] mt-0.5">{description}</p>
      </div>
    </button>
  );
}
