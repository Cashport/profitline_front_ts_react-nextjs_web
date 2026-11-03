import { CreateDiscountPackageView } from "@/components/organisms/discounts/discount-package/create/CreateDiscountPackageView";
import { DISCOUNTS_BASE } from "@/components/organisms/discounts/constants/routes";

export default function Create({ params }: { params: { id: string } }) {
  return (
    <CreateDiscountPackageView
      params={{ ...params, basePath: DISCOUNTS_BASE, listPath: DISCOUNTS_BASE }}
    />
  );
}
