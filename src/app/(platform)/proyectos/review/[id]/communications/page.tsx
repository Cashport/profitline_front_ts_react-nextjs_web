"use client";
import { CommunicationsTable } from "@/components/molecules/tables/CommunicationsTable/CommunicationsTable";
import { useRouter } from "next/navigation";

const CommunicationsProjectPage = () => {
  const router = useRouter();

  const handleCreateCommunication = () => {
    router.push("communications/new");
  };

  const handleViewCommunication = (communicationId: number) => {
    router.push(`communications/${communicationId}`);
  };

  return (
    <CommunicationsTable
      onCreateCommunication={handleCreateCommunication}
      showCommunicationDetails={(communicationId) => {
        handleViewCommunication(communicationId);
      }}
    />
  );
};

export default CommunicationsProjectPage;
