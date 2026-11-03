// GET /product-pack y GET /product-pack/:id — el encabezado llega en snake_case
// (columnas de BD) y los items en camelCase (alias del back).
export interface IProductPack {
  id: number;
  sku: string;
  description: string;
  image: string | null;
  id_line: number;
  id_category: number;
  project_id: number;
  is_available: 0 | 1;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface IProductPackItem {
  id: number;
  idPack: number;
  productId: number;
  quantity: number;
  createdAt: string;
  productSku?: string;
  productDescription?: string;
  productImage?: string | null;
  productLineName?: string;
  productCategoryName?: string;
}

export interface IProductPackDetail extends IProductPack {
  items: IProductPackItem[];
}

export interface IProductPackBody {
  sku: string;
  description: string;
  idLine: number;
  idCategory: number;
  isAvailable?: 0 | 1;
  image?: string | null;
  items: { productId: number; quantity: number }[];
}
