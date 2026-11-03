"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button, Select, Typography } from "antd";
import { CaretLeft, DownloadSimple, UploadSimple } from "phosphor-react";
import { useTranslations } from "use-intl";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import UiSearchInput from "@/components/ui/search-input";
import { useMessageApi } from "@/context/MessageContext";
import { useDebounce } from "@/hooks/useDeabouce";
import { useAppStore } from "@/lib/store/store";
import { downloadConciliationUploadFile } from "@/services/portfolioConciliation/portfolioConciliation";
import { extractSingleParam, formatNumber } from "@/utils/utils";
import {
  ConciliationDocumentType,
  ConciliationSortField,
  ConciliationStatus,
  IConciliationQuery,
  IConciliationUpload
} from "@/types/portfolioConciliation/IPortfolioConciliation";
import ConciliationTable from "../../components/conciliation-table/conciliation-table";
import PortfolioSkeleton from "../../components/portfolio-skeleton/portfolio-skeleton";
import SummaryCards from "../../components/summary-cards/summary-cards";
import UploadModal from "../../components/upload-modal/upload-modal";
import {
  UploadFailedPanel,
  UploadProcessingBanner
} from "../../components/upload-status/upload-status";
import { CONCILIATION_STATUSES, DOCUMENT_TYPES, TEMPLATE_URL } from "../../constants";
import { useConciliationUpload } from "../../hooks/use-conciliation-upload";
import { usePortfolioConciliation } from "../../hooks/use-portfolio-conciliation";
import { formatDateTime } from "../../utils/format";

/**
 * Conciliación masiva Cashport (HU 86e3915mm): el analista sube el Excel de
 * cartera del cliente, el backend lo cruza contra Cashport en segundo plano y
 * reemplaza la cartera conciliada; aquí se sigue la carga y se revisa el
 * resultado por status_cashport.
 */
