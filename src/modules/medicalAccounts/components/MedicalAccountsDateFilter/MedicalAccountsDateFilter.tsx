"use client";

import { Button, Dropdown } from "antd";
import { Calendar } from "lucide-react";

import { DateRangeFilter } from "@/components/atoms/DateRangeFilter/DateRangeFilter";

interface MedicalAccountsDateFilterProps {
  dateRange: { start: string | null; end: string | null };
  onChange: (start: string, end: string) => void;
  onClear: () => void;
}

export function MedicalAccountsDateFilter({
  dateRange,
  onChange,
  onClear
}: MedicalAccountsDateFilterProps) {
  const isActive = Boolean(dateRange.start || dateRange.end);

  return (
    <Dropdown
      trigger={["click"]}
      dropdownRender={() => (
        <div className="w-72 rounded-lg border border-gray-100 bg-white p-4 shadow-lg">
          <DateRangeFilter dateRange={dateRange} onDateRangeChange={onChange} onClear={onClear} />
        </div>
      )}
    >
      <Button
        icon={<Calendar size={16} />}
        style={{ height: 38 }}
        className={isActive ? "!border-cashport-black !text-cashport-black" : ""}
      >
        Rango de fechas
      </Button>
    </Dropdown>
  );
}
