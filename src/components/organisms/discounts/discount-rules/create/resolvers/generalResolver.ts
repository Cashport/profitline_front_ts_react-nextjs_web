import { UseFormReturn } from "react-hook-form";
import * as yup from "yup";
import { ObjectSchema } from "yup";
import {
  discountTypeByAnnual,
  discountTypesByClient,
  discountTypesByOrder,
  typesWithMinByOrder,
  typesWithOutMinByOrder
} from "../../../constants/discountTypes";

const yesterday: any = (date: string) =>
  new Date(new Date(date).setDate(new Date(date).getDate() - 1));
const tomorrow = (date: string) => {
  return new Date(new Date(date).setDate(new Date(date).getDate() + 1));
};

export const generalResolver: ObjectSchema<DiscountSchema> = yup.object({
  name: yup
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .required("El nombre es requerido"),
  description: yup
    .string()
    .min(3, "La descripción debe tener al menos 3 caracteres")
    .required("La descripción es requerida"),
  discount_type: yup
    .number()
    .nullable()
    .required("El tipo de descuento es requerido")
    .default(null),
  start_date: yup
    .date()
    .required("La fecha de inicio es requerida")
    .min(yesterday(new Date() as any), "La fecha de inicio debe ser mayor o igual a hoy"),
  end_date: yup
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
            test: (end_date, context) =>
              new Date(end_date || "") >= tomorrow(context.parent.start_date)
          })
          .required("La fecha de fin es requerida"),
      otherwise: (a) => {
        return a.nullable().optional();
      }
    }),
  is_active: yup.boolean().optional(),
  products_category: yup.array().when("discount_type", {
    is: (discount_type: number) =>
      discountTypesByOrder.includes(discount_type) || discountTypesByClient.includes(discount_type),
    then: () =>
      yup
        .array()
        .of(yup.number().required())
        .min(1, "Productos a aplicar son requeridos")
        .required("Productos a aplicar son requeridos"),
    otherwise: () => yup.mixed().optional().default([])
  }),
  min_order: yup.number().when("discount_type", {
    is: (discount_type: number) => typesWithMinByOrder.includes(discount_type),
    then: () =>
      yup
        .number()
        .typeError("Tipo de dato invalido")
        .required("El valor mínimo es requerido")
        .min(1, "El valor mínimo debe ser mayor a 0"),
    otherwise: () => yup.mixed().optional()
  }),
  computation_type: yup
    .number()
    .when("discount_type", {
      is: (discount_type: number) => discountTypeByAnnual.includes(discount_type),
      then: () => yup.mixed().optional(),
      otherwise: () => yup.number().required("El tipo de cálculo es requerido")
    })
    .default(1),
  ranges: yup.array().when("discount_type", {
    is: (discount_type: number) => discountTypesByOrder.includes(discount_type),
    then: () =>
      yup
        .array()
        .of(
          yup.object({
            id: yup.number().required("El id es requerido"),
            unitsMin: yup
              .number()
              .typeError("Tipo de dato invalido")
              .required("El mínimo de unidades es requerido")
              .min(1, "El valor debe ser mayor a 0"),
            unitsMax: yup
              .number()
              .typeError("Tipo de dato invalido")
              .required("El máximo de unidades es requerido")
              .min(1, "El valor debe ser mayor a 0"),
            discount: yup
              .number()
              .typeError("Tipo de dato invalido")
              .required("El descuento es requerido")
              .min(1, "El descuento debe ser mayor a 0")
          })
        )
        .test("test-computation-type", "Error test-computation-type", (value, context) => {
          if (context.parent.computation_type == 1) {
            const asd = value?.map((e) => e.discount);
            const i = asd?.findIndex((e) => e > 100);
            return i === -1 || i === undefined
              ? true
              : context.createError({
                  path: "ranges[" + i + "].discount",
                  message: "El descuento debe ser menor a 100%"
                });
          }
          return true;
        })
        .min(1, "Debe haber al menos una regla de descuento")
        .test("test-scale", "Error test-scale", (value, context) => {
          if (value?.length && typesWithOutMinByOrder.includes(context.parent.discount_type)) {
            const err = findDiscountError(value.map((e, i) => (i % 2 ? e.unitsMin : e.unitsMax)));
            if (err) {
              return context.createError({
                path: "ranges[" + err + "].unitsMin",
                message: "Debe ser superior al máximo del rango " + (err - 1)
              });
            }
          }
          return true;
        })
        .test("test-scale-right", "Error test-scale-right", (value, context) => {
          if (value?.length && typesWithOutMinByOrder.includes(context.parent.discount_type)) {
            const errMap = value.map((e, i) =>
              findDiscountError([e.unitsMin, e.unitsMax]) === false ? null : i
            );
            const err = errMap.find((e) => e !== null);
            if (err !== null && err !== undefined) {
              return context.createError({
                path: "ranges[" + err + "].unitsMax",
                message: "Debe ser superior al mínimo del rango " + err
              });
            }
          }
          return true;
        }),
    otherwise: () => yup.array().optional()
  }),
  client_groups: yup.array().when("discount_type", {
    is: (discount_type: number) => discountTypesByClient.includes(discount_type),
    then: () =>
      yup
        .array()
        .of(yup.number().required())
        .min(1, "Grupos de clientes a aplicar son requeridos")
        .required("Grupos de clientes a aplicar son requeridos"),
    otherwise: () => yup.mixed().optional().default([])
  }),
  discount: yup.number().when("discount_type", {
    is: (discount_type: number) => discountTypesByClient.includes(discount_type),
    then: () =>
      yup
        .number()
        .typeError("Tipo de dato invalido")
        .required("El descuento es requerido")
        .test("test-discount", "", (value, context) => {
          if (context.parent.computation_type == 1 && value > 100)
            return context.createError({
              path: "discount",
              message: "El descuento debe ser menor a 100%"
            });
          if (value <= 0)
            return context.createError({
              path: "discount",
              message:
                "El descuento debe ser mayor a 0" +
                (context.parent.computation_type == 1 ? "%" : "")
            });
          return true;
        }),
    otherwise: () => yup.mixed().optional()
  }),
  client: yup
    .number()
    .optional()
    .when("discount_type", {
      is: (discount_type: number) => discountTypeByAnnual.includes(discount_type),
      then: () =>
        yup
          .number()
          .typeError("Tipo de dato invalido")
          .nonNullable("El cliente es requerido")
          .required("El cliente es requerido")
          .test("test-client", "", (value, context) => {
            if (context.parent.computation_type == 1 && value == null)
              context.createError({
                path: "client",
                message: "El cliente es requerido"
              });
            return true;
          }),
      otherwise: () => yup.number().optional().nullable()
    }),
  client_name: yup.string().optional(),
  annual_ranges: yup.array().when("discount_type", {
    is: (discount_type: number) => discountTypeByAnnual.includes(discount_type),
    then: () =>
      yup
        .array()
        .of(
          yup.object({
            idLine: yup.number().required("La linea es requerida"),
            idProduct: yup.number().required("El producto es requerido"),
            discount: yup
              .number()
              .typeError("Tipo de dato invalido")
              .required("El descuento es requerido")
              .min(1, "El valor mínimo debe ser mayor a 0"),
            units: yup
              .number()
              .typeError("Tipo de dato invalido")
              .required("El valor mínimo es requerido")
              .min(1, "El valor mínimo debe ser mayor a 0")
          })
        )
        .min(1, "Debe haber al menos una regla de descuento"),
    otherwise: () => yup.array().optional()
  }),
  contract_archive: yup.string().optional()
});

const findDiscountError = (arr: number[]) => {
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] <= arr[i - 1]) {
      return i;
    }
  }
  return false;
};

export interface ProductSchema {}

export interface DiscountSchema {
  name: string;
  description: string;
  discount_type?: number;
  start_date?: Date | null | undefined;
  end_date?: Date | undefined;
  is_active?: boolean | undefined;
  products_category?: number[] | undefined;
  min_order?: number | undefined;
  computation_type?: number | undefined;
  client_groups?: number[] | undefined;
  discount?: number | undefined;
  ranges?: {
    id: number;
    unitsMin: number;
    unitsMax: number;
    discount: number;
  }[];
  client?: string | undefined;
  client_name?: string | undefined;
  annual_ranges?: {
    id?: number | undefined;
    idLine?: number | undefined;
    units: number;
    idProduct?: number | undefined;
    discount?: number | undefined;
  }[];
  contract_archive?: string | undefined;
}

export type DiscountResolverShape = UseFormReturn<DiscountSchema, any, undefined>;
