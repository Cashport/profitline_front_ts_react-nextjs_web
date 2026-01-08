import { ListFilter } from "lucide-react";

import { IGetApprovalTypeActions } from "@/types/approvals/IApprovals";
import { Button } from "@/modules/chat/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";

interface ApprovalsTypeDropdownProps {
  typeOptions: IGetApprovalTypeActions[];
  selectedTypes: string[];
  onTypeChange: (types: string[]) => void;
}

export default function ApprovalsTypeDropdown({
  typeOptions,
  selectedTypes,
  onTypeChange
}: ApprovalsTypeDropdownProps) {
  const handleToggleType = (code: string) => {
    const newTypes = selectedTypes.includes(code)
      ? selectedTypes.filter((t) => t !== code)
      : [...selectedTypes, code];
    onTypeChange(newTypes);
  };

  return (
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
            onCheckedChange={() => handleToggleType(type.code)}
          >
            {type.name}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
