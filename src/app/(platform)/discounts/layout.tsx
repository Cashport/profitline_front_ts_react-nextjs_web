import DiscountsLayout from "@/components/organisms/discounts/wrapper/DiscountsLayout";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("discounts");
export default function Layout({ children }: { children: React.ReactNode }) {
  return <DiscountsLayout>{children}</DiscountsLayout>;
}
