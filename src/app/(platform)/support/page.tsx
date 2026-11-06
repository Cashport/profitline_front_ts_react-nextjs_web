import { Suspense } from "react";
import SupportView from "@/modules/supportModule/containers/support-view/support-view";

export default function SupportPage() {
  return (
    <Suspense>
      <SupportView />
    </Suspense>
  );
}
