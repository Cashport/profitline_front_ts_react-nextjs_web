/* eslint-disable no-unused-vars */

export interface IPurchaseOrderSlice {
  createFiles: File[];
  setCreateFiles: (files: File[]) => void;
}

export const purchaseOrderSlice = (set: any): IPurchaseOrderSlice => {
  return {
    createFiles: [],
    setCreateFiles: (files: File[]) => set((state: any) => ({ ...state, createFiles: files }))
  };
};
