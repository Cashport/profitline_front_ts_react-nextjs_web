import { DotsThreeVertical } from "@phosphor-icons/react";
import { Button } from "@/modules/chat/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";

interface ChatActionItem {
  key: string;
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<any>;
  variant?: "default" | "destructive";
}

interface ChatActionsProps {
  items: ChatActionItem[];
  triggerClassName?: string;
  align?: "start" | "center" | "end";
}

export default function ChatActions({
  items,
  triggerClassName = "h-8 w-8 p-0",
  align = "end"
}: ChatActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={triggerClassName}>
          <DotsThreeVertical size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <DropdownMenuItem
              key={item.key}
              onClick={item.onClick}
              className="cursor-pointer"
            >
              {IconComponent && <IconComponent className="h-4 w-4 mr-2" />}
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
