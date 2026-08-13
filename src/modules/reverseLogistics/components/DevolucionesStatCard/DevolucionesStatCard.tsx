"use client";

import { ReactNode } from "react";
import { Skeleton } from "antd";

interface DevolucionesStatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  // Small unit mark rendered next to the value ("días"), same role as the
  // millions "M" mark on CardsClients.
  suffix?: string;
  loading?: boolean;
}

// KPI card for the reverse-logistics tabs. Mirrors the look of CardsClients
// (src/components/molecules/modals/CardsClients) but takes an already-formatted
// string, since these values are day averages rather than money.
export function DevolucionesStatCard({
  title,
  value,
  icon,
  suffix,
  loading
}: DevolucionesStatCardProps) {
  return (
    <div className="flex h-full w-full flex-col justify-between gap-2 rounded-lg bg-cashport-gray-lighter p-3 xl:p-4">
      <div className="flex w-full items-center justify-between gap-2">
        {loading ? (
          <Skeleton.Input style={{ width: 100 }} active size="small" />
        ) : (
          <h4 className="truncate text-[0.938rem] font-light leading-6 text-cashport-black xl:text-base">
            {title}
          </h4>
        )}
        {loading ? (
          <Skeleton.Avatar active size="small" shape="circle" />
        ) : (
          <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md bg-cashport-green xl:h-6 xl:w-6">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1">
        {loading ? (
          <Skeleton.Input style={{ width: 80 }} active size="small" />
        ) : (
          <>
            <p className="truncate text-[1.3rem] font-medium text-cashport-black xl:text-[1.625rem]">
              {value}
            </p>
            {suffix && <p className="text-base font-light xl:text-lg">{suffix}</p>}
          </>
        )}
      </div>
    </div>
  );
}
