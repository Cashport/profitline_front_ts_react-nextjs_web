import { CreateDiscountPackageView } from "@/components/organisms/discounts/discount-package/create/CreateDiscountPackageView";

export default function Create({ params }: { params: { id: string } }) {
  return <CreateDiscountPackageView params={params} />;
}
