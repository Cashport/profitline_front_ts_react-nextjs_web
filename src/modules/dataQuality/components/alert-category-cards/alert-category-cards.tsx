"use client";

import { Fragment } from "react";
import { AlertTriangle, Bell, Bot, FileText, FileX, Tag, LucideIcon } from "lucide-react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/modules/chat/ui/tooltip";

import { IAlertFilterCategory } from "@/types/dataQuality/IDataQuality";

const DANGER_CATEGORY = "automation";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  [DANGER_CATEGORY]: Bot,
  missing: FileText,
  processing: FileX,
  quality: AlertTriangle,
  catalog: Tag
};

interface AlertCategoryCardsProps {
  categories: IAlertFilterCategory[];
  activeKeys: string[];
  onCategoryClick: (category: IAlertFilterCategory) => void;
}

export function AlertCategoryCards({
  categories,
  activeKeys,
  onCategoryClick
}: AlertCategoryCardsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.key] ?? Bell;
        const isActive = activeKeys.includes(category.key);
        const isDanger = category.key === DANGER_CATEGORY && category.count > 0;

        const card = (
          <button
            type="button"
            onClick={() => onCategoryClick(category)}
            className={`text-left rounded-xl border p-3.5 transition-colors ${
              isActive
                ? "border-[#141414] bg-[#141414] text-white"
                : isDanger
                  ? "border-[#FCA5A5] bg-[#FEF2F2] hover:bg-[#FEE2E2]"
                  : "border-[#DDDDDD] bg-white hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full ${
                  isActive
                    ? "bg-white/15"
                    : isDanger
                      ? "bg-[#FEE2E2] text-[#DC2626]"
                      : "bg-[#F5F5F4] text-[#6B7280]"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span
                className={`text-2xl font-bold ${
                  isActive ? "text-white" : isDanger ? "text-[#DC2626]" : "text-[#141414]"
                }`}
              >
                {category.count}
              </span>
            </div>
            <p className={`text-xs mt-2 ${isActive ? "text-white/80" : "text-[#6B7280]"}`}>
              {category.name}
            </p>
          </button>
        );

        if (!category.items?.length) return <Fragment key={category.key}>{card}</Fragment>;

        return (
          <Tooltip key={category.key}>
            <TooltipTrigger asChild>{card}</TooltipTrigger>
            <TooltipContent side="bottom" className="w-80 space-y-1 rounded-lg px-3 py-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide opacity-70">
                {category.name}
              </p>
              <ul className="space-y-1">
                {category.items.map((item, i) => (
                  <li key={i} className="text-xs leading-snug">
                    <span className="font-medium">{item.client}</span>
                    <br />
                    <span className="opacity-70">{item.message}</span>
                  </li>
                ))}
              </ul>
              {category.remaining > 0 && (
                <p className="text-xs opacity-70 pt-0.5">+{category.remaining} más</p>
              )}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
