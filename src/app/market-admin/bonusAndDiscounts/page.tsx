import MarketAdminBonusAndDiscounts from "@/modules/marketAdmin/containers/market-admin-bonus-and-discounts/MarketAdminBonusAndDiscounts";

export default function Page({ searchParams }: { searchParams: { tab?: string } }) {
  return <MarketAdminBonusAndDiscounts initialTab={searchParams.tab} />;
}
