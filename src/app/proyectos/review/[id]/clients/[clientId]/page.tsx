"use client";

import { useParams, useRouter } from "next/navigation";
import { ClientProjectForm } from "@/components/molecules/tabs/Projects/ClientProjectForm/ClientProjectForm";

const ClientDetailPage = () => {
  const { id, clientId } = useParams(); // Extract clientId and projectId
  const router = useRouter();

  const onGoBackTableClients = () => {
    router.push(`/proyectos/review/${id}/clients`);
  };

  return (
    <ClientProjectForm
      isViewDetailsClient={{
        active: true,
        id: Array.isArray(clientId) ? clientId[0] : clientId
      }}
      onGoBackTable={onGoBackTableClients}
    />
  );
};

export default ClientDetailPage;
