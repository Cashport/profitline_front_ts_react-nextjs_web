"use client";

import { AlertTriangle, Bell, Bot, FileText, FileX, Tag, LucideIcon } from "lucide-react";

import { cn } from "@/utils/utils";

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

// Same look as DevolucionesStatCard / CardsClients, but as a toggle button:
// active flips the card to black, danger only tints the icon square and count.
export function AlertCategoryCards({
  categories,
  activeKeys,
  onCategoryClick
}: AlertCategoryCardsProps) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
      {categories.map((category) => {
        const Icon = CATEGORY_ICONS[category.key] ?? Bell;
        const isActive = activeKeys.includes(category.key);
        const isDanger = category.key === DANGER_CATEGORY && category.count > 0;

        return (
          <button
            key={category.key}
            type="button"
            onClick={() => onCategoryClick(category)}
            className={cn(
              "flex h-full w-full flex-col justify-between gap-2 rounded-lg p-3 text-left transition-colors xl:p-4",
              isActive
                ? "bg-cashport-black text-white"
                : "bg-cashport-gray-lighter text-cashport-black hover:bg-[#EFEFEF]"
            )}
          >
            <span className="flex w-full items-center justify-between gap-2">
              <span className="block truncate text-[0.938rem] font-light leading-6 xl:text-base">
                {category.name}
              </span>
              <span
                className={cn(
                  "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md xl:h-6 xl:w-6",
                  isDanger ? "bg-[#DC2626] text-white" : "bg-cashport-green text-cashport-black"
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={2.5} />
              </span>
            </span>
            <span
              className={cn(
                "block truncate text-[1.3rem] font-medium xl:text-[1.625rem]",
                isDanger && !isActive && "text-[#DC2626]"
              )}
            >
              {category.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
