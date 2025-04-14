"use client";

import { useParams, useRouter } from "next/navigation";
import { ClientProjectForm } from "@/components/molecules/tabs/Projects/ClientProjectForm/ClientProjectForm";

const CreateClientPage = () => {
  const { id } = useParams(); // Get project ID
  const router = useRouter();

  const onGoBackTableClients = () => {
    router.push(`/proyectos/review/${id}/clients`);
  };

  return (
    <ClientProjectForm
      isViewDetailsClient={{ active: false, id: "" }}
      onGoBackTable={onGoBackTableClients}
    />
  );
};

export default CreateClientPage;
