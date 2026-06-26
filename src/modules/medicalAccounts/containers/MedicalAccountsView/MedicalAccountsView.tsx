"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/modules/chat/ui/card";
import { MedicalAccountsToolbar } from "../../components/MedicalAccountsToolbar/MedicalAccountsToolbar";
import { MedicalAccountsTable } from "../../components/MedicalAccountsTable/MedicalAccountsTable";
import { ModalAddMedicalAccount } from "../../components/ModalAddMedicalAccount/ModalAddMedicalAccount";
import { useMedicalAccounts } from "../../hooks/useMedicalAccounts";
import { IMedicalAccountListItem, MedicalAccountStatus } from "../../types/IMedicalAccount";

export function MedicalAccountsView() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<MedicalAccountStatus | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, pagination, isLoading } = useMedicalAccounts({ page, limit });

  const filteredData = useMemo<IMedicalAccountListItem[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    return data.filter((account) => {
      const matchesStatus = !statusFilter || account.status_name === statusFilter;
      const matchesSearch =
        !term ||
        [String(account.id), account.patient_name, account.document_number, account.authorization_id]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(term));
      const day = account.created_at.slice(0, 10);
      const matchesDate =
        (!dateRange.start || day >= dateRange.start) && (!dateRange.end || day <= dateRange.end);
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [data, searchTerm, statusFilter, dateRange]);

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
              onStatusChange={setStatusFilter}
              dateRange={dateRange}
              onDateRangeChange={(start, end) =>
                setDateRange({ start: start || null, end: end || null })
              }
              onClearDateRange={() => setDateRange({ start: null, end: null })}
              onAdd={() => setIsAddModalOpen(true)}
            />

            <MedicalAccountsTable
              data={filteredData}
              loading={isLoading}
              onOpenDetail={handleOpenDetail}
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

      <ModalAddMedicalAccount isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
}
