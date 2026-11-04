import { UseFormReturn } from "react-hook-form";
import * as yup from "yup";
import { ObjectSchema } from "yup";
import type { useTranslations } from "use-intl";
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

// Los mensajes se traducen al construir el esquema (useMemo en el hook del formulario).
type ValidationT = ReturnType<typeof useTranslations<"discounts.validation">>;

export const generalResolver = (t: ValidationT): ObjectSchema<DiscountSchema> =>
  yup.object({
    name: yup.string().min(3, t("nameMin")).required(t("nameRequired")),
    description: yup.string().min(3, t("descriptionMin")).required(t("descriptionRequired")),
    discount_type: yup.number().required(t("typeRequired")),
    start_date: yup
      .date()
      .required(t("startDateRequired"))
      .min(yesterday(new Date() as any), t("startDateMin")),
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
              message: t("endDateMin"),
              test: (end_date, context) =>
                new Date(end_date || "") >= tomorrow(context.parent.start_date)
            })
            .required(t("endDateRequired")),
        otherwise: (a) => {
          return a.nullable().optional();
        }
      }),
    is_active: yup.boolean().optional(),
    products_category: yup.array().when("discount_type", {
      is: (discount_type: number) =>
        discountTypesByOrder.includes(discount_type) ||
        discountTypesByClient.includes(discount_type),
      then: () =>
        yup
          .array()
          .of(yup.number().required())
          .min(1, t("productsRequired"))
          .required(t("productsRequired")),
      otherwise: () => yup.mixed().optional().default([])
    }),
    min_order: yup.number().when("discount_type", {
      is: (discount_type: number) => typesWithMinByOrder.includes(discount_type),
      then: () =>
        yup
          .number()
          .typeError(t("invalidType"))
          .required(t("minValueRequired"))
          .min(1, t("minValuePositive")),
      otherwise: () => yup.mixed().optional()
    }),
    computation_type: yup
      .number()
      .when("discount_type", {
        is: (discount_type: number) => discountTypeByAnnual.includes(discount_type),
        then: () => yup.mixed().optional(),
        otherwise: () => yup.number().required(t("computationRequired"))
      })
      .default(1),
    ranges: yup.array().when("discount_type", {
      is: (discount_type: number) => discountTypesByOrder.includes(discount_type),
      then: () =>
        yup
          .array()
          .of(
            yup.object({
              id: yup.number().required(t("idRequired")),
              unitsMin: yup
                .number()
                .typeError(t("invalidType"))
                .required(t("minUnitsRequired"))
                .min(1, t("valuePositive")),
              unitsMax: yup
                .number()
                .typeError(t("invalidType"))
                .required(t("maxUnitsRequired"))
                .min(1, t("valuePositive")),
              discount: yup
                .number()
                .typeError(t("invalidType"))
                .required(t("discountRequired"))
                .min(1, t("discountPositive"))
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
                    message: t("discountMax")
                  });
            }
            return true;
          })
          .min(1, t("rulesMin"))
          .test("test-scale", "Error test-scale", (value, context) => {
            if (value?.length && typesWithOutMinByOrder.includes(context.parent.discount_type)) {
              const err = findDiscountError(value.map((e, i) => (i % 2 ? e.unitsMin : e.unitsMax)));
              if (err) {
                return context.createError({
                  path: "ranges[" + err + "].unitsMin",
                  message: t("rangeAboveMax", { range: err - 1 })
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
                  message: t("rangeAboveMin", { range: err })
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
          .min(1, t("customerGroupsRequired"))
          .required(t("customerGroupsRequired")),
      otherwise: () => yup.mixed().optional().default([])
    }),
    discount: yup.number().when("discount_type", {
      is: (discount_type: number) => discountTypesByClient.includes(discount_type),
      then: () =>
        yup
          .number()
          .typeError(t("invalidType"))
          .required(t("discountRequired"))
          .test("test-discount", "", (value, context) => {
            if (context.parent.computation_type == 1 && value > 100)
              return context.createError({
                path: "discount",
                message: t("discountMax")
              });
            if (value <= 0)
              return context.createError({
                path: "discount",
                message:
                  context.parent.computation_type == 1
                    ? t("discountPositivePercent")
                    : t("discountPositive")
              });
            return true;
          }),
      otherwise: () => yup.mixed().optional()
    }),
    client: yup
      .string()
      .optional()
      .when("discount_type", {
        is: (discount_type: number) => discountTypeByAnnual.includes(discount_type),
        then: () =>
          yup
            .string()
            .typeError(t("invalidType"))
            .nonNullable(t("customerRequired"))
            .required(t("customerRequired"))
            .test("test-client", "", (value, context) => {
              if (context.parent.computation_type == 1 && value == null)
                context.createError({
                  path: "client",
                  message: t("customerRequired")
                });
              return true;
            }),
        otherwise: () => yup.string().optional().nullable()
      }),
    client_name: yup.string().optional(),
    annual_ranges: yup.array().when("discount_type", {
      is: (discount_type: number) => discountTypeByAnnual.includes(discount_type),
      then: () =>
        yup
          .array()
          .of(
            yup.object({
              idLine: yup.number().required(t("lineRequired")),
              idProduct: yup.number().required(t("productRequired")),
              discount: yup
                .number()
                .typeError(t("invalidType"))
                .required(t("discountRequired"))
                .min(1, t("minValuePositive")),
              units: yup
                .number()
                .typeError(t("invalidType"))
                .required(t("minValueRequired"))
                .min(1, t("minValuePositive"))
            })
          )
          .min(1, t("rulesMin")),
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
