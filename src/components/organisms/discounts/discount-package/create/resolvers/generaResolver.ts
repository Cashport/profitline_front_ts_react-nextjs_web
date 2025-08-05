import { Discount } from "@/types/discount/DiscountPackage";
import { UseFormReturn } from "react-hook-form";
import * as yup from "yup";
import { ObjectSchema } from "yup";

const yesterday: any = (date: string) =>
  new Date(new Date(date).setDate(new Date(date).getDate() - 1));
const tomorrow = (date: string) => {
  return new Date(new Date(date).setDate(new Date(date).getDate() + 1));
};

const discountBasicsSchema = yup.object({
  id: yup.number().required(),
  packageId: yup.number().required(),
  project_id: yup.number().required(),
  discount_type_id: yup.number().required(),
  discount_type: yup.string().required(),
  discount_definition: yup.string().required(),
  client_name: yup.string().optional().nullable(),
  discount_name: yup.string().required(),
  description: yup.string().required(),
  start_date: yup.string().required(),
  end_date: yup.string().optional().nullable(),
  apply_others_discounts: yup.mixed().optional().nullable(),
  priority: yup.mixed().optional().nullable(),
  min_units_by_order: yup.number().required(),
  discount_computation: yup.number().required(),
  id_client: yup.mixed().optional().nullable(),
  contract_archive: yup.mixed().optional().nullable(),
  status: yup.number().required(),
  is_deleted: yup.number().required()
});

export const generalResolver: ObjectSchema<DiscountPackageSchema> = yup.object({
  name: yup
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .required("El nombre es requerido"),
  description: yup
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .required("La descripción es requerida"),
  startDate: yup
    .date()
    .required("La fecha de inicio es requerida")
    .min(yesterday(new Date() as any), "La fecha de inicio debe ser mayor o igual a hoy"),
  endDate: yup
    .date()
    .optional()
    .when("is_active", {
      is: (checkbox: boolean) => {
        return checkbox === false || checkbox === undefined;
      },
      then: () =>
        yup
          .date()
          .test({
            name: "min",
            message: "La fecha de fin debe ser mayor a la fecha de inicio",
            test: (endDate, context) =>
              new Date(endDate || "") >= tomorrow(context.parent.startDate)
          })
          .required("La fecha de fin es requerida"),
      otherwise: (a) => {
        return a.nullable().optional();
      }
    }),
  is_active: yup.boolean().optional(),
  primaryDiscounts: yup
    .array()
    .of(discountBasicsSchema)
    .min(1, "Debe haber al menos un descuento primario")
    .optional()
    .default([]),
  secondaryDiscounts: yup.array().of(discountBasicsSchema).optional().default([]),
  client_groups: yup
    .array()
    .min(1, "Debe haber al menos un grupo de clientes")
    .of(yup.number().required())
    .required()
    .default([])
});

export interface DiscountPackageSchema {
  name: string;
  description: string;
  startDate?: Date | null;
  endDate?: Date;
  is_active?: boolean;
  primaryDiscounts?: Discount[];
  secondaryDiscounts?: Discount[];
  client_groups: number[];
}

export type DiscountResolverShape = UseFormReturn<DiscountPackageSchema, any, undefined>;
