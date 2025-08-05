import { DiscountPackageGetOne } from "@/types/discount/DiscountPackage";
import dayjs from "dayjs";
import { DiscountPackageSchema } from "../resolvers/generaResolver";

export const mapGetOneToDiscountPackageSchema: (
  discount: DiscountPackageGetOne
) => DiscountPackageSchema = (discount: DiscountPackageGetOne) => {
  return {
    name: discount.name,
    description: discount.description,
    startDate: dayjs(discount.startDate) as any,
    endDate: discount.endDate ? (dayjs(discount.endDate) as any) : undefined,
    is_active: !discount.endDate,
    primaryDiscounts: discount.primaryDiscounts.map((discount) => ({
      ...discount,
      packageId: discount.id
    })),
    secondaryDiscounts: discount.secondaryDiscounts.map((discount) => ({
      ...discount,
      packageId: discount.id
    })),
    client_groups: discount.clientGroupIds
  };
};
