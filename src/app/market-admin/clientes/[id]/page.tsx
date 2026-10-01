import MarketAdminClientDetail from "@/modules/marketAdmin/containers/market-admin-client-detail/MarketAdminClientDetail";

export default function Page({ params }: { params: { id: string } }) {
  return <MarketAdminClientDetail params={params} />;
}
