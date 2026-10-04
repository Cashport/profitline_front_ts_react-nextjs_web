import { useMemo } from "react";
import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowRight, DownloadSimple } from "phosphor-react";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import UiSearchInput from "@/components/ui/search-input";
import { useAppStore } from "@/lib/store/store";
import { cn, formatNumber } from "@/utils/utils";
import { MOCK_STATUS_COLORS, RESULT_META } from "./bulk-search-mock-data";
import { downloadCsv, formatMillions } from "./bulk-search-utils";
import { BulkResultKind, IBulkSearchRow } from "./types";

interface Props {
  rows: IBulkSearchRow[];
  tab: BulkResultKind;
  query: string;
  clientName?: string;
  onTabChange: (tab: BulkResultKind) => void;
  onQueryChange: (query: string) => void;
  onRestart: () => void;
  onContinue: () => void;
}

const RESULT_KINDS: BulkResultKind[] = ["found", "missing", "other", "dup"];

// La tabla sólo pinta las primeras filas; el Excel trae todas
const VISIBLE_ROWS = 100;

const getDetail = (row: IBulkSearchRow) => {
  if (row.result === "found") return row.status;
  if (row.result === "other") return row.otherClient;
  if (row.result === "dup") return "Se consideró una sola vez";
  return "—";
};

const BulkSearchResultsStep = ({
  rows,
  tab,
  query,
  clientName,
  onTabChange,
  onQueryChange,
  onRestart,
  onContinue
}: Props) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const { counts, foundAmount } = useMemo(() => {
    const totals: Record<BulkResultKind, number> = { found: 0, missing: 0, other: 0, dup: 0 };
    let amount = 0;
    rows.forEach((row) => {
      totals[row.result]++;
      if (row.result === "found") amount += row.amount ?? 0;
    });
    return { counts: totals, foundAmount: amount };
  }, [rows]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toUpperCase();
    return rows.filter(
      (row) => row.result === tab && (!normalizedQuery || row.id.includes(normalizedQuery))
    );
  }, [rows, tab, query]);

  const cardMeta: Record<BulkResultKind, string> = {
    found: `${formatMillions(foundAmount)} pendiente`,
    missing: "No existen en Cashport",
    other: "Pertenecen a otro NIT",
    dup: "Repetidas en tu archivo"
  };

  const handleDownload = () =>
    downloadCsv(
      "busqueda_masiva_resultados.csv",
      ["ID factura", "Resultado", "Estado", "Cliente", "Pendiente", "Días vencimiento"],
      rows.map((row) => [
        row.id,
        RESULT_META[row.result].label,
        row.status ?? "",
        row.result === "found" ? clientName ?? "" : row.otherClient ?? "",
        row.amount ?? "",
        row.dueDays ?? ""
      ])
    );

  const columns: ColumnsType<IBulkSearchRow> = [
    {
      title: "ID",
      dataIndex: "id",
      render: (id: string) => <span className="font-mono text-xs">{id}</span>
    },
    {
      title: "Resultado",
      dataIndex: "result",
      width: 150,
      render: (result: BulkResultKind) => (
        <Tag
          bordered={false}
          style={{
            marginInlineEnd: 0,
            borderRadius: 10,
            backgroundColor: RESULT_META[result].bg,
            color: RESULT_META[result].color
          }}
          className="font-medium"
        >
          {RESULT_META[result].label}
        </Tag>
      )
    },
    {
      title: "Estado / detalle",
      key: "detail",
      render: (_, row) => (
        <span className="flex min-w-0 items-center gap-1.5 text-[#444]">
          {row.status && (
            <span
              className="h-1.5 w-1.5 flex-none rounded-full"
              style={{ backgroundColor: MOCK_STATUS_COLORS[row.status] }}
            />
          )}
          <span className="truncate">{getDetail(row)}</span>
        </span>
      )
    },
    {
      title: "Pendiente",
      dataIndex: "amount",
      align: "right",
      render: (amount?: number) =>
        amount !== undefined && (
          <span className="whitespace-nowrap font-medium tabular-nums">
            {formatMoney(amount, { hideDecimals: true })}
          </span>
        )
    },
    {
      title: "Vence",
      dataIndex: "dueDays",
      align: "right",
      width: 90,
      render: (days?: number) =>
        days !== undefined && (
          <span className="whitespace-nowrap text-muted-foreground">{days} días</span>
        )
    }
  ];

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-3 px-[22px] pt-4">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2">
          {RESULT_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => onTabChange(kind)}
              className={cn(
                "flex min-w-0 flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                kind === tab
                  ? "border-foreground bg-white"
                  : "border-[#ececec] bg-[#fafafa] hover:border-[#d6d6d6]"
              )}
            >
              <span className="flex items-center gap-1.5 whitespace-nowrap text-xs text-[#444]">
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ backgroundColor: RESULT_META[kind].dot }}
                />
                {RESULT_META[kind].plural}
              </span>
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {formatNumber(counts[kind])}
              </span>
              <span className="max-w-full truncate text-[11px] text-[#8a8a8a]">
                {cardMeta[kind]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiSearchInput
            id="bulk-search-results-query"
            placeholder="Buscar en resultados"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            showBorder
          />
          <span className="mr-auto text-[11px] text-[#8a8a8a]">
            {filteredRows.length > VISIBLE_ROWS
              ? `Mostrando ${VISIBLE_ROWS} de ${formatNumber(filteredRows.length)} · el Excel trae todo`
              : `${formatNumber(filteredRows.length)} registros`}
          </span>
          <Button size="large" icon={<DownloadSimple size={14} />} onClick={handleDownload}>
            Descargar Excel
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-auto rounded-lg border border-[#ececec]">
          <Table
            size="small"
            rowKey="key"
            columns={columns}
            dataSource={filteredRows.slice(0, VISIBLE_ROWS)}
            pagination={false}
            sticky
            locale={{ emptyText: "Sin registros para este filtro" }}
          />
        </div>
      </div>

      <footer className="mt-3 flex flex-none flex-wrap items-center gap-2.5 border-t border-[#ececec] px-[22px] py-3.5">
        <Button type="text" size="large" onClick={onRestart}>
          Nueva búsqueda
        </Button>
        <div className="flex-1" />
        <PrincipalButton
          disabled={!counts.found}
          onClick={onContinue}
          icon={<ArrowRight size={14} />}
          iconPosition="end"
        >
          Continuar con {formatNumber(counts.found)} encontradas
        </PrincipalButton>
      </footer>
    </>
  );
};

export default BulkSearchResultsStep;
