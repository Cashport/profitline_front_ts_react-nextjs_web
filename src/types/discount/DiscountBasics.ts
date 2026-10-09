export interface DiscountBasics {
  id: number;
  project_id: number;
  discount_type_id: number;
  discount_type: string;
  discount_definition: string;
  client_name: string;
  discount_name: string;
  description: string;
  start_date: string;
  end_date?: string;
  apply_others_discounts: any;
  priority: any;
  min_units_by_order: number;
  discount_computation: number;
  id_client: any;
  contract_archive: any;
  status: number;
  is_deleted: number;
}

// GET /discount/by-client — same row as the list plus audit/extra columns
export interface DiscountByClient extends DiscountBasics {
  created_at: string;
  updated_at: string | null;
  created_by: string;
  updated_by: string | null;
  max_units_global_by_product: number | null;
  special_condition_sku: string | null;
  activate_cross: number;
  apply_for_promotions: number;
}

export interface DiscountGetOne {
  id: number;
  project_id: number;
  discount_type_id: number;
  discount_name: string;
  description: string;
  start_date: string;
  end_date: any;
  apply_others_discounts: any;
  priority: any;
  min_units_by_order: number;
  discount_computation: number;
  id_client: any;
  client_name: string;
  contract_archive: any;
  status: number;
  is_deleted: number;
  discount?: number;
  productsCategory?: ProductsCategory[];
  clientGroups?: ClientGroup[];
  ranges?: Range[];
  contracts?: Contract[];
}

export interface ProductsCategory {
  id: number;
  id_discount: number;
  id_line: number;
  id_product: number;
  is_deleted: number;
}

export interface ClientGroup {
  id: number;
  id_discount: number;
  id_clientgroup: number;
}

export interface Range {
  id: number;
  id_discount: number;
  units_from: number;
  units_to: number;
  min_products: number;
  min_channel: number;
  min_units_by_channel: number;
  min_units_by_order_by_sku: number;
  discount: number;
  is_deleted: number;
}

export interface Contract {
  id: number;
  id_discount: number;
  id_line: number;
  id_product: number;
  units: number;
  id_discount_contracts_ranges: number;
  is_deleted: number;
  discount: number;
}

export interface DiscountCreateResponse {
  idDiscount: number;
}
