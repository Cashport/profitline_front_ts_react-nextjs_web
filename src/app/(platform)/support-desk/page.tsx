import { Suspense } from "react";
import SupportDeskView from "@/modules/supportModule/containers/support-desk-view/support-desk-view";

export default function SupportDeskPage() {
  return (
    <Suspense>
      <SupportDeskView />
    </Suspense>
  );
}
