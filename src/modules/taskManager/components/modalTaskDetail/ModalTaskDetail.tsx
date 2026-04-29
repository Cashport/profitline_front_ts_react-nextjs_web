"use client";

import { useState, useEffect } from "react";

import { X, Mail, AlertCircle } from "lucide-react";
import { Modal } from "antd";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import "./modalTaskDetail.scss";

import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { ITask, ITaskDetail, ITaskTypes, ITaskStatus } from "@/types/tasks/ITasks";
import { TaskActionsDropdown } from "../taskActionsDropdown/TaskActionsDropdown";
import { getTaskDetails } from "@/services/tasks/tasks";

import { ModalContent, STATIC_USERS, TaskFormValues } from "./ModalContent";

interface IModalTaskDetail {
  task: ITask | null;
  isOpen: boolean;
  onClose: () => void;
  taskTypes: ITaskTypes[];
}

const DEFAULT_STATUS: ITaskStatus = { id: "", name: "", color: "", backgroundColor: "" };

export function ModalTaskDetail({ task, isOpen, onClose, taskTypes }: IModalTaskDetail) {
  const [taskDetail, setTaskDetail] = useState<ITaskDetail | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const formMethods = useForm<TaskFormValues>({
    defaultValues: {
      client_id: "",
      task_type: null,
      assigned_to: null,
      status: DEFAULT_STATUS
    }
  });
  const { control, handleSubmit, reset } = formMethods;

  const watchedTaskType = useWatch({ control, name: "task_type" });
  const watchedStatus = useWatch({ control, name: "status" });
  const watchedTaskTypeLabel =
    taskTypes.find((t) => t.ID === watchedTaskType)?.NAME ?? "";

  const fetchTaskDetail = async () => {
    if ((task?.id || task?.queue_id) && isOpen) {
      setIsLoadingDetail(true);
      setDetailError(null);
      try {
        let res: ITaskDetail | undefined;
        if (task.id) {
          res = await getTaskDetails({ taskId: String(task.id) });
        } else if (task.queue_id) {
          res = await getTaskDetails({ queueId: task.queue_id });
        }
        if (res) {
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

  useEffect(() => {
    fetchTaskDetail();
  }, [task, isOpen]);

  useEffect(() => {
    if (!taskDetail) return;
    const matchedTaskType = taskTypes.find((t) => t.NAME === taskDetail.task_type);
    const matchedUser = STATIC_USERS.find((u) => u.name === taskDetail.assigned_user);
    reset({
      client_id: taskDetail.client.id ?? "",
      task_type: matchedTaskType ? matchedTaskType.ID : taskDetail.task_type ? -1 : null,
      assigned_to: matchedUser ? matchedUser.id : null,
      status: taskDetail.status
    });
  }, [taskDetail, taskTypes, reset]);

  useEffect(() => {
    if (!isOpen) {
      setTaskDetail(null);
      setDetailError(null);
      reset();
    }
  }, [isOpen, reset]);

  if (!task) return null;

  const getEstadoBadge = (status: ITaskStatus) => (
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

  const getTipoTareaBadge = (tipo: string) => {
    if (!tipo) return null;
    return (
      <Badge variant="outline" className="bg-white border-gray-300 text-gray-700 px-3 py-1.5">
        {tipo}
      </Badge>
    );
  };

  const onSubmit = (_values: TaskFormValues) => {
    console.log("Form submitted with values:", _values);
    // onClose();
  };

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      closable={false}
      width="80vw"
      centered
      destroyOnClose
      styles={{ body: { padding: 0 } }}
      className="modalTaskDetail"
    >
      <FormProvider {...formMethods}>
        <div className="flex flex-col" style={{ height: "90vh", borderRadius: "8px" }}>
          <div className="flex items-center justify-between px-10 py-6 border-b border-gray-200 bg-gray-50 flex-shrink-0 rounded-t-lg">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold text-cashport-black">
                TASK-{task.id ? task.id : task.queue_id ? task.queue_id : "N/A"}
              </h2>
              {taskDetail && getTipoTareaBadge(watchedTaskTypeLabel)}
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
              {taskDetail && getEstadoBadge(watchedStatus)}
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
              <ModalContent
                task={task}
                taskDetail={taskDetail}
                taskTypes={taskTypes}
                onAttachmentReprocessed={fetchTaskDetail}
              />
            ) : null}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-10 py-6 border-t border-gray-200 bg-white flex-shrink-0 rounded-b-lg">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-cashport-black bg-transparent px-6 py-2.5"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              className="bg-cashport-green hover:bg-cashport-green/90 text-cashport-black font-semibold px-6 py-2.5"
            >
              Guardar cambios
            </Button>
          </div>
        </div>
      </FormProvider>
    </Modal>
  );
}
