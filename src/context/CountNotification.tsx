import { create } from "zustand";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";

const POLLING_INTERVAL_MS = 60000;

let intervalId: ReturnType<typeof setInterval> | null = null;
let visibilityHandler: (() => void) | null = null;

interface NotificationStore {
  notificationCount: number;
  updateNotificationCount: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
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

const startInterval = (updateFn: () => Promise<void>) => {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(updateFn, POLLING_INTERVAL_MS);
};

const clearPollingInterval = () => {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
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
  },

  startPolling: () => {
    if (intervalId) return; // Already running, don't restart

    const { updateNotificationCount } = get();

    // Fetch immediately
    updateNotificationCount();
    startInterval(updateNotificationCount);

    // Pause/resume based on tab visibility
    if (visibilityHandler) {
      document.removeEventListener("visibilitychange", visibilityHandler);
    }

    visibilityHandler = () => {
      if (document.hidden) {
        clearPollingInterval();
      } else {
        updateNotificationCount();
        startInterval(updateNotificationCount);
      }
    };

    document.addEventListener("visibilitychange", visibilityHandler);
  },

  stopPolling: () => {
    clearPollingInterval();
    if (visibilityHandler) {
      document.removeEventListener("visibilitychange", visibilityHandler);
      visibilityHandler = null;
    }
  }
}));
