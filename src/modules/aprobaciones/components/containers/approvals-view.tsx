"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal, ListFilter } from "lucide-react";

import { useApprovals } from "@/hooks/useApprovals";
import {
  IApprovalItem,
  IApprovalStatusItem,
  IGetApprovalTypeActions
} from "@/types/approvals/IApprovals";

import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import { Button } from "@/modules/chat/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import ApprovalDetailModal from "@/modules/aprobaciones/components/approval-detail-modal";
import ApprovalsTable from "../approvals-table/Approvals-table";

import "@/modules/aprobaciones/styles/approvalsStyles.css";
import "@/modules/chat/styles/chatStyles.css";
import { getApprovalStatuses, getApprovalTypes } from "@/services/approvals/approvals";

export default function ApprovalsView() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedApproval, setSelectedApproval] = useState<IApprovalItem>();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [statusOptions, setStatusOptions] = useState<IApprovalStatusItem[]>([]);
  const [typeOptions, setTypeOptions] = useState<IGetApprovalTypeActions[]>([]);

  const { data, pagination, isLoading } = useApprovals({
    page,
    typeActionCode: selectedTypes.length > 0 ? selectedTypes : undefined,
    status: selectedStatuses.length > 0 ? selectedStatuses : undefined
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

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent !font-semibold"
                      style={{ height: "3rem" }}
                    >
                      <SlidersHorizontal className="h-4 w-4" />
                      Estados
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {statusOptions.map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status.code}
                        checked={selectedStatuses.includes(status.code)}
                        onCheckedChange={() => {
                          setSelectedStatuses((prev) =>
                            prev.includes(status.code)
                              ? prev.filter((s) => s !== status.code)
                              : [...prev, status.code]
                          );
                          setPage(1);
                        }}
                      >
                        {status.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="gap-2 bg-transparent !font-semibold"
                      style={{ height: "3rem" }}
                    >
                      <ListFilter className="h-4 w-4" />
                      Tipos
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {typeOptions.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type.code}
                        checked={selectedTypes.includes(type.code)}
                        onCheckedChange={() => {
                          setSelectedTypes((prev) =>
                            prev.includes(type.code)
                              ? prev.filter((t) => t !== type.code)
                              : [...prev, type.code]
                          );
                          setPage(1);
                        }}
                      >
                        {type.name}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
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
        onApprove={(id) => {
          console.log("Aprobar:", id);
          setSelectedApproval(undefined);
        }}
        onReject={(id) => {
          console.log("Rechazar:", id);
          setSelectedApproval(undefined);
        }}
      />
    </div>
  );
}
