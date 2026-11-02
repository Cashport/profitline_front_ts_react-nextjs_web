"use client";

import { UserProjectForm } from "@/components/molecules/tabs/Projects/UserProjectForm/UserProjectForm";
import { useRouter, useParams } from "next/navigation";

const NewUserPage = () => {
  const router = useRouter();
  const { id: projectId } = useParams();

  return (
    <UserProjectForm
      onGoBackTable={() => router.push(`/proyectos/review/${projectId}/users`)}
      isViewDetailsUser={{ active: false, id: 0 }}
    />
  );
};

export default NewUserPage;
