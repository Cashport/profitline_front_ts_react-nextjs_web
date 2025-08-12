export interface DiscountPackage {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  active: number;
  discountType: string;
}

export interface Discount {
  id: number;
  packageId: number;
  project_id?: number;
  discount_type_id?: number;
  discount_type?: string;
  discount_definition?: string;
  client_name?: string | null;
  discount_name?: string;
  description?: string;
  start_date: string;
  end_date?: string | null;
  apply_others_discounts?: any;
  priority?: any;
  min_units_by_order: number;
  discount_computation: number;
  id_client?: any;
  contract_archive?: any;
  status: number;
  is_deleted: number;
  customId?: string;
}
export interface DiscountPackageGetOne {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  clientGroupIds: number[];
  primaryDiscounts: Discount[];
  secondaryDiscounts: Discount[];
}
export interface DiscountPackageCreateResponse {
  id: number;
}
