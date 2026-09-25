import { CreateDiscountPackageView } from "@/components/organisms/discounts/discount-package/create/CreateDiscountPackageView";
import {
  MARKET_ADMIN_DISCOUNTS_BASE,
  MARKET_ADMIN_DISCOUNTS_TABS,
  marketAdminDiscountsListPath
} from "@/components/organisms/discounts/constants/routes";

export default function Create() {
  return (
    <CreateDiscountPackageView
      params={{
        basePath: MARKET_ADMIN_DISCOUNTS_BASE,
        listPath: marketAdminDiscountsListPath(MARKET_ADMIN_DISCOUNTS_TABS.packages)
      }}
    />
  );
}
