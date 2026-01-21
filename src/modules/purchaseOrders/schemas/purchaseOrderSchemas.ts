import * as yup from "yup";
import { PurchaseOrderProductsFormData, ProductFormData } from "../types/forms";

/**
 * Validation schema for purchase order general and delivery information
 */
export const purchaseOrderInfoSchema = yup.object({
  // General info fields (read-only, but still validated for presence)
  purchase_order_number: yup.string().required("Número de orden de compra requerido"),
  client_name: yup.string().required("Nombre del cliente requerido"),
  created_at: yup.string().required("Fecha de creación requerida"),

  // Delivery info fields (editable)
  delivery_date: yup.string().test("valid-date", "Fecha de entrega inválida", (value) => {
    if (!value) return true; // Optional field
    return !isNaN(Date.parse(value));
  }),
  delivery_address: yup.string().max(500, "La dirección no puede exceder 500 caracteres"),
  observations: yup.string().max(1000, "Las observaciones no pueden exceder 1000 caracteres")
});

/**
 * Validation schema for individual product in the form
 */
export const productFormSchema = yup.object({
  marketplace_order_product_id: yup.number().required("ID de producto requerido"),
  product_sku: yup.string().optional(),
  product_description: yup.string().optional(),
  quantity: yup
    .number()
    .required("Cantidad requerida")
    .min(1, "La cantidad mínima es 1")
    .integer("La cantidad debe ser un número entero"),
  unit_price: yup
    .number()
    .required("Precio unitario requerido")
    .min(0, "El precio unitario no puede ser negativo"),
  tax_amount: yup
    .number()
    .required("Monto de IVA requerido")
    .min(0, "El monto de IVA no puede ser negativo"),
  subtotal: yup.number().required(),
  total_price: yup.number().required(),
  product_id: yup.number().optional()
}) as yup.ObjectSchema<ProductFormData>;

/**
 * Validation schema for products array
 */
export const purchaseOrderProductsSchema = yup.object({
  products: yup
    .array()
    .of(productFormSchema)
    .required("Productos requeridos")
    .min(1, "Debe haber al menos un producto")
}) as yup.ObjectSchema<PurchaseOrderProductsFormData>;
