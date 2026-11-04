import * as yup from "yup";
import type { useTranslations } from "use-intl";
import { PurchaseOrderProductsFormData, ProductFormData } from "../types/forms";

type ValidationT = ReturnType<typeof useTranslations<"purchaseOrders.validation">>;

/**
 * Validation schema for purchase order general and delivery information
 */
export const purchaseOrderInfoSchema = (t: ValidationT) =>
  yup.object({
    // General info fields (read-only, but still validated for presence)
    purchase_order_number: yup.string().required(t("orderNumberRequired")),
    client_name: yup.string().required(t("customerNameRequired")),
    created_at: yup.string().required(t("createdAtRequired")),

    // Delivery info fields (editable)
    order_date: yup.string().test("valid-date", t("invalidOrderDate"), (value) => {
      if (!value) return true;
      return !isNaN(Date.parse(value));
    }),
    delivery_date: yup.string().test("valid-date", t("invalidDeliveryDate"), (value) => {
      if (!value) return true; // Optional field
      return !isNaN(Date.parse(value));
    }),
    delivery_address: yup.string().max(500, t("addressMaxLength", { max: 500 })),
    delivery_address_id: yup.number().optional(),
    observations: yup.string().max(1000, t("observationsMaxLength", { max: 1000 }))
  });

/**
 * Validation schema for individual product in the form
 */
export const productFormSchema = (t: ValidationT) =>
  yup.object({
    marketplace_order_product_id: yup.number().required(t("productIdRequired")),
    product_sku: yup.string().optional(),
    product_description: yup.string().optional(),
    quantity: yup
      .number()
      .required(t("quantityRequired"))
      .min(1, t("quantityMin", { min: 1 }))
      .integer(t("quantityInteger")),
    unit_price: yup.number().optional(),
    tax_amount: yup.number().optional(),
    subtotal: yup.number().optional(),
    total_price: yup.number().optional(),
    product_id: yup.number().optional(),
    batch_id: yup.number().nullable().optional(),
    quantity_by_box: yup
      .number()
      .optional()
      .min(0, t("minValue", { min: 0 })),
    box_quantity: yup
      .number()
      .optional()
      .min(0, t("minValue", { min: 0 }))
  }) as yup.ObjectSchema<ProductFormData>;

/**
 * Validation schema for products array
 */
export const purchaseOrderProductsSchema = (t: ValidationT) =>
  yup.object({
    products: yup
      .array()
      .of(productFormSchema(t))
      .required(t("productsRequired"))
      .min(1, t("productsMin"))
  }) as yup.ObjectSchema<PurchaseOrderProductsFormData>;
