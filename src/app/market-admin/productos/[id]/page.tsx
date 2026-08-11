import MarketAdminProductDetail from "@/modules/marketAdmin/containers/market-admin-product-detail/MarketAdminProductDetail";

export default function Page({ params }: { params: { id: string } }) {
  return <MarketAdminProductDetail params={params} />;
}
