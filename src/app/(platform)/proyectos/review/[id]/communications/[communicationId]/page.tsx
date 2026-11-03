"use client";

import { useParams, useRouter } from "next/navigation";
import { CommunicationProjectForm } from "@/components/molecules/tabs/Projects/CommunicationProjectForm/CommunicationProjectForm";

const CommunicationDetailPage = () => {
  const { communicationId, id } = useParams();
  const router = useRouter();

  return (
    <CommunicationProjectForm
      onGoBackTable={() => router.push(`/proyectos/review/${id}/communications`)}
      showCommunicationDetails={{
        communicationId: Number(communicationId),
        active: true
      }}
    />
  );
};

export default CommunicationDetailPage;
