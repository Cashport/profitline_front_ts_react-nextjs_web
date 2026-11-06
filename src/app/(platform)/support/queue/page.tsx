import { Suspense } from "react";
import SupportListView from "@/modules/supportModule/containers/support-list-view/support-list-view";

export default function SupportQueuePage() {
  return (
    <Suspense>
      <SupportListView mode="queue" />
    </Suspense>
  );
}
