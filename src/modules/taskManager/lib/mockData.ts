import { ITask } from "@/types/tasks/ITasks";

// Note: Mock data is deprecated - using real backend data now
// This file is kept for backwards compatibility with ModalGenerateActionTaskManager

export interface ITaskStatusGroup {
  status: string;
  status_id: number;
  tasks: ITask[];
  total: number;
  count: number;
}

// Mock Data - empty as we're using real backend data
export const mockTasks: ITaskStatusGroup[] = [];
