"use client";

import { CommunicationProjectForm } from "@/components/molecules/tabs/Projects/CommunicationProjectForm/CommunicationProjectForm";
import { useRouter, useParams } from "next/navigation";

const NewCommunicationPage = () => {
  const { id } = useParams();
  const router = useRouter();

  return (
    <CommunicationProjectForm
      onGoBackTable={() => router.push(`/proyectos/review/${id}/communications`)}
      showCommunicationDetails={{ communicationId: 0, active: false }}
    />
  );
};

export default NewCommunicationPage;
