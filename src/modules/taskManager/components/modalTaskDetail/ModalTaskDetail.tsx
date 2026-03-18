"use client";

import { useState, useEffect } from "react";

import { X, Mail, User, Building, FileText, Paperclip, Download, AlertCircle } from "lucide-react";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/modules/chat/ui/dialog";
import { ITask, ITaskDetail, ITaskStatus, IEmailDetails } from "@/types/tasks/ITasks";
import { TaskActionsDropdown } from "../taskActionsDropdown/TaskActionsDropdown";
import { getTaskDetails } from "@/services/tasks/tasks";

interface IModalTaskDetail {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ModalTaskDetail({ task, isOpen, onClose }: IModalTaskDetail) {
  const [taskDetail, setTaskDetail] = useState<ITaskDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Fetch task details when modal opens with a task
  useEffect(() => {
    const fetchTaskDetail = async () => {
      if ((task?.id || task?.queue_id) && isOpen) {
        setIsLoadingDetail(true);
        setDetailError(null);
        try {
          if (task.id) {
            const res = await getTaskDetails({ taskId: String(task.id) });
            setTaskDetail(res);
          } else if (task.queue_id) {
            const res = await getTaskDetails({ queueId: task.queue_id });
            setTaskDetail(res);
          }
        } catch (error) {
          console.error("Error fetching task details:", error);
          setDetailError("Failed to load task details");
        } finally {
          setIsLoadingDetail(false);
        }
      }
    };
    fetchTaskDetail();
  }, [task, isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTaskDetail(null);
      setDetailError(null);
    }
  }, [isOpen]);

  if (!task) return null;

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

  const EmailMessage = ({ emailDetails }: { emailDetails: IEmailDetails }) => {
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
              {emailDetails.details.details}
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
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-900">{attachment.file_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        className="text-xs px-2 py-0.5 rounded-full border-0"
                        style={{
                          backgroundColor: attachment.status.backgroundColor,
                          color: attachment.status.color
                        }}
                      >
                        {attachment.status.name}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => window.open(attachment.s3_url, "_blank")}
                      >
                        <Download className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getEstadoBadge = (status: ITaskStatus) => {
    return (
      <Badge
        className="border flex items-center px-3 py-1.5"
        style={{
          backgroundColor: status.backgroundColor || "#F3F4F6",
          color: status.color || "#374151"
        }}
      >
        {status.name}
      </Badge>
    );
  };

  const getTipoTareaBadge = (tipo: string) => {
    if (!tipo) return null;
    return (
      <Badge variant="outline" className="bg-white border-gray-300 text-gray-700 px-3 py-1.5">
        {tipo}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        showCloseButton={false}
        className="!w-[80vw] !max-w-[80vw] max-h-[90vh] p-0 bg-white text-cashport-black border-gray-200"
      >
        <DialogTitle className="sr-only">{task.id} details</DialogTitle>

        <div className="flex flex-col h-[90vh]">
          <div className="flex items-center justify-between px-10 py-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-cashport-black">
                TASK-{task.id ? task.id : task.queue_id ? task.queue_id : "N/A"}
              </h2>
              {taskDetail && getTipoTareaBadge(taskDetail.task_type)}
              {taskDetail && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">
                    {new Date(taskDetail.created_at).toLocaleDateString("es-CO", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <TaskActionsDropdown task={task} />
              {taskDetail && getEstadoBadge(taskDetail.status)}
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-500 hover:text-cashport-black hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden bg-gray-50">
            {isLoadingDetail ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-3" />
                  <p className="text-gray-500">Cargando detalles...</p>
                </div>
              </div>
            ) : detailError ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center py-12 text-red-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                  <p>{detailError}</p>
                </div>
              </div>
            ) : taskDetail ? (
              <div className="h-full grid grid-cols-2 gap-12">
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
                        <div className="flex items-center gap-3 px-3 py-2">
                          <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                            Cliente
                          </span>
                          <span className="flex-1 text-sm text-cashport-black px-2">
                            {taskDetail.client?.name || "—"}
                          </span>
                        </div>

                        {/* Tipo de tarea */}
                        <div className="flex items-center gap-3 px-3 py-2">
                          <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                            Tipo de tarea
                          </span>
                          <span className="flex-1 text-sm text-cashport-black px-2">
                            {taskDetail.task_type || "—"}
                          </span>
                        </div>

                        {/* Responsable */}
                        <div className="flex items-center gap-3 px-3 py-2">
                          <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                            Responsable
                          </span>
                          <span className="flex-1 text-sm text-cashport-black px-2">
                            {taskDetail.assigned_user || "—"}
                          </span>
                        </div>

                        {/* Monto */}
                        <div className="flex items-center gap-3 px-3 py-2">
                          <div className="h-4 w-4 flex-shrink-0 flex items-center justify-center text-gray-500 font-semibold text-xs">
                            $
                          </div>
                          <span className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                            Monto
                          </span>
                          <span className="flex-1 text-sm text-cashport-black px-2">
                            {taskDetail.amount != null
                              ? taskDetail.amount.toLocaleString("es-CO")
                              : "—"}
                          </span>
                        </div>

                        {/* Descripcion */}
                        <div className="flex items-start gap-3 px-3 py-2">
                          <FileText className="h-4 w-4 text-gray-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-700 w-[120px] flex-shrink-0 mt-0.5">
                            Descripcion
                          </span>
                          <p className="flex-1 text-sm text-cashport-black px-2 whitespace-pre-wrap">
                            {taskDetail.description || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Original Message */}
                <div className="overflow-y-auto px-10 py-8 border-l border-gray-200 bg-white">
                  <div className="space-y-6">
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide sticky top-0 bg-white py-2 z-10">
                      Mensaje Original
                    </h3>
                    {mockMessage ? (
                      <EmailMessage emailDetails={mockMessage} />
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
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const mockMessage: IEmailDetails = {
  details: {
    id: 1,
    email_account_id: 101,
    message_id: "msg-001",
    subject: "Factura pendiente de revisión",
    from_address: "proveedor@empresa.com",
    to_address: "cuentas@profitline.com",
    received_date: "2026-03-15T10:30:00Z",
    has_attachments: 1,
    details:
      "Adjunto la factura #4521 correspondiente al pedido de marzo. Por favor confirmar recepción.",
    created_at: "2026-03-15T10:30:00Z"
  },
  attachments: [
    {
      id: 1,
      email_id: 1,
      file_name: "Factura_4521.pdf",
      inline: 0,
      content_type: "application/pdf",
      size: 245000,
      s3_key: "attachments/mock/factura_4521.pdf",
      s3_url: "#",
      created_at: "2026-03-15T10:30:00Z",
      status: {
        id: 1,
        name: "Disponible",
        color: "#0085FF",
        backgroundColor: "#E3F2FD"
      }
    },
    {
      id: 2,
      email_id: 1,
      file_name: "Soporte_pago_marzo.xlsx",
      inline: 0,
      content_type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      size: 128000,
      s3_key: "attachments/mock/soporte_pago_marzo.xlsx",
      s3_url: "#",
      created_at: "2026-03-15T10:30:00Z",
      status: {
        id: 1,
        name: "Disponible",
        color: "#0085FF",
        backgroundColor: "#E3F2FD"
      }
    }
  ]
};
