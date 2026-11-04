import { CreateDiscountPackageView } from "@/components/organisms/discounts/discount-package/create/CreateDiscountPackageView";
import { DISCOUNTS_BASE } from "@/components/organisms/discounts/constants/routes";

export default function Create() {
  return (
    <CreateDiscountPackageView params={{ basePath: DISCOUNTS_BASE, listPath: DISCOUNTS_BASE }} />
  );
}
