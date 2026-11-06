import { Suspense } from "react";
import SupportListView from "@/modules/supportModule/containers/support-list-view/support-list-view";

export default function SupportMinePage() {
  return (
    <Suspense>
      <SupportListView mode="mine" />
    </Suspense>
  );
}
