import { CreateDiscountView } from "@/components/organisms/discounts/discount-rules/create/CreateDiscountView";
import { DISCOUNTS_BASE } from "@/components/organisms/discounts/constants/routes";

export default function Create({ params }: { params: { id: string } }) {
  return (
    <CreateDiscountView
      params={{ ...params, basePath: DISCOUNTS_BASE, listPath: DISCOUNTS_BASE }}
    />
  );
}
