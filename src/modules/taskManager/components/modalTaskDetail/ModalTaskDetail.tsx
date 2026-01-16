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
import { ITask, ITaskDetail, ITaskTypes, ITaskStatus } from "@/types/tasks/ITasks";
import { TaskActionsDropdown } from "../taskActionsDropdown/TaskActionsDropdown";
import { getTaskDetails, getTaskTypes } from "@/services/tasks/tasks";

interface IModalTaskDetail {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (task: ITask) => void;
}

export function ModalTaskDetail({ task, isOpen, onClose, onUpdate }: IModalTaskDetail) {
  const [taskDetail, setTaskDetail] = useState<ITaskDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [taskTypes, setTaskTypes] = useState<ITaskTypes[]>([]);
  const [isLoadingTaskTypes, setIsLoadingTaskTypes] = useState(false);
  const [taskTypesError, setTaskTypesError] = useState<string | null>(null);

  // Fetch task details when modal opens with a task
  useEffect(() => {
    const fetchTaskDetail = async () => {
      if (task?.id && isOpen) {
        setIsLoadingDetail(true);
        setDetailError(null);
        try {
          const res = await getTaskDetails({ taskId: String(task.id) });
          setTaskDetail(res);
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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTaskDetail(null);
      setDetailError(null);
    }
  }, [isOpen]);

  // Fetch task types when modal opens
  useEffect(() => {
    const fetchTaskTypes = async () => {
      if (isOpen && taskTypes.length === 0) {
        setIsLoadingTaskTypes(true);
        setTaskTypesError(null);
        try {
          const types = await getTaskTypes();
          setTaskTypes(types);
        } catch (error) {
          console.error("Error fetching task types:", error);
          setTaskTypesError("Failed to load task types");
        } finally {
          setIsLoadingTaskTypes(false);
        }
      }
    };
    fetchTaskTypes();
  }, [isOpen, taskTypes.length]);

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
                      onClick={() => window.open(attachment.s3_url, "_blank")}
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

  const getEstadoBadge = (status: ITaskStatus) => {
    return (
      <Badge
        className="border flex items-center px-3 py-1.5"
        style={{
          backgroundColor: status.backgroundColor || '#F3F4F6',
          color: status.color || '#374151'
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

  const handleAssignToAI = () => {
    if (taskDetail) {
      setTaskDetail({
        ...taskDetail,
        assigned_user: "Cashport AI",
        status: {
          ...taskDetail.status,
          name: "En progreso"
        }
      });
    }
  };

  const getTaskTypeOptions = (): { value: string; label: string }[] => {
    const options: { value: string; label: string }[] = [];
    const seenValues = new Set<string>();

    // Add current value first if it exists
    if (taskDetail?.task_type && taskDetail.task_type.trim()) {
      options.push({ value: taskDetail.task_type, label: taskDetail.task_type });
      seenValues.add(taskDetail.task_type);
    }

    // Add API options
    taskTypes.forEach((type) => {
      if (!seenValues.has(type.NAME)) {
        options.push({ value: type.NAME, label: type.NAME });
        seenValues.add(type.NAME);
      }
    });

    return options;
  };

  const getAssignedUserOptions = (): { value: string; label: string; isAI?: boolean }[] => {
    const STATIC_USERS = [
      { value: "Yanin Perez", label: "Yanin Perez" },
      { value: "Maria Rodriguez", label: "Maria Rodriguez" },
      { value: "Carlos Mendez", label: "Carlos Mendez" },
      { value: "Ana Gutierrez", label: "Ana Gutierrez" },
      { value: "Cashport AI", label: "Cashport AI", isAI: true }
    ];

    const options = [...STATIC_USERS];
    const existingValues = new Set(STATIC_USERS.map((u) => u.value));

    // Add current user if not in static list (insert before "Cashport AI")
    if (
      taskDetail?.assigned_user &&
      taskDetail.assigned_user.trim() &&
      !existingValues.has(taskDetail.assigned_user)
    ) {
      options.splice(options.length - 1, 0, {
        value: taskDetail.assigned_user,
        label: taskDetail.assigned_user
      });
    }

    return options;
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
                      <div
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!taskDetail?.client?.name ? "bg-rose-50" : ""}`}
                      >
                        <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Cliente
                          {!taskDetail?.client?.name && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Input
                          value={taskDetail?.client?.name || ""}
                          onChange={(e) =>
                            taskDetail &&
                            setTaskDetail({
                              ...taskDetail,
                              client: { ...taskDetail.client, name: e.target.value }
                            })
                          }
                          placeholder="Asignar cliente..."
                          className={`flex-1 bg-transparent border-0 text-cashport-black placeholder:text-gray-400 h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                            !taskDetail?.client?.name ? "placeholder:text-rose-400" : ""
                          }`}
                        />
                      </div>

                      {/* Tipo de tarea */}
                      <div
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!taskDetail?.task_type ? "bg-rose-50" : ""}`}
                      >
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Tipo de tarea
                          {!taskDetail?.task_type && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Select
                          value={taskDetail?.task_type || ""}
                          onValueChange={(value) =>
                            taskDetail && setTaskDetail({ ...taskDetail, task_type: value })
                          }
                          disabled={isLoadingTaskTypes}
                        >
                          <SelectTrigger
                            className={`flex-1 bg-transparent border-0 text-cashport-black h-8 px-2 focus:ring-0 focus:ring-offset-0 ${
                              !taskDetail?.task_type ? "text-rose-600" : ""
                            } ${isLoadingTaskTypes ? "opacity-50 cursor-wait" : ""}`}
                          >
                            <SelectValue
                              placeholder={
                                isLoadingTaskTypes
                                  ? "Cargando tipos..."
                                  : taskTypesError
                                  ? "Error al cargar tipos"
                                  : "Seleccionar tipo..."
                              }
                            />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            {taskTypesError ? (
                              <div className="px-2 py-1.5 text-xs text-red-600">
                                {taskTypesError}
                              </div>
                            ) : (
                              getTaskTypeOptions().map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Responsable */}
                      <div
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!taskDetail?.assigned_user ? "bg-rose-50" : ""}`}
                      >
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Responsable
                          {!taskDetail?.assigned_user && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Select
                          value={taskDetail?.assigned_user || ""}
                          onValueChange={(value) => {
                            if (value === "Cashport AI") {
                              handleAssignToAI();
                            } else if (taskDetail) {
                              setTaskDetail({ ...taskDetail, assigned_user: value });
                            }
                          }}
                        >
                          <SelectTrigger
                            className={`flex-1 bg-transparent border-0 text-cashport-black h-8 px-2 focus:ring-0 focus:ring-offset-0 ${
                              !taskDetail?.assigned_user ? "text-rose-600" : ""
                            }`}
                          >
                            <SelectValue placeholder="Asignar responsable..." />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-200">
                            {getAssignedUserOptions().map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.isAI ? (
                                  <div className="flex items-center gap-2">
                                    <Sparkles className="h-4 w-4" />
                                    {option.label}
                                  </div>
                                ) : (
                                  option.label
                                )}
                              </SelectItem>
                            ))}
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
                          value={taskDetail?.amount || ""}
                          onChange={(e) =>
                            taskDetail &&
                            setTaskDetail({ ...taskDetail, amount: Number(e.target.value) })
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
                          value={taskDetail?.description || ""}
                          onChange={(e) =>
                            taskDetail &&
                            setTaskDetail({ ...taskDetail, description: e.target.value })
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
                    {taskDetail.emailDetails ? (
                      <EmailMessage />
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
                if (onUpdate && taskDetail) {
                  // Transform taskDetail (ITaskDetail) to ITask format
                  const updatedTask: ITask = {
                    ...task,
                    description: taskDetail.description,
                    status: taskDetail.status,
                    task_type: taskDetail.task_type,
                    client_name: taskDetail.client.name,
                    client_uuid: taskDetail.client.uuid,
                    id_client: taskDetail.client.id,
                    user_name: taskDetail.assigned_user,
                    amount: taskDetail.amount,
                    is_ai: taskDetail.assigned_user === "Cashport AI",
                    created_at: taskDetail.created_at
                  };
                  onUpdate(updatedTask);
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
