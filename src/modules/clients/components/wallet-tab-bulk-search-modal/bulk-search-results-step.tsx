import { useMemo } from "react";
import { Button, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { ArrowRight, DownloadSimple } from "phosphor-react";
import { useTranslations } from "use-intl";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import UiSearchInput from "@/components/ui/search-input";
import { useAppStore } from "@/lib/store/store";
import { cn, formatNumber } from "@/utils/utils";
import { IInvoiceBulkSearchSummary } from "@/types/invoices/IInvoices";
import { RESULT_META } from "./bulk-search-constants";
import { formatMillions } from "./bulk-search-utils";
import { BulkResultKind, IBulkSearchRow } from "./types";

interface Props {
  rows: IBulkSearchRow[];
  summary: IInvoiceBulkSearchSummary;
  tab: BulkResultKind;
  query: string;
  isDownloading: boolean;
  onTabChange: (tab: BulkResultKind) => void;
  onQueryChange: (query: string) => void;
  onDownload: () => void;
  onRestart: () => void;
  onContinue: () => void;
}

const RESULT_KINDS: BulkResultKind[] = ["found", "missing", "other", "dup"];

// La tabla sólo pinta las primeras filas; el Excel trae todas
const VISIBLE_ROWS = 100;

const BulkSearchResultsStep = ({
  rows,
  summary,
  tab,
  query,
  isDownloading,
  onTabChange,
  onQueryChange,
  onDownload,
  onRestart,
  onContinue
}: Props) => {
  const t = useTranslations("clients.bulkSearch.results");
  const formatMoney = useAppStore((state) => state.formatMoney);

  // IDs por resultado: las cuatro suman el total recibido
  const counts: Record<BulkResultKind, number> = {
    found: summary.found,
    missing: summary.not_found,
    other: summary.other_client,
    dup: summary.duplicated
  };

  const getDetail = (row: IBulkSearchRow) => {
    if (row.result === "found") return row.status;
    if (row.result === "other") return row.otherClient;
    if (row.result === "dup") return t("countedOnce");
    return "—";
  };

  // Días de vencimiento del servicio: > 0 ya venció, < 0 todavía no
  const formatDueDays = (days: number) => {
    if (!days) return t("dueToday");
    return days > 0 ? t("dueAgo", { days: Math.abs(days) }) : t("dueIn", { days: Math.abs(days) });
  };

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toUpperCase();
    return rows.filter(
      (row) => row.result === tab && (!normalizedQuery || row.id.includes(normalizedQuery))
    );
  }, [rows, tab, query]);

  const cardMeta: Record<BulkResultKind, string> = {
    found: t("cards.foundPending", { amount: formatMillions(summary.found_pending_amount) }),
    missing: t("cards.missing"),
    other: t("cards.other"),
    dup: t("cards.dup")
  };

  const columns: ColumnsType<IBulkSearchRow> = [
    {
      title: "ID",
      dataIndex: "id",
      render: (id: string) => <span className="font-mono text-[13px]">{id}</span>
    },
    {
      title: t("columns.result"),
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
          {t(`kinds.${result}.label`)}
        </Tag>
      )
    },
    {
      title: t("columns.detail"),
      key: "detail",
      render: (_, row) => (
        <span className="flex min-w-0 items-center gap-1.5 text-[#444]">
          {row.status && (
            <span
              className="h-1.5 w-1.5 flex-none rounded-full"
              style={{ backgroundColor: row.statusColor }}
            />
          )}
          <span className="truncate">{getDetail(row)}</span>
        </span>
      )
    },
    {
      title: t("columns.pending"),
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
      title: t("columns.due"),
      dataIndex: "dueDays",
      align: "right",
      width: 110,
      render: (days?: number) =>
        days !== undefined && (
          <span className="whitespace-nowrap text-muted-foreground">{formatDueDays(days)}</span>
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
              <span className="flex items-center gap-1.5 whitespace-nowrap text-[13px] text-[#444]">
                <span
                  className="h-[7px] w-[7px] rounded-full"
                  style={{ backgroundColor: RESULT_META[kind].dot }}
                />
                {t(`kinds.${kind}.plural`)}
              </span>
              <span className="text-lg font-semibold tabular-nums text-foreground">
                {formatNumber(counts[kind])}
              </span>
              <span className="max-w-full truncate text-[13px] text-[#8a8a8a]">
                {cardMeta[kind]}
              </span>
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <UiSearchInput
            id="bulk-search-results-query"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
          <span className="mr-auto text-[13px] text-[#8a8a8a]">
            {filteredRows.length > VISIBLE_ROWS
              ? t("showing", { visible: VISIBLE_ROWS, total: filteredRows.length })
              : t("records", { count: filteredRows.length })}
          </span>
          <Button
            size="large"
            icon={<DownloadSimple size={14} />}
            loading={isDownloading}
            onClick={onDownload}
          >
            {t("downloadExcel")}
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
            locale={{ emptyText: t("empty") }}
          />
        </div>
      </div>

      <footer className="mt-3 flex flex-none flex-wrap items-center gap-2.5 border-t border-[#ececec] px-[22px] py-3.5">
        <Button type="text" size="large" onClick={onRestart}>
          {t("newSearch")}
        </Button>
        <div className="flex-1" />
        <PrincipalButton
          disabled={!summary.found_invoices}
          onClick={onContinue}
          icon={<ArrowRight size={14} />}
          iconPosition="end"
        >
          {t("continue", { count: summary.found_invoices })}
        </PrincipalButton>
      </footer>
    </>
  );
};

export default BulkSearchResultsStep;
