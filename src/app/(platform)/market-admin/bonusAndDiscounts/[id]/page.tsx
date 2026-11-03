import { notFound } from "next/navigation";
import MarketAdminPromotionDetail from "@/modules/marketAdmin/containers/market-admin-promotion-detail/MarketAdminPromotionDetail";

export default function Page({ params }: { params: { id: string } }) {
  const promotionId = Number(params.id);
  if (!Number.isInteger(promotionId) || promotionId <= 0) notFound();

  return <MarketAdminPromotionDetail promotionId={promotionId} />;
}
