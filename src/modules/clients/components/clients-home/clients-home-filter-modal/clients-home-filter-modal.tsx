"use client";

import { useState } from "react";
import { useTranslations } from "use-intl";

import type {
  IClientsHomeCatalogItem,
  IClientsHomeExecutiveCatalogItem
} from "@/types/clients/IClientsHome";
import { DUE_PERIODS, type DuePeriod } from "../../../constants/clients-home";
import { duePeriodRange, executivesForCoordinators } from "../../../utils/clients-home-format";
import SearchField from "@/components/ui/search-field/search-field";
import { useClientsHomeLabels } from "../../../hooks/clients-home/use-clients-home-labels";

export interface ClientsHomeFilterDraft {
  due: { from: string; to: string; period: DuePeriod | null };
  coordinators: string[];
  executives: string[];
  markets: string[];
}

type CategoryKey = "fecha" | "coordinators" | "executives" | "markets";
type ListCategoryKey = Exclude<CategoryKey, "fecha">;

interface ClientsHomeFilterModalProps {
  initial: ClientsHomeFilterDraft;
  coordinators: IClientsHomeCatalogItem[];
  executives: IClientsHomeExecutiveCatalogItem[];
  markets: IClientsHomeCatalogItem[];
  onApply: (draft: ClientsHomeFilterDraft) => void;
  onClose: () => void;
}

/** Texto en `clients.home.filters.categories`. */
const CATEGORIES: CategoryKey[] = ["fecha", "coordinators", "executives", "markets"];

const emptyDraft = (): ClientsHomeFilterDraft => ({
  due: { from: "", to: "", period: null },
  coordinators: [],
  executives: [],
  markets: []
});

/* Por dimensión: clave del texto de "sin dato" (en `clients.home`). */
const EMPTY_LABEL_KEYS = {
  coordinators: "noCoordinator",
  executives: "noExecutive",
  markets: "noMarket"
} as const satisfies Record<ListCategoryKey, string>;

