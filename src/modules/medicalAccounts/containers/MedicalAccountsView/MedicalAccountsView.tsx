"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/modules/chat/ui/card";
import { MedicalAccountsToolbar } from "../../components/MedicalAccountsToolbar/MedicalAccountsToolbar";
import { MedicalAccountsTable } from "../../components/MedicalAccountsTable/MedicalAccountsTable";
import { ModalAddMedicalAccount } from "../../components/ModalAddMedicalAccount/ModalAddMedicalAccount";
import { medicalAccountsMock } from "../../mocks/medicalAccountsMock";
import { IMedicalAccount, MedicalAccountStatus } from "../../types/IMedicalAccount";

export function MedicalAccountsView() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<MedicalAccountStatus | null>(null);
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({
    start: null,
    end: null
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredData = useMemo<IMedicalAccount[]>(() => {
    const term = searchTerm.trim().toLowerCase();
    return medicalAccountsMock.filter((account) => {
      const matchesStatus = !statusFilter || account.estado === statusFilter;
      const matchesSearch =
        !term ||
        [account.id, account.nombrePaciente, account.documentoPaciente, account.idAutorizacion]
          .filter(Boolean)
          .some((field) => field!.toLowerCase().includes(term));
      const day = account.fechaCarga.slice(0, 10);
      const matchesDate =
        (!dateRange.start || day >= dateRange.start) && (!dateRange.end || day <= dateRange.end);
      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [searchTerm, statusFilter, dateRange]);

  const handleOpenDetail = (record: IMedicalAccount) => {
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

            <MedicalAccountsTable data={filteredData} onOpenDetail={handleOpenDetail} />
          </CardContent>
        </Card>
      </main>

      <ModalAddMedicalAccount isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
    </>
  );
}
