export interface IMarketplaceConfigSlice {
  config: {
    include_iva: boolean;
    create_client_btn: boolean;
    projectId: number;
  };
  // eslint-disable-next-line no-unused-vars
  setConfig: (config: {
    include_iva: boolean;
    create_client_btn: boolean;
    projectId: number;
  }) => void;
}

export const createMarketplaceConfigSlice = (set: any): IMarketplaceConfigSlice => ({
  config: {
    include_iva: false,
    create_client_btn: false,
    projectId: 0
  },
  setConfig: (config: { include_iva: boolean; create_client_btn: boolean; projectId: number }) =>
    set({ config })
});
