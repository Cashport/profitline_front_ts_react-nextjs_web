"use client";

import { useEffect, useState } from "react";

import { useApprovals } from "@/hooks/useApprovals";
import { useDebounce } from "@/hooks/useDeabouce";
import {
  IApprovalItem,
  IApprovalStatusItem,
  IGetApprovalTypeActions
} from "@/types/approvals/IApprovals";

import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import ApprovalDetailModal from "@/modules/aprobaciones/components/approval-detail-modal/approval-detail-modal";
import ApprovalsStateDropdown from "../components/approvals-state-dropdown/approvalsStateDorpdown";
import ApprovalsTypeDropdown from "../components/approvals-type-dropdown/approvalsTypeDropdown";
import ApprovalsTable from "../components/approvals-table/Approvals-table";
import { getApprovalStatuses, getApprovalTypes } from "@/services/approvals/approvals";

export default function ApprovalsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<IApprovalItem>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [statusOptions, setStatusOptions] = useState<IApprovalStatusItem[]>([]);
  const [typeOptions, setTypeOptions] = useState<IGetApprovalTypeActions[]>([]);

  const {
    data,
    pagination,
    isLoading,
    mutate: mutateApprovals
  } = useApprovals({
    page,
    typeActionCode: selectedTypes.length > 0 ? selectedTypes : undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined,
    search: debouncedSearch
  });

  useEffect(() => {
    const fetchOptions = async () => {
      const statusResponse = await getApprovalStatuses();
      setStatusOptions(statusResponse.items);

      const typesResponse = await getApprovalTypes();
      setTypeOptions(typesResponse);
    };
    fetchOptions();
  }, []);

  return (
    <div className="bg-background rounded-lg">
      <main className="p-6">
        <div className="mx-auto">
          <div className="space-y-4">
            {/* Responsive flex-col on mobile, flex-row on md+ */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <OptimizedSearchComponent onSearch={setSearchQuery} title="Buscar" />

              <div className="hidden md:flex items-center gap-2">
                <GenerateActionButton onClick={() => {}} disabled={selectedIds.length === 0} />

                <ApprovalsStateDropdown
                  statusOptions={statusOptions}
                  selectedStatuses={selectedStatuses}
                  onStatusChange={(statuses) => {
                    setSelectedStatuses(statuses);
                    setPage(1);
                  }}
                />

                <ApprovalsTypeDropdown
                  typeOptions={typeOptions}
                  selectedTypes={selectedTypes}
                  onTypeChange={(types) => {
                    setSelectedTypes(types);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            <ApprovalsTable
              approvals={data}
              selectedIds={selectedIds}
              onSelectIds={setSelectedIds}
              onSelectApproval={setSelectedApproval}
              isLoading={isLoading}
              pagination={{
                current: page,
                total: pagination?.total || 0,
                onChange: setPage
              }}
            />
          </div>
        </div>
      </main>

      <ApprovalDetailModal
        approval={selectedApproval}
        onClose={() => setSelectedApproval(undefined)}
        mutateApprovals={mutateApprovals}
      />
    </div>
  );
}
