export interface Product {
  id: number;
  sku: string;
  id_material: number;
  description: string;
  id_line: number;
  image: string;
  material_type: string;
  line_id: number;
  description_line: string;
  channel_id: number;
  channel_description: string;
  checked: boolean;
}

export interface ProductChecklist {
  id: number;
  name: string;
}

export interface ProductLine {
  id: number;
  name: string;
  products: Product[];
}
