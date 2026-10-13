"use client";

import { FC, useState } from "react";
import {
  // Mail,
  // Phone,
  // MessageSquare,
  // AlertCircle,
  // Clock,
  // CheckCircle,
  // XCircle,
  Pencil,
  MoreVertical
} from "lucide-react";
import { Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import { ITask } from "@/types/tasks/ITasks";
import { ModalChangeTaskStatus } from "../ModalChangeTaskStatus/ModalChangeTaskStatus";

interface TaskActionsDropdownProps {
  task: ITask;
  triggerClassName?: string;
  align?: "start" | "center" | "end";
  onStatusChanged?: () => void;
}

const alignToPlacement = {
  start: "bottomLeft",
  center: "bottom",
  end: "bottomRight"
} as const;

export const TaskActionsDropdown: FC<TaskActionsDropdownProps> = ({
  task,
  triggerClassName = "h-8 w-8",
  align = "end",
  onStatusChanged
}) => {
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  // const getMenuItems = () => {
  //   const baseItems = [
  //     { key: "email", icon: Mail, label: "Enviar correo" },
  //     { key: "call", icon: Phone, label: "Llamar" },
  //     { key: "whatsapp", icon: MessageSquare, label: "WhatsApp" },
  //     { key: "visit", icon: AlertCircle, label: "Agendar visita" },
  //     { key: "reconcile", icon: Clock, label: "Conciliar" },
  //     { key: "payment", icon: CheckCircle, label: "Aplicar pago" },
  //     { key: "file", icon: AlertCircle, label: "Radicar" },
  //     { key: "report", icon: CheckCircle, label: "Reportar pago" }
  //   ];

  //   if (task.task_type === "Saldo") {
  //     baseItems.push({ key: "legalize", icon: CheckCircle, label: "Legalizar saldo" });
  //   }

  //   if (task.task_type === "Desbloqueo") {
  //     baseItems.push({ key: "unlock", icon: XCircle, label: "Desbloquear pedido" });
  //   }

  //   return baseItems;
  // };

  // const handleMenuItemClick = (key: string) => {
  //   // Placeholder - no action for now
  //   console.log(`Action: ${key} for task ${task.id}`);
  // };

  const items: MenuProps["items"] = [
    {
      key: "edit",
      icon: <Pencil className="h-4 w-4" />,
      label: "Cambiar estado",
      disabled: task.id === null,
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setIsStatusModalOpen(true);
      }
    }
  ];

  return (
    <>
      <Dropdown
        menu={{ items }}
        trigger={["click"]}
        placement={alignToPlacement[align]}
      >
        <Button
          type="text"
          className={triggerClassName}
          onClick={(e) => e.stopPropagation()}
          title="Acciones"
          icon={<MoreVertical className="h-4 w-4 text-gray-600" />}
        />
      </Dropdown>

      {task.id !== null && (
        <ModalChangeTaskStatus
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          taskId={task.id}
          onSuccess={onStatusChanged}
        />
      )}
    </>
  );
};
