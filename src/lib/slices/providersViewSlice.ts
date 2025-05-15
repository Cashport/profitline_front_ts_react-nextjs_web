/* eslint-disable no-unused-vars */

export enum TabsEnum {
  Clients = "clients",
  Providers = "providers"
}

export interface IProvidersViewStore {
  activeTab: TabsEnum;
  setActiveTab: (tab: TabsEnum) => void;
}

export const providersViewSlice = (set: any): IProvidersViewStore => {
  return {
    activeTab: TabsEnum.Clients,
    setActiveTab: (tab: TabsEnum) => set((state: any) => ({ ...state, activeTab: tab }))
  };
};
