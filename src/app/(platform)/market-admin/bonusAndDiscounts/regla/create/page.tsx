import { CreateDiscountView } from "@/components/organisms/discounts/discount-rules/create/CreateDiscountView";
import {
  MARKET_ADMIN_DISCOUNTS_BASE,
  MARKET_ADMIN_DISCOUNTS_TABS,
  marketAdminDiscountsListPath
} from "@/components/organisms/discounts/constants/routes";

type SearchParams = { category?: string; returnTo?: string };

export default function Create({ searchParams }: { searchParams: SearchParams }) {
  // Only in-app paths are honored (no "//host" either) so returnTo can't be an open redirect
  const { returnTo } = searchParams;
  const listPath =
    returnTo?.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : marketAdminDiscountsListPath(MARKET_ADMIN_DISCOUNTS_TABS.rules);

  return (
    <CreateDiscountView
      params={{
        basePath: MARKET_ADMIN_DISCOUNTS_BASE,
        listPath,
        initialCategory: searchParams.category
      }}
    />
  );
}
