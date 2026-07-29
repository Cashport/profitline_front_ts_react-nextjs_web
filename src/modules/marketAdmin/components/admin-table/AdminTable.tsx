"use client";

import { ChevronsUpDown, ChevronUp, ChevronDown, Check, Minus } from "lucide-react";

export type SortDir = "asc" | "desc" | null;

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  currentKey: string | null;
  currentDir: SortDir;
  onSort: (key: string) => void;
  className?: string;
}

export function SortableHeader({
  label,
  sortKey,
  currentKey,
  currentDir,
  onSort,
  className
}: SortableHeaderProps) {
  const isActive = currentKey === sortKey;
  return (
    <button
      onClick={() => onSort(sortKey)}
      className={`flex items-center gap-1 text-sm font-semibold text-[#141414] hover:text-[#555555] transition-colors group ${className ?? ""}`}
    >
      {label}
      <span className="text-[#BBBBBB] group-hover:text-[#888888]">
        {isActive && currentDir === "asc" ? (
          <ChevronUp size={13} />
        ) : isActive && currentDir === "desc" ? (
          <ChevronDown size={13} />
        ) : (
          <ChevronsUpDown size={13} />
        )}
      </span>
    </button>
  );
}

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  totalItems: number;
  pageSize: number;
  label: string;
  extra?: string;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
  label,
  extra
}: PaginationProps) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-[#F0F0F0]">
      <span className="text-xs text-[#AAAAAA]">
        Mostrando {from}–{to} de {totalItems} {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#666666] hover:bg-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-7 h-7 rounded flex items-center justify-center text-xs font-medium transition-colors ${
              p === page ? "bg-[#141414] text-white" : "text-[#666666] hover:bg-[#F0F0F0]"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-7 h-7 rounded flex items-center justify-center text-xs text-[#666666] hover:bg-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>
      {extra && <span className="text-xs text-[#AAAAAA]">{extra}</span>}
    </div>
  );
}

interface AdminCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
  onClick?: (e: React.MouseEvent) => void;
}

export function AdminCheckbox({ checked, indeterminate, onChange, onClick }: AdminCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? "mixed" : checked}
      onClick={(e) => {
        onClick?.(e);
        onChange();
      }}
      className={`w-[17px] h-[17px] rounded-[3px] flex items-center justify-center flex-shrink-0 transition-colors border ${
        checked || indeterminate ? "bg-[#CBE71E] border-[#A8C218]" : "bg-white border-[#CCCCCC]"
      }`}
    >
      {indeterminate ? (
        <Minus size={10} strokeWidth={3} className="text-[#141414]" />
      ) : checked ? (
        <Check size={10} strokeWidth={3} className="text-[#141414]" />
      ) : null}
    </button>
  );
}
