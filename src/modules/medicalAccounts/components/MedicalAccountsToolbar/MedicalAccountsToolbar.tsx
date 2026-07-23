"use client";

import { Select } from "antd";
import { Plus } from "@phosphor-icons/react";

import UiSearchInput from "@/components/ui/search-input/search-input";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { MedicalAccountStatusCode } from "../../types/IMedicalAccount";
import { MedicalAccountsDateFilter } from "../MedicalAccountsDateFilter/MedicalAccountsDateFilter";
import { STATUS_CODE_OPTIONS } from "../../constants";

interface MedicalAccountsToolbarProps {
  onSearch: (value: string) => void;
  statusFilter: MedicalAccountStatusCode | null;
  onStatusChange: (value: MedicalAccountStatusCode | null) => void;
  dateRange: { start: string | null; end: string | null };
  onDateRangeChange: (start: string, end: string) => void;
  onClearDateRange: () => void;
  onAdd: () => void;
}

export function MedicalAccountsToolbar({
  onSearch,
  statusFilter,
  onStatusChange,
  dateRange,
  onDateRangeChange,
  onClearDateRange,
  onAdd
}: MedicalAccountsToolbarProps) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <UiSearchInput
          placeholder="Buscar por ID, paciente o documento"
          onChange={(e) => onSearch(e.target.value)}
        />

        <Select
          allowClear
          placeholder="Estado"
          style={{ width: 180, height: 38 }}
          options={STATUS_CODE_OPTIONS}
          value={statusFilter}
          onChange={(value) => onStatusChange(value ?? null)}
        />

        <MedicalAccountsDateFilter
          dateRange={dateRange}
          onChange={onDateRangeChange}
          onClear={onClearDateRange}
        />
      </div>

      <PrincipalButton icon={<Plus size={18} />} onClick={onAdd}>
        Agregar cuenta médica
      </PrincipalButton>
    </div>
  );
}
