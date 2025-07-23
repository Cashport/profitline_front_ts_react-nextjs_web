import { create } from "zustand";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

interface NotificationStore {
  notificationCount: number;
  updateNotificationCount: () => Promise<void>;
}

const getSelectedProjectId = (): number | null => {
  try {
    const projectId = sessionStorage.getItem("projectId");
    if (projectId) {
      return parseInt(projectId, 10);
    }
  } catch (error) {
    console.error("Error getting project ID from sessionStorage", error);
  }
  return null;
};

export const useNotificationStore = create<NotificationStore>((set) => ({
  notificationCount: 0,
  updateNotificationCount: async () => {
    const projectId = getSelectedProjectId();
    if (projectId !== null) {
      try {
        const response: GenericResponse<number> = await API.get(
          `/notification/count/project/${projectId}/user`
        );
        set({ notificationCount: response.data });
      } catch (error) {
        console.error("Error fetching notification count:", error);
      }
    }
  }
}));
