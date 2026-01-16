"use client";

import { FC } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/modules/chat/ui/dropdown-menu";
import { Button } from "@/modules/chat/ui/button";
import { ITask } from "../tasksTable/TasksTable";

interface TaskActionsDropdownProps {
  task: ITask;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
}

export const TaskActionsDropdown: FC<TaskActionsDropdownProps> = ({
  task,
  triggerClassName = "h-8 w-8",
  align = "end"
}) => {
  const getMenuItems = () => {
    const baseItems = [
      { key: "email", icon: Mail, label: "Enviar correo" },
      { key: "call", icon: Phone, label: "Llamar" },
      { key: "whatsapp", icon: MessageSquare, label: "WhatsApp" },
      { key: "visit", icon: AlertCircle, label: "Agendar visita" },
      { key: "reconcile", icon: Clock, label: "Conciliar" },
      { key: "payment", icon: CheckCircle, label: "Aplicar pago" },
      { key: "file", icon: AlertCircle, label: "Radicar" },
      { key: "report", icon: CheckCircle, label: "Reportar pago" }
    ];

    if (task.tipoTarea === "Saldo") {
      baseItems.push({ key: "legalize", icon: CheckCircle, label: "Legalizar saldo" });
    }

    if (task.tipoTarea === "Desbloqueo") {
      baseItems.push({ key: "unlock", icon: XCircle, label: "Desbloquear pedido" });
    }

    return baseItems;
  };

  const handleMenuItemClick = (key: string) => {
    // Placeholder - no action for now
    console.log(`Action: ${key} for task ${task.id}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={triggerClassName}
          onClick={(e) => e.stopPropagation()}
          title="Acciones"
        >
          <MoreVertical className="h-4 w-4 text-gray-600" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {getMenuItems().map((item) => {
          const IconComponent = item.icon;
          return (
            <DropdownMenuItem
              key={item.key}
              onClick={(e) => {
                e.stopPropagation();
                handleMenuItemClick(item.key);
              }}
              className="hover:bg-accent hover:text-accent-foreground cursor-pointer"
            >
              <IconComponent className="h-4 w-4 mr-2" />
              {item.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
