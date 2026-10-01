"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { extractSingleParam } from "@/utils/utils";

function ClientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = extractSingleParam(params.clientId);
  const projectId = extractSingleParam(params.projectId);

  useEffect(() => {
    router.replace(`/clientes/detail/${clientId}/project/${projectId}/dashboard`);
  }, [clientId, projectId, router]);

  return null;
}

export default ClientDetailPage;
