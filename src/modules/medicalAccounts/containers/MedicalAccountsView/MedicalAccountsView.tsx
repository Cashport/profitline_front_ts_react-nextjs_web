"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/modules/chat/ui/card";
import { MedicalAccountsToolbar } from "../../components/MedicalAccountsToolbar/MedicalAccountsToolbar";
import { MedicalAccountsTable } from "../../components/MedicalAccountsTable/MedicalAccountsTable";
import { ModalAddMedicalAccount } from "../../components/ModalAddMedicalAccount/ModalAddMedicalAccount";
import { useMedicalAccounts } from "../../hooks/useMedicalAccounts";
import { IMedicalAccountListItem } from "../../types/IMedicalAccount";

export function MedicalAccountsView() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
    dateFrom: dateRange.start,
    dateTo: dateRange.end
  });

  const handleOpenDetail = (record: IMedicalAccountListItem) => {
    router.push(`/cuentas-medicas/${record.id}`);
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

            <MedicalAccountsTable
              data={data}
              loading={isLoading}
              onOpenDetail={handleOpenDetail}
              onDeleted={() => mutate()}
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
    </>
  );
}
