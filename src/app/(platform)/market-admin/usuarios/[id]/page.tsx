import MarketAdminUserDetail from "@/modules/marketAdmin/containers/market-admin-user-detail/MarketAdminUserDetail";

export default function Page({ params }: { params: { id: string } }) {
  return <MarketAdminUserDetail params={params} />;
}