const PortfolioConciliationView = () => {
  const t = useTranslations("reconciliation");
  const tv = useTranslations("reconciliation.view");
  const params = useParams();
  const clientUUID = extractSingleParam(params.clientId) || "";
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const { showMessage } = useMessageApi();

  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ConciliationStatus | null>(null);
  const [documentType, setDocumentType] = useState<ConciliationDocumentType | null>(null);
  const [searchText, setSearchText] = useState("");
  const search = useDebounce(searchText, 400);
  const [sort, setSort] = useState<Pick<IConciliationQuery, "sortBy" | "sortDir">>({
    sortBy: "file_row",
    sortDir: "asc"
  });

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [trackedUpload, setTrackedUpload] = useState<IConciliationUpload | null>(null);
  const [dismissedFailedUUID, setDismissedFailedUUID] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const query: IConciliationQuery = { page, status, documentType, search, ...sort };
  const { portfolio, pagination, error, isStale, isFirstLoad, isValidating, prefetch, refreshAll } =
    usePortfolioConciliation(clientUUID, query);
  const { upload: polledUpload } = useConciliationUpload(clientUUID, trackedUpload?.uuid ?? null);

  const latestUpload = portfolio?.latest_upload ?? null;
  const currentUpload = portfolio?.current_upload ?? null;

  // Al entrar con una carga en proceso (otra pestaña, otro analista), se sigue igual.
  useEffect(() => {
    if (!trackedUpload && latestUpload?.status === "PROCESSING") setTrackedUpload(latestUpload);
  }, [latestUpload?.uuid, latestUpload?.status]);

  // Fin de la carga: se refresca la cartera y se avisa.
  useEffect(() => {
    if (!polledUpload || polledUpload.status === "PROCESSING") return;
    setTrackedUpload(null);
    setPage(1);
    refreshAll();
    if (polledUpload.status === "DONE") {
      showMessage("success", tv("done", { count: formatNumber(polledUpload.total_rows ?? 0) }));
    } else {
      showMessage("error", tv("failed"));
    }
  }, [polledUpload?.uuid, polledUpload?.status]);

  // Con la página ya en pantalla se piden en segundo plano las otras tarjetas
  // y la página siguiente: el clic se resuelve desde la caché, sin esperar.
  const totalPages = pagination?.totalPages ?? 0;
  useEffect(() => {
    if (!portfolio || isStale || trackedUpload) return;
    const timer = window.setTimeout(() => {
      for (const next of [null, ...CONCILIATION_STATUSES]) {
        if (next !== status) prefetch({ ...query, page: 1, status: next });
      }
      if (page < totalPages) prefetch({ ...query, page: page + 1 });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [
    Boolean(portfolio),
    isStale,
    page,
    status,
    documentType,
    search,
    sort.sortBy,
    sort.sortDir,
    totalPages,
    Boolean(trackedUpload)
  ]);

  // Filtros y orden vuelven a la primera página
  const changeStatus = (value: ConciliationStatus | null) => {
    setStatus(value);
    setPage(1);
  };
  const changeDocumentType = (value: ConciliationDocumentType | null) => {
    setDocumentType(value);
    setPage(1);
  };
  const changeSearch = (value: string) => {
    setSearchText(value);
    setPage(1);
  };
  const changeSort = (col: ConciliationSortField) => {
    setSort((prev) => ({
      sortBy: col,
      sortDir: prev.sortBy === col && prev.sortDir === "asc" ? "desc" : "asc"
    }));
    setPage(1);
  };

  const handleDownload = async () => {
    if (!currentUpload) return;
    setIsDownloading(true);
    try {
      await downloadConciliationUploadFile(clientUUID, currentUpload);
    } catch (err) {
      showMessage("error", err instanceof Error ? err.message : tv("downloadError"));
    } finally {
      setIsDownloading(false);
    }
  };

  const isProcessing = Boolean(trackedUpload);
  const failedUpload =
    !isProcessing && latestUpload?.status === "FAILED" && latestUpload.uuid !== dismissedFailedUUID
      ? latestUpload
      : null;
  const hasPortfolio = Boolean(currentUpload) || Boolean(portfolio?.summary.total.count);
  const documentTypeOptions = DOCUMENT_TYPES.map((value: ConciliationDocumentType) => ({
    value,
    label: t(`documentType.${value}`)
  }));

  return (
    <div className="flex flex-col gap-4 p-1 text-foreground">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="mr-auto flex min-w-0 items-center gap-2">
          <Link
            href={`/clients/detail/${clientUUID}/project/${projectId}`}
            aria-label={tv("backToCustomer")}
            className="flex h-8 w-8 flex-none items-center justify-center rounded-lg text-foreground hover:bg-[#f0f0f0]"
          >
            <CaretLeft size={18} />
          </Link>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">{tv("title")}</h2>
            {portfolio?.client && (
              <p className="truncate text-[13px] text-muted-foreground">
                {tv("clientLine", {
                  name: portfolio.client.name ?? tv("customer"),
                  taxId: portfolio.client.nit
                })}
              </p>
            )}
          </div>
        </div>
        <Typography.Link href={TEMPLATE_URL} download underline className="!text-[13px]">
          {tv("downloadTemplate")}
        </Typography.Link>
        <PrincipalButton
          icon={<UploadSimple size={16} />}
          disabled={isProcessing || !portfolio}
          onClick={() => setIsUploadOpen(true)}
        >
          {tv("upload")}
        </PrincipalButton>
      </header>

      {error && !portfolio && (
        <div className="rounded-lg bg-[#fdecec] px-4 py-3 text-[13px] text-[#c4321c]">
          {error.message || tv("loadError")}
        </div>
      )}

      {isFirstLoad && <PortfolioSkeleton />}

      {isProcessing && (
        <UploadProcessingBanner fileName={(polledUpload ?? trackedUpload)?.file_name} />
      )}

      {failedUpload && (
        <UploadFailedPanel
          upload={failedUpload}
          onRetry={() => setIsUploadOpen(true)}
          onDismiss={() => setDismissedFailedUUID(failedUpload.uuid)}
        />
      )}

      {portfolio && !hasPortfolio && !isProcessing && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-[#d6d6d6] px-6 py-14 text-center">
          <span className="text-[15px] font-semibold">{tv("emptyTitle")}</span>
          <span className="max-w-[460px] text-[13px] text-[#8a8a8a]">{tv("emptyDescription")}</span>
          <PrincipalButton icon={<UploadSimple size={16} />} onClick={() => setIsUploadOpen(true)}>
            {tv("upload")}
          </PrincipalButton>
        </div>
      )}

      {portfolio && hasPortfolio && (
        <>
          {currentUpload && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[#8a8a8a]">
              <span>
                {tv.rich(currentUpload.created_by_name ? "currentUploadBy" : "currentUpload", {
                  fileName: currentUpload.file_name,
                  date: formatDateTime(currentUpload.finished_at ?? currentUpload.created_at),
                  user: currentUpload.created_by_name ?? "",
                  count: formatNumber(currentUpload.total_rows ?? 0),
                  b: (chunks) => <b className="text-foreground">{chunks}</b>
                })}
              </span>
              {currentUpload.has_file && (
                <Button
                  type="link"
                  size="small"
                  icon={<DownloadSimple size={14} />}
                  loading={isDownloading}
                  onClick={handleDownload}
                  className="!px-0"
                >
                  {tv("downloadFile")}
                </Button>
              )}
            </div>
          )}

          <SummaryCards summary={portfolio.summary} selected={status} onSelect={changeStatus} />

          <div className="flex flex-wrap items-center gap-2">
            <UiSearchInput
              id="portfolio-conciliation-search"
              placeholder={tv("searchPlaceholder")}
              value={searchText}
              onChange={(event) => changeSearch(event.target.value)}
              showBorder
            />
            <Select
              allowClear
              placeholder={tv("allTypes")}
              value={documentType ?? undefined}
              onChange={(value) => changeDocumentType(value ?? null)}
              options={documentTypeOptions}
              className="min-w-[180px]"
            />
          </div>

          <ConciliationTable
            rows={portfolio.rows}
            sortBy={sort.sortBy}
            sortDir={sort.sortDir}
            onSort={changeSort}
            page={page}
            total={pagination?.totalRows ?? 0}
            onPageChange={setPage}
            isStale={isStale}
            isRefreshing={isValidating}
          />
        </>
      )}

      <UploadModal
        isOpen={isUploadOpen}
        clientUUID={clientUUID}
        clientName={portfolio?.client.name}
        currentUpload={currentUpload}
        onClose={() => setIsUploadOpen(false)}
        onUploaded={(upload) => {
          setTrackedUpload(upload);
          setDismissedFailedUUID(null);
        }}
      />
    </div>
  );
};

export default PortfolioConciliationView;