/** "Filtros Avanzados" del Home: Fecha (vencimiento), Coordinador, Ejecutivo y Mercado. */
export default function ClientsHomeFilterModal({
  initial,
  coordinators,
  executives,
  markets,
  onApply,
  onClose
}: ClientsHomeFilterModalProps) {
  const t = useTranslations("clients.home");
  const tCommon = useTranslations("common");
  const labels = useClientsHomeLabels();
  const [draft, setDraft] = useState<ClientsHomeFilterDraft>(initial);
  const [cat, setCat] = useState<CategoryKey>("fecha");
  const [optQuery, setOptQuery] = useState("");

  // Ejecutivo se limita a los coordinadores marcados en el borrador.
  const visibleExecutives = executivesForCoordinators(executives, draft.coordinators);
  const catalogs: Record<ListCategoryKey, IClientsHomeCatalogItem[]> = {
    coordinators,
    executives: visibleExecutives,
    markets
  };
  const catalog = cat === "fecha" ? [] : catalogs[cat];
  const nameOf = (o: IClientsHomeCatalogItem) =>
    o.name ?? (cat === "fecha" ? "" : t(EMPTY_LABEL_KEYS[cat]));
  const optList = catalog.filter((o) => nameOf(o).toLowerCase().includes(optQuery.toLowerCase()));
  const selected = cat === "fecha" ? [] : draft[cat];

  const countOf = (key: CategoryKey) =>
    key === "fecha" ? (draft.due.from || draft.due.to ? 1 : 0) : draft[key].length;

  const toggleOpt = (key: string) => {
    if (cat === "fecha") return;
    setDraft((d) => ({
      ...d,
      [cat]: d[cat].includes(key) ? d[cat].filter((k) => k !== key) : [...d[cat], key]
    }));
  };

  const selectAll = () => {
    if (cat === "fecha") return;
    setDraft((d) => ({
      ...d,
      [cat]: Array.from(new Set([...d[cat], ...optList.map((o) => o.key)]))
    }));
  };

  const pickPeriod = (period: DuePeriod) =>
    setDraft((d) =>
      d.due.period === period
        ? { ...d, due: { from: "", to: "", period: null } }
        : { ...d, due: { ...duePeriodRange(period), period } }
    );

  const setRange = (field: "from" | "to", value: string) =>
    setDraft((d) => ({ ...d, due: { ...d.due, [field]: value, period: null } }));

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(20,20,20,.38)] p-6"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[calc(100*var(--vh)-48px)] w-[900px] max-w-full flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(0,0,0,.22)]"
      >
        <div className="flex items-center gap-3 border-b border-[#ececec] px-[22px] py-[18px]">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f4f9d2]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="#cbe71e"
              stroke="#9bb514"
              strokeWidth="1.5"
              strokeLinejoin="round"
            >
              <path d="M3 5h18l-7 8v6l-4 2v-8z" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[17px] font-semibold">{t("filters.title")}</div>
            <div className="text-[13px] text-[#6b6b6b]">{t("filters.subtitle")}</div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={tCommon("actions.close")}
            className="h-8 w-8 cursor-pointer rounded-lg border-0 bg-transparent text-xl text-[#4a4a4a] hover:bg-[#f2f2f2]"
          >
            ×
          </button>
        </div>

        <div className="flex min-h-[380px] flex-1 overflow-hidden">
          <div className="w-[120px] shrink-0 border-r border-[#ececec] py-2 sm:w-[240px]">
            {CATEGORIES.map((key) => {
              const on = key === cat;
              const n = countOf(key);
              return (
                <div
                  key={key}
                  onClick={() => {
                    setCat(key);
                    setOptQuery("");
                  }}
                  className="relative flex h-11 cursor-pointer items-center pl-[22px] pr-[18px] text-sm"
                  style={{
                    color: on ? "#141414" : "#4a4a4a",
                    fontWeight: on ? 600 : 400,
                    background: on ? "#f7f7f7" : "transparent"
                  }}
                >
                  <span
                    className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-[3px]"
                    style={{ background: on ? "#cbe71e" : "transparent" }}
                  />
                  <span className="flex-1">{t(`filters.categories.${key}`)}</span>
                  <span className="mr-2 text-[13px] text-[#8a8a8a]">{n || ""}</span>
                  <span style={{ color: on ? "#141414" : "transparent" }}>&gt;</span>
                </div>
              );
            })}
          </div>

          <div className="min-w-0 flex-1 overflow-auto px-[22px] py-[18px]">
            {cat === "fecha" ? (
              <>
                <div className="mb-3.5 rounded-lg bg-[#f7f7f7] px-3 py-2 text-[13px] font-semibold tracking-[.6px] text-[#4a4a4a]">
                  {t("filters.selectPeriod")}
                </div>
                <div className="mb-2.5 text-[13px] font-semibold">{t("filters.presetPeriods")}</div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2">
                  {DUE_PERIODS.map((p) => {
                    const on = draft.due.period === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => pickPeriod(p)}
                        className="h-10 cursor-pointer rounded-lg px-3.5 text-left text-[13px] text-[#141414]"
                        style={{
                          border: `1px solid ${on ? "#cbe71e" : "#e3e3e3"}`,
                          background: on ? "#f4f9d2" : "#fafafa",
                          fontWeight: on ? 600 : 400
                        }}
                      >
                        {labels.duePeriod(p)}
                      </button>
                    );
                  })}
                </div>
                <div className="my-[18px] h-px bg-[#ececec]" />
                <div className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#141414"
                    strokeWidth="2"
                  >
                    <rect x="3" y="5" width="18" height="16" rx="2" />
                    <path d="M3 10h18M8 3v4M16 3v4" />
                  </svg>
                  {t("filters.customRange")}
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2.5">
                  {(["from", "to"] as const).map((field) => (
                    <label key={field} className="flex flex-col gap-1 text-[13px] text-[#6b6b6b]">
                      {field === "from" ? t("filters.from") : t("filters.to")}
                      <input
                        type="date"
                        value={draft.due[field]}
                        min={field === "to" ? draft.due.from || undefined : undefined}
                        max={field === "from" ? draft.due.to || undefined : undefined}
                        onChange={(e) => setRange(field, e.target.value)}
                        className="h-[38px] rounded-lg border border-[#e3e3e3] bg-[#fafafa] px-2.5 text-[13px] text-[#141414]"
                      />
                    </label>
                  ))}
                </div>
              </>
            ) : (
              <>
                <SearchField
                  value={optQuery}
                  onChange={setOptQuery}
                  placeholder={t(`filters.search.${cat}`)}
                  className="mb-3"
                />
                <div className="mb-2.5 flex items-center justify-between rounded-lg bg-[#f7f7f7] px-3 py-2">
                  <span className="text-[13px] font-semibold tracking-[.6px] text-[#4a4a4a]">
                    {t("filters.results", { count: optList.length })}
                  </span>
                  <button
                    type="button"
                    onClick={selectAll}
                    className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[#8aa30f]"
                  >
                    {t("filters.selectAll")}
                  </button>
                </div>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-x-3 gap-y-1">
                  {optList.map((o) => {
                    const on = selected.includes(o.key);
                    return (
                      <div
                        key={o.key}
                        onClick={() => toggleOpt(o.key)}
                        className="flex h-10 cursor-pointer items-center gap-2.5 rounded-lg px-2 text-[13px] hover:bg-[#fafafa]"
                      >
                        <span
                          className="box-border flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full"
                          style={{
                            border: `1.5px solid ${on ? "#9bb514" : "#cfcfcf"}`,
                            background: on ? "#f4f9d2" : "#fff"
                          }}
                        >
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ background: on ? "#9bb514" : "transparent" }}
                          />
                        </span>
                        <span className="truncate">{nameOf(o)}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 border-t border-[#ececec] px-[22px] py-3.5">
          <button
            type="button"
            onClick={() => setDraft(emptyDraft())}
            className="cursor-pointer border-0 bg-transparent text-[13px] font-semibold text-[#4a4a4a]"
          >
            {t("filters.clearAll")}
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            className="h-10 cursor-pointer border-0 bg-transparent px-3.5 text-[13px] font-semibold text-[#141414]"
          >
            {tCommon("actions.cancel")}
          </button>
          <button
            type="button"
            onClick={() => {
              // Quita los ejecutivos que quedaron fuera de los coordinadores elegidos.
              const allowed = new Set(visibleExecutives.map((e) => e.key));
              onApply({ ...draft, executives: draft.executives.filter((k) => allowed.has(k)) });
            }}
            className="h-10 cursor-pointer rounded-[10px] border-0 bg-[#cbe71e] px-[18px] text-[13px] font-semibold text-[#141414] hover:bg-[#d8f032]"
          >
            {t("filters.apply")}
          </button>
        </div>
      </div>
    </div>
  );
}
