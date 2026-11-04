"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "use-intl";

import { FilterModal } from "@/components/ui/filter-modal";
import type {
  FilterCategoryConfig,
  FilterOptionItem,
  FilterSelection
} from "@/components/ui/filter-modal";
import {
  IBalancesFilter,
  IBalancesFilterUser,
  IBalancesFilterClient
} from "@/types/financialDiscounts/IFinancialDiscounts";
import BalancesDateTab, { DateDraft } from "./BalancesDateTab";

interface FiltersBarProps {
  users: IBalancesFilterUser[];
  clients: IBalancesFilterClient[];
  motives: { id: number; name: string }[];
  eligibilityStatuses: { id: string; description: string }[];
  value: IBalancesFilter;
  onChange: (next: IBalancesFilter) => void;
  isLoading?: boolean;
}

/** Claves de las categorías con conteo en el tag ("3 Clientes"). */
const TAG_PLURAL_KEYS = ["kam", "cliente", "motivo", "procedencia"] as const;
type TagPluralKey = (typeof TAG_PLURAL_KEYS)[number];
const isTagPluralKey = (key: string): key is TagPluralKey =>
  (TAG_PLURAL_KEYS as readonly string[]).includes(key);

export function FilterBalancesView({
  users,
  clients,
  motives,
  eligibilityStatuses,
  value,
  onChange,
  isLoading
}: FiltersBarProps) {
  const t = useTranslations("balances.filters");
  const [dateDraft, setDateDraft] = useState<DateDraft>({
    from_date: value.from_date,
    to_date: value.to_date
  });

  const toItems = <T,>(ids: T[], lookup: (id: T) => FilterOptionItem) => ids.map(lookup);

  const selection: FilterSelection = {
    kam: toItems(value.users || [], (id) => ({
      id: String(id),
      name: users.find((u) => u.id === id)?.name ?? String(id)
    })),
    cliente: toItems(value.clients || [], (id) => ({
      id,
      name: clients.find((c) => c.id === id)?.name ?? id
    })),
    motivo: toItems(value.motive_ids || [], (id) => ({
      id: String(id),
      name: motives.find((m) => m.id === id)?.name ?? String(id)
    })),
    procedencia: toItems(value.eligibility_status || [], (id) => ({
      id,
      name: eligibilityStatuses.find((e) => e.id === id)?.description ?? id
    }))
  };

  const selectionToDomain = (sel: FilterSelection): Partial<IBalancesFilter> => ({
    users: (sel.kam || []).map((o) => Number(o.id)),
    clients: (sel.cliente || []).map((o) => o.id),
    motive_ids: (sel.motivo || []).map((o) => Number(o.id)),
    eligibility_status: (sel.procedencia || []).map((o) => o.id)
  });

  const hasCommittedDate = Boolean(value.from_date || value.to_date);
  const dateTagValue =
    value.from_date && value.to_date
      ? `${value.from_date} - ${value.to_date}`
      : value.from_date || value.to_date || "";

  const categories: FilterCategoryConfig[] = [
    {
      key: "kam",
      label: t("kam"),
      options: users.map((u) => ({ id: String(u.id), name: u.name }))
    },
    {
      key: "cliente",
      label: t("customer"),
      options: clients.map((c) => ({ id: c.id, name: c.name }))
    },
    {
      key: "motivo",
      label: t("reason"),
      options: motives.map((m) => ({ id: String(m.id), name: m.name }))
    },
    {
      key: "procedencia",
      label: t("origin"),
      options: eligibilityStatuses.map((e) => ({ id: e.id, name: e.description }))
    },
    {
      key: "fecha",
      label: t("date"),
      kind: "custom",
      metaLabel: t("selectPeriod"),
      draftCount: dateDraft.from_date || dateDraft.to_date ? 1 : 0,
      renderPanel: () => <BalancesDateTab value={dateDraft} onChange={setDateDraft} />,
      renderTag: () =>
        hasCommittedDate ? (
          <div className="flex items-center gap-1.5 bg-secondary/80 border border-border px-3 py-1.5 rounded-lg text-[13px]">
            <span className="text-muted-foreground font-medium">{t("dateTag")}</span>
            <span className="font-bold text-foreground">{dateTagValue}</span>
            <button
              type="button"
              onClick={() => onChange({ ...value, from_date: null, to_date: null })}
              className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : null
    }
  ];

  return (
    <FilterModal
      categories={categories}
      value={selection}
      isLoading={isLoading}
      formatTagValue={(cat, items) =>
        items.length === 1
          ? items[0].name
          : isTagPluralKey(cat.key)
            ? t(`tagCount.${cat.key}`, { count: items.length })
            : String(items.length)
      }
      onApply={(sel) =>
        onChange({
          ...value,
          ...selectionToDomain(sel),
          from_date: dateDraft.from_date,
          to_date: dateDraft.to_date
        })
      }
      onValueChange={(sel) => onChange({ ...value, ...selectionToDomain(sel) })}
      onClearAll={() =>
        onChange({
          ...value,
          users: [],
          clients: [],
          motive_ids: [],
          eligibility_status: [],
          from_date: null,
          to_date: null
        })
      }
      onOpen={() => setDateDraft({ from_date: value.from_date, to_date: value.to_date })}
      onClearDraft={() => setDateDraft({ from_date: null, to_date: null })}
    />
  );
}
