import { IUserSlice, createUserSlice } from "@/lib/slices/createUserSlice";
import { ProjectSlice, createProjectSlice } from "@/lib/slices/createProjectSlice";
import { ICommerceSlice, createCommerceSlice } from "@/lib/slices/commerceSlice";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { formatMoneySlice, IFormatMoneyStore } from "@/lib/slices/formatMoneySlice";
import { createHidrationSlice, Hidration } from "../slices/hidratationSlice";
import { setProjectInApi } from "@/utils/api/api";
import { IProvidersViewStore, providersViewSlice } from "../slices/providersViewSlice";

interface AppStore
  extends ProjectSlice,
    IUserSlice,
    ICommerceSlice,
    IFormatMoneyStore,
    Hidration,
    IProvidersViewStore {
  resetStore: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...createUserSlice(set),
      ...createProjectSlice(set),
      ...createCommerceSlice(set),
      ...formatMoneySlice(set, get),
      ...createHidrationSlice(set),
      ...providersViewSlice(set),
      resetStore: () => {
        // Clear the session storage
        localStorage.removeItem("project");
        // Reset the Zustand store to initial state
        set({
          ...createUserSlice(set),
          ...createProjectSlice(set),
          ...createCommerceSlice(set),
          ...formatMoneySlice(set, get),
          ...createHidrationSlice(set),
          ...providersViewSlice(set)
        });
      }
    }),
    {
      name: "project",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state, error) => {
        if (error) console.error(error);
        if (state) state.setHydrated();
        setProjectInApi(state?.selectedProject?.ID || 0);
      }
    }
  )
);
