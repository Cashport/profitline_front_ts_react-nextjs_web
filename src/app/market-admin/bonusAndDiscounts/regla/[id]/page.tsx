import { CreateDiscountView } from "@/components/organisms/discounts/discount-rules/create/CreateDiscountView";
import {
  MARKET_ADMIN_DISCOUNTS_BASE,
  MARKET_ADMIN_DISCOUNTS_TABS,
  marketAdminDiscountsListPath
} from "@/components/organisms/discounts/constants/routes";

export default function Create({ params }: { params: { id: string } }) {
  return (
    <CreateDiscountView
      params={{
        ...params,
        basePath: MARKET_ADMIN_DISCOUNTS_BASE,
        listPath: marketAdminDiscountsListPath(MARKET_ADMIN_DISCOUNTS_TABS.rules)
      }}
    />
  );
}
