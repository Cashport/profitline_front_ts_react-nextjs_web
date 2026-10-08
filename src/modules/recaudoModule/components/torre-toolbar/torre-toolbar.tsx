"use client";

import { AutoComplete, ConfigProvider, Input, Select } from "antd";
import { Search } from "lucide-react";

import type { ICollectionTower } from "@/types/collectionTower/ICollectionTower";
import { useTowerFilters } from "../../contexts/tower-filters-context";
import { clientOptions, matchesClient } from "../../utils/filters";
import FiltersPopover from "../filters-popover/filters-popover";

/** Mismo alto que el botón de tema, como en el encabezado de la cartera. */
const HEADER_THEME = { token: { controlHeight: 48 } };

/** Herramientas de la torre en el encabezado: buscador de clientes, periodo y filtros. */
export default function TorreToolbar({ data }: { data?: ICollectionTower }) {
  const { filters, patch } = useTowerFilters();

  return (
    <ConfigProvider theme={HEADER_THEME}>
      <AutoComplete
        className="w-[240px] max-[900px]:flex-[1_1_180px]"
        value={filters.search}
        options={data ? clientOptions(data.catalogs, filters) : []}
        filterOption={matchesClient}
        popupMatchSelectWidth={320}
        onChange={(search: string) => patch({ search: search ?? "" })}
      >
        <Input
          allowClear
          aria-label="Buscar cliente"
          placeholder="Buscar cliente o NIT"
          prefix={<Search className="h-3.5 w-3.5 text-muted-foreground" />}
        />
      </AutoComplete>
      <Select
        aria-label="Periodo"
        className="w-[170px]"
        disabled={!data}
        value={filters.period ?? data?.period.key}
        options={(data?.periods ?? []).map((p) => ({ value: p.key, label: p.label }))}
        // La selección del gráfico de acuerdos es de días del mes anterior: se suelta.
        onChange={(period: string) => patch({ period, segments: [] })}
      />
      <FiltersPopover data={data} />
    </ConfigProvider>
  );
}
