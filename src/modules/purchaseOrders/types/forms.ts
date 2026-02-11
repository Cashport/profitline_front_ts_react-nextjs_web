import {
  IPurchaseOrderDetail,
  IPurchaseOrderProduct,
  IEditPurchaseOrderProduct
} from "@/types/purchaseOrders/purchaseOrders";

/**
 * Unified form data type for purchase order information
 * Combines general info and delivery info into a single form
 */
export interface PurchaseOrderInfoFormData {
  purchase_order_number: string;
  client_name: string;
  created_at: string;
  delivery_date?: string;
  delivery_address?: string;
  delivery_address_id?: number;
  observations?: string;
}

/**
 * Payload type for updating purchase order info
 * Unlike IPurchaseOrderDetail, delivery_address only needs the ID
 */
export interface PurchaseOrderUpdatePayload {
  delivery_date?: string;
  delivery_address?: { id: number };
  observations?: string;
}

/**
 * Form data type for individual product
 */
export interface ProductFormData {
  marketplace_order_product_id: number; // For API identification
  product_sku: string; // Read-only display
  product_description: string; // Read-only display
  po_product_description: string; // Read-only display
  quantity: number; // Editable
  unit_price: number; // Editable
  tax_amount: number; // Read-only
  subtotal: number; // Calculated: quantity * unit_price
  total_price: number; // Calculated: subtotal + tax_amount
  product_id?: number; // Optional internal product ID
}

/**
 * Form data type for products array
 */
export interface PurchaseOrderProductsFormData {
  products: ProductFormData[];
}

/**
 * Transform API purchase order detail to form data
 * @param data - API response data
 * @returns Form data for PurchaseOrderInfo component
 */
export const mapApiToFormData = (data: IPurchaseOrderDetail): PurchaseOrderInfoFormData => ({
  purchase_order_number: data.purchase_order_number || "",
  client_name: data.client_name || "",
  created_at: data.created_at || "",
  delivery_date: data.delivery_date || "",
  delivery_address: data.delivery_address?.address || "",
  delivery_address_id: data.delivery_address?.id,
  observations: data.observations || ""
});

/**
 * Transform form data to API payload for update
 * Only includes editable fields
 * @param formData - Form data from PurchaseOrderInfo
 * @returns Payload for API update request
 */
export const mapFormDataToApi = (
  formData: PurchaseOrderInfoFormData
): PurchaseOrderUpdatePayload => ({
  delivery_date: formData.delivery_date,
  delivery_address: formData.delivery_address_id ? { id: formData.delivery_address_id } : undefined,
  observations: formData.observations
});

/**
 * Transform API products to form data
 * @param products - API products array
 * @returns Form data for PurchaseOrderProducts component
 */
export const mapApiProductsToForm = (
  products: IPurchaseOrderProduct[]
): PurchaseOrderProductsFormData => ({
  products: products.map((p) => ({
    marketplace_order_product_id: p.marketplace_order_product_id,
    product_sku: p.product_sku || "",
    product_description: p.product_description || "",
    po_product_description: p.po_product_description || "",
    quantity: p.quantity || 0,
    unit_price: p.unit_price || 0,
    tax_amount: p.tax_amount || 0,
    subtotal: p.subtotal || 0,
    total_price: p.total_price || 0,
    product_id: p.product_id ?? undefined
  }))
});

/**
 * Transform form products to API payload
 * Only includes editable fields
 * @param formData - Form data from PurchaseOrderProducts
 * @returns Payload for API update request
 */
export const mapFormProductsToApi = (
  formData: PurchaseOrderProductsFormData
): { products: IEditPurchaseOrderProduct[] } => ({
  products: formData.products.map((p) => ({
    marketplace_order_product_id: p.marketplace_order_product_id,
    quantity: p.quantity,
    price: p.unit_price,
    product_id: p.product_id
  }))
});
