import { Suspense } from "react";
import RolesConsole from "@/modules/platform/containers/roles-console/RolesConsole";

export default function Page() {
  return (
    <Suspense>
      <RolesConsole />
    </Suspense>
  );
}
