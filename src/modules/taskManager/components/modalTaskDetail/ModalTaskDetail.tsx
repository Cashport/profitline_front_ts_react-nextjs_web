"use client";

import { useState, useEffect } from "react";

import {
  X,
  Mail,
  MessageCircle,
  ShoppingBag,
  UserPlus,
  Sparkles,
  User,
  Building,
  FileText,
  Paperclip,
  CheckCircle,
  Clock,
  XCircle,
  Download
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
import { Dialog, DialogContent } from "@/modules/chat/ui/dialog";
import { ITask } from "@/modules/taskManager/components/tasksTable/TasksTable";
import { TaskActionsDropdown } from "../taskActionsDropdown/TaskActionsDropdown";

// Extend ITask with additional fields for the detail modal
export interface InvoiceData extends ITask {
  fechaCreacion: string;
  mensajeOriginal?: string;
  emailSubject?: string;
  emailFrom?: string;
  emailTo?: string;
  emailDate?: string;
  adjuntos?: string[];
}

interface IModalTaskDetail {
  task: InvoiceData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: (task: InvoiceData) => void;
}

export function ModalTaskDetail({ task, isOpen, onClose, onUpdate }: IModalTaskDetail) {
  const [editedTask, setEditedTask] = useState<InvoiceData | null>(task);

  useEffect(() => {
    if (task) {
      setEditedTask(task);
    }
  }, [task]);

  if (!task || !editedTask) return null;

  const getOrigenIcon = (origen: string) => {
    switch (origen) {
      case "Correo":
        return <Mail className="h-4 w-4" />;
      case "WhatsApp":
        return <MessageCircle className="h-4 w-4" />;
      case "Marketplace":
        return <ShoppingBag className="h-4 w-4" />;
      case "Cliente nuevo":
        return <UserPlus className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case "Completado":
        return <CheckCircle className="h-4 w-4" />;
      case "En progreso":
        return <Clock className="h-4 w-4" />;
      case "Cancelado":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

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

  const EmailMessage = () => (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">{task.emailSubject || "Sin asunto"}</h3>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
          <span className="text-gray-600 font-medium">De:</span>
          <span className="text-gray-900">{task.emailFrom || "Desconocido"}</span>
          <span className="text-gray-600 font-medium">Para:</span>
          <span className="text-gray-900">{task.emailTo || "soporte@cashport.com"}</span>
          <span className="text-gray-600 font-medium">Fecha:</span>
          <span className="text-gray-900">
            {task.emailDate ? formatDateTime(task.emailDate) : "N/A"}
          </span>
        </div>
        <div className="pt-3 border-t border-gray-200">
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
            {task.mensajeOriginal}
          </p>
        </div>
        {task.adjuntos && task.adjuntos.length > 0 && (
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Paperclip className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Adjuntos ({task.adjuntos.length})
              </span>
            </div>
            <div className="space-y-2">
              {task.adjuntos.map((adjunto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-900">{adjunto}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 px-2">
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

  const WhatsAppMessage = () => (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg rounded-tl-none shadow-sm border border-green-200">
        <MessageCircle className="h-5 w-5 text-green-600" />
        <span className="font-semibold text-green-900">Mensaje de WhatsApp</span>
      </div>
      <div className="flex justify-start">
        <div className="max-w-[85%] bg-white rounded-lg rounded-tl-none shadow-sm border border-gray-200 p-4">
          <p className="text-gray-900 text-sm leading-relaxed whitespace-pre-wrap mb-2">
            {task.mensajeOriginal}
          </p>
          <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
            <span>
              {task.emailDate
                ? new Date(task.emailDate).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : ""}
            </span>
          </div>
        </div>
      </div>
      {task.cliente && (
        <div className="px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-xs text-gray-600 mb-1">Contacto</div>
          <div className="font-medium text-gray-900">{task.cliente}</div>
        </div>
      )}
    </div>
  );

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
        responsable: "Cashport AI",
        isAI: true,
        estado: "En progreso" as const
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
        <div className="flex flex-col h-[90vh]">
          <div className="flex items-center justify-between px-10 py-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-cashport-black">{task.id}</h2>
              {getTipoTareaBadge(task.tipoTarea)}
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg">
                {getOrigenIcon(task.origen)}
                <span className="text-sm text-gray-600">
                  {new Date(task.fechaCreacion).toLocaleDateString("es-CO", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                  })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <TaskActionsDropdown task={task} />
              {getEstadoBadge(editedTask.estado)}
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
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!editedTask.cliente ? "bg-rose-50" : ""}`}
                      >
                        <Building className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Cliente
                          {!editedTask.cliente && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Input
                          value={editedTask.cliente || ""}
                          onChange={(e) =>
                            setEditedTask({ ...editedTask, cliente: e.target.value })
                          }
                          placeholder="Asignar cliente..."
                          className={`flex-1 bg-transparent border-0 text-cashport-black placeholder:text-gray-400 h-8 px-2 focus-visible:ring-0 focus-visible:ring-offset-0 ${
                            !editedTask.cliente ? "placeholder:text-rose-400" : ""
                          }`}
                        />
                      </div>

                      {/* Tipo de tarea */}
                      <div
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!editedTask.tipoTarea ? "bg-rose-50" : ""}`}
                      >
                        <FileText className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Tipo de tarea
                          {!editedTask.tipoTarea && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Select
                          value={editedTask.tipoTarea || ""}
                          onValueChange={(value) =>
                            setEditedTask({ ...editedTask, tipoTarea: value })
                          }
                        >
                          <SelectTrigger
                            className={`flex-1 bg-transparent border-0 text-cashport-black h-8 px-2 focus:ring-0 focus:ring-offset-0 ${
                              !editedTask.tipoTarea ? "text-rose-600" : ""
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
                        className={`flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors ${!editedTask.responsable ? "bg-rose-50" : ""}`}
                      >
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <Label className="text-sm text-gray-700 w-[120px] flex-shrink-0">
                          Responsable
                          {!editedTask.responsable && <span className="text-rose-600 ml-1">*</span>}
                        </Label>
                        <Select
                          value={editedTask.responsable || ""}
                          onValueChange={(value) => {
                            if (value === "Cashport AI") {
                              handleAssignToAI();
                            } else {
                              const isAI = false;
                              setEditedTask({ ...editedTask, responsable: value, isAI });
                            }
                          }}
                        >
                          <SelectTrigger
                            className={`flex-1 bg-transparent border-0 text-cashport-black h-8 px-2 focus:ring-0 focus:ring-offset-0 ${
                              !editedTask.responsable ? "text-rose-600" : ""
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
                          value={editedTask.monto || ""}
                          onChange={(e) =>
                            setEditedTask({ ...editedTask, monto: Number(e.target.value) })
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
                          value={editedTask.descripcion || ""}
                          onChange={(e) =>
                            setEditedTask({ ...editedTask, descripcion: e.target.value })
                          }
                          placeholder="Agregar descripción..."
                          rows={2}
                          className="flex-1 bg-transparent border-0 text-cashport-black placeholder:text-gray-400 resize-none px-2 py-1 focus-visible:ring-0 focus-visible:ring-offset-0"
                        />
                      </div>
                    </div>
                  </div>

                  {task.isAI && (
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
                  {task.mensajeOriginal ? (
                    task.origen === "Correo" ? (
                      <EmailMessage />
                    ) : task.origen === "WhatsApp" ? (
                      <WhatsAppMessage />
                    ) : (
                      <div className="p-6 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                          {task.mensajeOriginal}
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Mail className="h-16 w-16 mx-auto mb-4 opacity-30" />
                      <p>No hay mensaje original disponible</p>
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

// Mock data for testing
export const mockTaskDetail: InvoiceData = {
  id: "TASK-001",
  cliente: "Comercializadora ABC S.A.S",
  comprador: "Juan Perez",
  tipoTarea: "Aplicacion pago",
  descripcion: "Revisar aplicacion de pago pendiente para factura FV-2024-001",
  estado: "Pendiente",
  responsable: "Maria Rodriguez",
  vendedor: "Carlos Mendez",
  monto: 15500000,
  origen: "Correo",
  isAI: false,
  tab: "1",
  fechaCreacion: "2024-01-15T10:30:00",
  mensajeOriginal:
    "Buenos dias,\n\nPor favor revisar la aplicacion del pago realizado el dia de ayer por transferencia bancaria.\n\nEl monto transferido fue de $15.500.000 COP correspondiente a la factura FV-2024-001.\n\nAdjunto comprobante de pago y copia de la factura para su verificacion.\n\nQuedo atenta a su confirmacion.\n\nSaludos cordiales,\nAna Maria Gonzalez\nComercializadora ABC S.A.S",
  emailSubject: "Solicitud aplicacion de pago - Factura FV-2024-001",
  emailFrom: "ana.gonzalez@comercializadora-abc.com",
  emailTo: "soporte@cashport.com",
  emailDate: "2024-01-15T10:30:00",
  adjuntos: ["comprobante_pago_15012024.pdf", "factura_FV-2024-001.pdf"]
};
