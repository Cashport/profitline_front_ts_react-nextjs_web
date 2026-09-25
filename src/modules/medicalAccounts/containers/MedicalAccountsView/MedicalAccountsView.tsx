"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "antd";
import { DownloadSimple } from "@phosphor-icons/react";

import { Card, CardContent } from "@/modules/chat/ui/card";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { downloadMedicalAccountsReport } from "@/services/medicalAccounts/medicalAccounts";
import { MedicalAccountsToolbar } from "../../components/MedicalAccountsToolbar/MedicalAccountsToolbar";
import { MedicalAccountsTable } from "../../components/MedicalAccountsTable/MedicalAccountsTable";
import { ModalAddMedicalAccount } from "../../components/ModalAddMedicalAccount/ModalAddMedicalAccount";
import { ModalRadiateBulk } from "../../components/ModalRadiateBulk/ModalRadiateBulk";
import { useMedicalAccounts } from "../../hooks/useMedicalAccounts";
import { IMedicalAccountListItem } from "../../types/IMedicalAccount";

export function MedicalAccountsView() {
  const router = useRouter();
  const { showMessage } = useMessageApi();
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [epsFilter, setEpsFilter] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkRadiate, setShowBulkRadiate] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, pagination, isLoading, mutate } = useMedicalAccounts({
    page,
    limit,
    search: debouncedSearch,
    status: statusFilter,
    eps: epsFilter,
    dateFrom: dateRange.start,
    dateTo: dateRange.end
  });

  const handleOpenDetail = (record: IMedicalAccountListItem) => {
    router.push(`/cuentas-medicas/${record.id}`);
  };

  const handleDownloadReport = async () => {
    setIsDownloadingReport(true);
    try {
      await downloadMedicalAccountsReport({
        project_id: projectId ? String(projectId) : null,
        search: debouncedSearch || null,
        status_code: statusFilter,
        eps: epsFilter || null,
        date_from: dateRange.start,
        date_to: dateRange.end
      });
    } catch (err) {
      showMessage(
        "error",
        err instanceof Error ? err.message : "Ocurrió un error al descargar el reporte."
      );
    } finally {
      setIsDownloadingReport(false);
    }
  };

  return (
    <>
      <main>
        <Card className="bg-cashport-white border-0 shadow-sm">
          <CardContent>
            <MedicalAccountsToolbar
              onSearch={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              epsFilter={epsFilter}
              onEpsChange={(value) => {
                setEpsFilter(value);
                setPage(1);
              }}
              dateRange={dateRange}
              onDateRangeChange={(start, end) => {
                setDateRange({ start: start || null, end: end || null });
                setPage(1);
              }}
              onClearDateRange={() => {
                setDateRange({ start: null, end: null });
                setPage(1);
              }}
              onAdd={() => setIsAddModalOpen(true)}
            />

            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  type="primary"
                  onClick={() => setShowBulkRadiate(true)}
                  disabled={selectedIds.length === 0}
                >
                  Radicación masiva{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
                </Button>
                <Button
                  icon={<DownloadSimple size={16} />}
                  onClick={handleDownloadReport}
                  loading={isDownloadingReport}
                >
                  Descargar reporte
                </Button>
              </div>
            </div>

            <MedicalAccountsTable
              data={data}
              loading={isLoading}
              onOpenDetail={handleOpenDetail}
              onDeleted={() => {
                setSelectedIds([]);
                mutate();
              }}
              selectedRowKeys={selectedIds}
              onSelectionChange={(keys) => setSelectedIds(keys.map(Number))}
              currentPage={page}
              pageSize={limit}
              total={pagination.totalRows}
              onPageChange={(p, ps) => {
                setPage(p);
                setLimit(ps);
              }}
            />
          </CardContent>
        </Card>
      </main>

      <ModalAddMedicalAccount
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => mutate()}
      />

      <ModalRadiateBulk
        isOpen={showBulkRadiate}
        ids={selectedIds}
        onClose={() => setShowBulkRadiate(false)}
        onSuccess={() => {
          setSelectedIds([]);
          mutate();
        }}
      />
    </>
  );
}
