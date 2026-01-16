"use client";

import { useState, useEffect } from "react";

import {
  X,
  Mail,
  Sparkles,
  User,
  Building,
  FileText,
  Paperclip,
  CheckCircle,
  Clock,
  XCircle,
  Download,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Label } from "@/modules/chat/ui/label";
import { Input } from "@/modules/chat/ui/input";
import { Textarea } from "@/modules/chat/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/modules/chat/ui/dialog";
import { ITask, ITaskDetail } from "@/types/tasks/ITasks";
import { TaskActionsDropdown } from "../taskActionsDropdown/TaskActionsDropdown";
import { getTaskDetails } from "@/services/tasks/tasks";

interface IModalTaskDetail {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (task: ITask) => void;
}

export function ModalTaskDetail({ task, isOpen, onClose, onUpdate }: IModalTaskDetail) {
  const [editedTask, setEditedTask] = useState<ITask | null>(task);
  const [taskDetail, setTaskDetail] = useState<ITaskDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Fetch task details when modal opens with a task
  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (task?.id && isOpen) {
        setIsLoadingDetail(true);
        setDetailError(null);
        try {
          const res = await getTaskDetails({ taskId: String(task.id) });
          setTaskDetail(res);
          console.log("Fetched task details:", res);
        } catch (error) {
          console.error("Error fetching task details:", error);
          setDetailError("Failed to load task details");
        } finally {
          setIsLoadingDetail(false);
        }
      }
    };
    fetchTaskDetail();
  }, [task?.id, isOpen]);

  // Sync editedTask with incoming task prop
  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTaskDetail(null);
      setDetailError(null);
    }
  }, [isOpen]);

  if (!task || !editedTask) return null;

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

  const EmailMessage = () => {
    const emailDetails = taskDetail?.emailDetails;

    if (!emailDetails) {
      return (
        <div className="text-center py-8 text-gray-500">
          <Mail className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>No hay detalles de correo disponibles</p>
        </div>
      );
    }

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
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-900">{attachment.file_name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => window.open(attachment.s3_url, '_blank')}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const getEstadoBadge = (estado: string) => {
    const configs = {
      Completado: { icon: CheckCircle, color: "bg-green-100 text-green-700 border-green-200" },
      "En progreso": { icon: Clock, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      Novedad: { icon: Clock, color: "bg-blue-100 text-blue-700 border-blue-200" },
      "Pend. Revisión": { icon: Clock, color: "bg-orange-100 text-orange-700 border-orange-200" },
      "En aprobaciones": { icon: Clock, color: "bg-purple-100 text-purple-700 border-purple-200" },
      "Sin empezar": { icon: Clock, color: "bg-gray-100 text-gray-700 border-gray-200" },
      Cancelado: { icon: XCircle, color: "bg-red-100 text-red-700 border-red-200" },
      Spam: { icon: XCircle, color: "bg-gray-100 text-gray-600 border-gray-200" }
    };
    const config = configs[estado as keyof typeof configs] || configs["Sin empezar"];
    const Icon = config.icon;
    return (
      <Badge className={`${config.color} border flex items-center gap-1.5 px-3 py-1.5`}>
        <Icon className="h-3.5 w-3.5" />
        {estado}
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

  const handleAssignToAI = () => {
    if (onUpdate && editedTask) {
      const updatedTask = {
        ...editedTask,
        user_name: "Cashport AI",
        is_ai: true,
        status: {
          ...editedTask.status,
          name: "En progreso"
        }
      };
      onUpdate(updatedTask);
    }
    onClose();
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
              <h2 className="text-2xl font-semibold text-cashport-black">TASK-{task.id}</h2>
              {getTipoTareaBadge(task.task_type)}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                <Mail className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(task.created_at).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TaskActionsDropdown task={task} />
              {getEstadoBadge(editedTask.status?.name || "")}
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
                      <div
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!editedTask.client_name ? "bg-rose-50" : ""}`}
                      >
                        <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Cliente
                          {!editedTask.client_name && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Input
                          value={editedTask.client_name || ""}
                          onChange={(e) =>
                            setEditedTask({ ...editedTask, client_name: e.target.value || null })
                          }
                          placeholder="Asignar cliente..."
                          className={`flex-1 bg-transparent border-0 text-cashport-black placeholder:text-gray-400 h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                            !editedTask.client_name ? "placeholder:text-rose-400" : ""
                          }`}
                        />
                      </div>

                      {/* Tipo de tarea */}
                      <div
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!editedTask.task_type ? "bg-rose-50" : ""}`}
                      >
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Tipo de tarea
                          {!editedTask.task_type && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Select
                          value={editedTask.task_type || ""}
                          onValueChange={(value) =>
                            setEditedTask({ ...editedTask, task_type: value })
                          }
                        >
                          <SelectTrigger
                            className={`flex-1 bg-transparent border-0 text-cashport-black h-8 px-2 focus:ring-0 focus:ring-offset-0 ${
                              !editedTask.task_type ? "text-rose-600" : ""
                            }`}
                          >
                            <SelectValue placeholder="Seleccionar tipo..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="Desbloqueo">Desbloqueo</SelectItem>
                            <SelectItem value="Aprobación">Aprobación</SelectItem>
                            <SelectItem value="Aplicación pago">Aplicación pago</SelectItem>
                            <SelectItem value="Conciliación">Conciliación</SelectItem>
                            <SelectItem value="Novedad">Novedad</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Responsable */}
                      <div
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!editedTask.user_name ? "bg-rose-50" : ""}`}
                      >
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Responsable
                          {!editedTask.user_name && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Select
                          value={editedTask.user_name || ""}
                          onValueChange={(value) => {
                            if (value === "Cashport AI") {
                              handleAssignToAI();
                            } else {
                              setEditedTask({ ...editedTask, user_name: value, is_ai: false });
                            }
                          }}
                        >
                          <SelectTrigger
                            className={`flex-1 bg-transparent border-0 text-cashport-black h-8 px-2 focus:ring-0 focus:ring-offset-0 ${
                              !editedTask.user_name ? "text-rose-600" : ""
                            }`}
                          >
                            <SelectValue placeholder="Asignar responsable..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            <SelectItem value="Yanin Perez">Yanin Perez</SelectItem>
                            <SelectItem value="Maria Rodriguez">Maria Rodriguez</SelectItem>
                            <SelectItem value="Carlos Mendez">Carlos Mendez</SelectItem>
                            <SelectItem value="Ana Gutierrez">Ana Gutierrez</SelectItem>
                            <SelectItem value="Cashport AI">
                              <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4" />
                                Cashport AI
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Monto */}
                      <div className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors">
                        <div className="h-4 w-4 flex-shrink-0 flex items-center justify-center text-gray-500 font-semibold text-xs">
                          $
                        </div>
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Monto
                        </Label>
                        <Input
                          type="number"
                          value={editedTask.amount || ""}
                          onChange={(e) =>
                            setEditedTask({ ...editedTask, amount: Number(e.target.value) })
                          }
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
                          value={editedTask.description || ""}
                          onChange={(e) =>
                            setEditedTask({ ...editedTask, description: e.target.value })
                          }
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
                  {isLoadingDetail ? (
                    <div className="text-center py-12">
                      <div className="animate-spin h-8 w-8 border-4 border-gray-300 border-t-blue-600 rounded-full mx-auto mb-3" />
                      <p className="text-gray-500">Cargando detalles...</p>
                    </div>
                  ) : detailError ? (
                    <div className="text-center py-12 text-red-500">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                      <p>{detailError}</p>
                    </div>
                  ) : taskDetail?.emailDetails ? (
                    <EmailMessage />
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>No hay mensaje original disponible</p>
                      {taskDetail?.description && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
                          <p className="text-gray-700 text-sm">{taskDetail.description}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-10 py-6 border-t border-gray-200 bg-white flex-shrink-0">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-cashport-black bg-transparent px-6 py-2.5"
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (onUpdate && editedTask) {
                  onUpdate(editedTask);
                }
                onClose();
              }}
              className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black font-semibold px-6 py-2.5"
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
