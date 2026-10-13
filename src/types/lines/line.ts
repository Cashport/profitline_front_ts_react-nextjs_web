export interface ILine {
  id: number;
  channel_id: number;
  description_line: string;
  is_deleted: number;
}
export interface IProduct {
  id: number;
  SKU: string;
  description: string;
  image: string;
  id_line: number;
  id_category: number;
  taxes: number;
  kit: number;
  locked: number;
  is_available: number;
  EAN: string;
  project_id: number;
  created_by: string;
  updated_at: string | null;
  is_deleted: number;
  discount_code_product_matrix: string | null;
  price: number;
  line_name: string;
  line_alias?: string | null;
  category_name: string;
  category_alias?: string | null;
  category_id: number;
}

export interface ICategory {
  category: string;
  category_id: number;
  line_alias?: string | null;
  products: IProduct[];
}
export interface ISubLine {
  id: number;
  line_id: number;
  subline_description: string;
  is_deleted: number;
}
