"use client";

import { ReactNode, useEffect, useState } from "react";

import {
  Mail,
  Sparkles,
  User,
  Building,
  FileText,
  Paperclip,
  Download
} from "lucide-react";
import { Button as AntButton, Dropdown, Select as AntSelect, message } from "antd";
import { DotsThreeVertical, ArrowCounterClockwise } from "@phosphor-icons/react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import "./modalContent.scss";

import { Badge } from "@/modules/chat/ui/badge";
import { Label } from "@/modules/chat/ui/label";
import { Input } from "@/modules/chat/ui/input";
import { Textarea } from "@/modules/chat/ui/textarea";
import {
  ITask,
  ITaskDetail,
  ITaskStatus,
  ITaskTypes,
  IEmailAttachment,
  IEmailDetails
} from "@/types/tasks/ITasks";
import { IEcommerceClient } from "@/types/commerce/ICommerce";
import { IUser } from "@/types/users/IUser";
import { reprocessAttachmentTask } from "@/services/tasks/tasks";
import { getClients } from "@/services/commerce/commerce";
import { useAppStore } from "@/lib/store/store";

export type TaskFormValues = {
  client_id: string;
  task_type: number | null;
  assigned_to: number | null;
  status: ITaskStatus;
};

export const CASHPORT_AI_USER_ID = 999;

const ANT_SELECT_CLASS = (isEmpty: boolean) =>
  `taskDetailAntSelect${isEmpty ? " taskDetailAntSelect--empty" : ""}`;

interface IModalContentProps {
  task: ITask;
  taskDetail: ITaskDetail;
  taskTypes: ITaskTypes[];
  users: IUser[];
  usersLoading: boolean;
  onAttachmentReprocessed: () => void;
}

const formatDateTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export function ModalContent({
  task,
  taskDetail,
  taskTypes,
  users,
  usersLoading,
  onAttachmentReprocessed
}: IModalContentProps) {
  const { control, setValue, getValues } = useFormContext<TaskFormValues>();

  const clientId = useWatch({ control, name: "client_id" });
  const taskType = useWatch({ control, name: "task_type" });
  const assignedTo = useWatch({ control, name: "assigned_to" });

  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [clients, setClients] = useState<IEcommerceClient[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    setClientsLoading(true);
    getClients(projectId)
      .then((res) => {
        if (!cancelled && res?.data) setClients(res.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setClientsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  const handleAssignToAI = () => {
    const currentStatus = getValues("status");
    setValue("assigned_to", CASHPORT_AI_USER_ID);
    setValue("status", { ...currentStatus, name: "En progreso" });
  };

  const taskTypeOptions = (() => {
    const options = taskTypes.map((t) => ({ value: t.ID, label: t.NAME }));
    const knownIds = new Set(options.map((o) => o.value));
    if (
      taskType !== null &&
      taskType !== undefined &&
      !knownIds.has(taskType) &&
      taskDetail?.task_type
    ) {
      options.unshift({ value: taskType, label: taskDetail.task_type });
    }
    return options;
  })();

  const assignedUserOptions = [
    ...users.map((u) => ({ value: u.id, label: u.user_name, isAI: false })),
    { value: CASHPORT_AI_USER_ID, label: "Cashport AI", isAI: true }
  ];

  const clientOptions = clients.map((c) => ({
    value: c.client_id,
    label: c.client_name
  }));

  const EmailMessage = ({ emailDetails }: { emailDetails: IEmailDetails }) => {
    const handleReprocessAttachment = async (attachment: IEmailAttachment) => {
      const hideMessage = message.loading(`Reprocesando adjunto: ${attachment.file_name}`, 0);
      try {
        await reprocessAttachmentTask(attachment.process_id);
        message.success(`Reprocesando adjunto: ${attachment.file_name}`);
        onAttachmentReprocessed();
      } catch (error) {
        message.error(error instanceof Error ? error.message : "Error al reprocesar adjunto");
      } finally {
        hideMessage();
      }
    };

    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">
              {emailDetails.details.subject || "Sin asunto"}
            </h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
            <span className="text-gray-600 font-medium">De:</span>
            <span className="text-gray-900">{emailDetails.details.from_address}</span>
            <span className="text-gray-600 font-medium">Para:</span>
            <span className="text-gray-900">{emailDetails.details.to_address}</span>
            <span className="text-gray-600 font-medium">Fecha:</span>
            <span className="text-gray-900">
              {formatDateTime(emailDetails.details.received_date)}
            </span>
          </div>
          <div className="pt-3 border-t border-gray-200">
            <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
              {taskDetail.description}
            </p>
          </div>
          {emailDetails.attachments && emailDetails.attachments.length > 0 && (
            <div className="pt-3 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Paperclip className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Adjuntos ({emailDetails.attachments.length})
                </span>
              </div>
              <div className="space-y-2">
                {emailDetails.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between gap-2 p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 text-gray-600 flex-shrink-0" />
                      <span className="text-sm text-gray-900 truncate">
                        {attachment.file_name}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-xs text-white"
                      style={{ backgroundColor: attachment.process_status_color }}
                    >
                      {attachment.process_status_name}
                    </Badge>
                    <Dropdown
                      dropdownRender={(menu: ReactNode) => (
                        <div className="dropdownTaskDetail">{menu}</div>
                      )}
                      menu={{
                        items: [
                          {
                            key: "reprocess",
                            label: (
                              <AntButton
                                icon={<ArrowCounterClockwise size={14} />}
                                className="buttonNoBorder"
                                onClick={() => handleReprocessAttachment(attachment)}
                              >
                                Reprocesar
                              </AntButton>
                            )
                          },
                          {
                            key: "download",
                            label: (
                              <AntButton
                                icon={<Download className="h-3 w-3" />}
                                className="buttonNoBorder"
                                onClick={() => window.open(attachment.s3_url, "_blank")}
                              >
                                Descargar
                              </AntButton>
                            )
                          }
                        ]
                      }}
                      trigger={["click"]}
                      placement="bottomRight"
                      overlayStyle={{ zIndex: 10000 }}
                    >
                      <AntButton className="dotsBtn">
                        <DotsThreeVertical weight="bold" size={16} />
                      </AntButton>
                    </Dropdown>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full grid grid-cols-2">
      {/* Left Column - Task Details */}
      <div className="overflow-y-auto px-10 py-8">
        <div className="space-y-8 max-w-[700px]">
          {/* Custom Fields */}
          <div className="space-y-0">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
              Campos personalizados
            </h3>

            <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
              {/* Cliente */}
              <div
                className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!clientId ? "bg-rose-50" : ""}`}
              >
                <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                  Cliente
                  {!clientId && <span className="text-rose-600 ml-1">*</span>}
                </Label>
                <Controller
                  control={control}
                  name="client_id"
                  render={({ field }) => (
                    <AntSelect
                      showSearch
                      value={field.value || undefined}
                      onChange={(value) => field.onChange(value)}
                      onBlur={field.onBlur}
                      options={clientOptions}
                      loading={clientsLoading}
                      placeholder={clientsLoading ? "Cargando clientes..." : "Asignar cliente..."}
                      notFoundContent="No hay clientes disponibles"
                      filterOption={(input, option) =>
                        ((option?.label as string) ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      variant="borderless"
                      className={ANT_SELECT_CLASS(!field.value)}
                    />
                  )}
                />
              </div>

              {/* Tipo de tarea */}
              <div
                className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${taskType === null ? "bg-rose-50" : ""}`}
              >
                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                  Tipo de tarea
                  {taskType === null && <span className="text-rose-600 ml-1">*</span>}
                </Label>
                <Controller
                  control={control}
                  name="task_type"
                  render={({ field }) => (
                    <AntSelect
                      value={field.value ?? undefined}
                      onChange={(value) => field.onChange(value)}
                      onBlur={field.onBlur}
                      options={taskTypeOptions}
                      loading={taskTypes.length === 0}
                      disabled={taskTypes.length === 0}
                      placeholder={
                        taskTypes.length === 0 ? "Cargando tipos..." : "Seleccionar tipo..."
                      }
                      variant="borderless"
                      className={ANT_SELECT_CLASS(field.value === null || field.value === undefined)}
                    />
                  )}
                />
              </div>

              {/* Responsable */}
              <div
                className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${assignedTo === null ? "bg-rose-50" : ""}`}
              >
                <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                  Responsable
                  {assignedTo === null && <span className="text-rose-600 ml-1">*</span>}
                </Label>
                <Controller
                  control={control}
                  name="assigned_to"
                  render={({ field }) => (
                    <AntSelect
                      showSearch
                      value={field.value ?? undefined}
                      onChange={(value) => {
                        if (value === CASHPORT_AI_USER_ID) {
                          handleAssignToAI();
                        } else {
                          field.onChange(value);
                        }
                      }}
                      onBlur={field.onBlur}
                      options={assignedUserOptions}
                      loading={usersLoading}
                      placeholder={
                        usersLoading ? "Cargando responsables..." : "Asignar responsable..."
                      }
                      filterOption={(input, option) =>
                        ((option?.label as string) ?? "")
                          .toLowerCase()
                          .includes(input.toLowerCase())
                      }
                      variant="borderless"
                      className={ANT_SELECT_CLASS(field.value === null || field.value === undefined)}
                      optionRender={(option) =>
                        option.data.isAI ? (
                          <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4" />
                            {option.data.label}
                          </div>
                        ) : (
                          option.data.label
                        )
                      }
                    />
                  )}
                />
              </div>

              {/* Monto */}
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors">
                <div className="h-4 w-4 flex-shrink-0 flex items-center justify-center text-gray-500 font-semibold text-xs">
                  $
                </div>
                <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">Monto</Label>
                <Input
                  type="number"
                  value={taskDetail.amount || ""}
                  readOnly
                  disabled
                  placeholder="0"
                  className="flex-1 bg-transparent border-0 text-cashport-black placeholder:text-gray-400 h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              {/* Descripción */}
              <div className="flex items-start gap-3 px-3 py-2 hover:bg-gray-50 transition-colors">
                <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-1.5" />
                <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0 mt-1.5">
                  Descripción
                </Label>
                <Textarea
                  value={taskDetail.description || ""}
                  readOnly
                  disabled
                  placeholder="Agregar descripción..."
                  rows={2}
                  className="flex-1 bg-transparent border-0 text-cashport-black placeholder:text-gray-400 resize-none px-2 py-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </div>
          </div>

          {task.is_ai && (
            <div className="pt-4">
              <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Procesado por Cashport AI
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Original Message */}
      <div className="overflow-y-auto px-10 py-8 border-l border-gray-200 bg-white">
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide sticky top-0 bg-white py-2 z-10">
            Mensaje Original
          </h3>
          {taskDetail.emailDetails ? (
            <EmailMessage emailDetails={taskDetail.emailDetails} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>No hay mensaje original disponible</p>
              {taskDetail.description && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                  <p className="text-gray-700 text-sm">{taskDetail.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
