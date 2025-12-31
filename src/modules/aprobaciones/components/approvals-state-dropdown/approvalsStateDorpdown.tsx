import { SlidersHorizontal } from "lucide-react";

import { IApprovalStatusItem } from "@/types/approvals/IApprovals";
import { Button } from "@/modules/chat/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";

interface ApprovalsStateDropdownProps {
  statusOptions: IApprovalStatusItem[];
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

export default function ApprovalsStateDropdown({
  statusOptions,
  selectedStatuses,
  onStatusChange
}: ApprovalsStateDropdownProps) {
  const handleToggleStatus = (code: string) => {
    const newStatuses = selectedStatuses.includes(code)
      ? selectedStatuses.filter((s) => s !== code)
      : [...selectedStatuses, code];
    onStatusChange(newStatuses);
  };

  return (
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
            onCheckedChange={() => handleToggleStatus(status.code)}
          >
            {status.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
