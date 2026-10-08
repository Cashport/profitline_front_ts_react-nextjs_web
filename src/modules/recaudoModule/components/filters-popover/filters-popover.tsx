"use client";

import { useState } from "react";
import { AutoComplete, Button, ConfigProvider, Popover, Select } from "antd";
import { Filter } from "lucide-react";

import { useWalletTheme } from "@/modules/walletModule/contexts/wallet-theme-context";
import type {
  ICollectionTower,
  ITowerCatalogItem
} from "@/types/collectionTower/ICollectionTower";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import {
  activeFilterCount,
  clientOptions,
  coordinatorPatch,
  executivePatch,
  indexCatalogs,
  managementOf,
  managementPatch,
  matchesClient
} from "../../utils/filters";

/** Campos del panel al alto normal de AntD: el encabezado los sube a 48px. */
const PANEL_THEME = { token: { controlHeight: 32 } };

const toOptions = (list: ITowerCatalogItem[]) => list.map((x) => ({ value: x.id, label: x.name }));

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <span className="text-[10px] font-semibold uppercase tracking-[0.05em] text-muted-foreground">
      {label}
    </span>
    {children}
  </div>
);

/**
 * Panel "Filtros": gerencia, coordinador, ejecutivo, canal y cliente. Las
 * listas se acotan en cascada y elegir un nivel de abajo fija los de arriba.
 */
export default function FiltersPopover({ data }: { data?: ICollectionTower }) {
  const { resolvedTheme } = useWalletTheme();
  const { filters: f, patch, clear } = useTowerFilters();
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(f);

  const panel = () => {
    if (!data) return null;
    const cat = data.catalogs;
    const ix = indexCatalogs(cat);
    const coordinators = cat.coordinators.filter(
      (c) => !f.management || c.managementId === f.management
    );
    const executives = cat.executives.filter(
      (e) =>
        (!f.coordinator || e.coordinatorId === f.coordinator) &&
        (!f.management || managementOf(ix, e.coordinatorId) === f.management)
    );
    const select = { allowClear: true, showSearch: true, optionFilterProp: "label" };

    return (
      <ConfigProvider theme={PANEL_THEME}>
        <div className="wallet-scope flex w-[280px] max-w-[calc(100vw_-_32px)] flex-col gap-2.5">
          <Field label="Gerencia">
            <Select
              {...select}
              placeholder="Todas"
              value={f.management ?? undefined}
              options={toOptions(cat.managements)}
              onChange={(v?: string) => patch((cur) => managementPatch(cur, v ?? null, ix))}
            />
          </Field>
          <Field label="Coordinador">
            <Select
              {...select}
              placeholder="Todos"
              value={f.coordinator ?? undefined}
              options={toOptions(coordinators)}
              onChange={(v?: string) => patch((cur) => coordinatorPatch(cur, v ?? null, ix))}
            />
          </Field>
          <Field label="Ejecutivo">
            <Select
              {...select}
              placeholder="Todos"
              value={f.executive ?? undefined}
              options={toOptions(executives)}
              onChange={(v?: string) => patch(executivePatch(v ?? null, ix))}
            />
          </Field>
          <Field label="Canal">
            <Select
              {...select}
              placeholder="Todos"
              value={f.channel ?? undefined}
              options={toOptions(cat.channels)}
              onChange={(v?: string) => patch({ channel: v ?? null })}
            />
          </Field>
          <Field label="Cliente">
            <AutoComplete
              allowClear
              placeholder="Nombre o NIT"
              value={f.search}
              options={clientOptions(cat, f)}
              filterOption={matchesClient}
              onChange={(search: string) => patch({ search: search ?? "" })}
            />
          </Field>
          <Button size="small" className="self-start" onClick={clear}>
            Limpiar filtros
          </Button>
        </div>
      </ConfigProvider>
    );
  };

  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      trigger="click"
      placement="bottomRight"
      arrow={false}
      content={panel()}
      rootClassName={resolvedTheme === "dark" ? "dark" : undefined}
    >
      <Button icon={<Filter className="h-3.5 w-3.5" />} disabled={!data} aria-expanded={open}>
        Filtros
        {count > 0 && (
          <span className="ml-0.5 rounded-[9px] bg-primary px-1.5 text-[10px] font-bold leading-4 text-primary-foreground">
            {count}
          </span>
        )}
      </Button>
    </Popover>
  );
}
