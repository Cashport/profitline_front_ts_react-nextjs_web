"use client";

import { useParams, useRouter } from "next/navigation";
import { UserProjectForm } from "@/components/molecules/tabs/Projects/UserProjectForm/UserProjectForm";

const UserDetailPage = () => {
  const { id: projectId, userId } = useParams();
  const router = useRouter();

  return (
    <UserProjectForm
      onGoBackTable={() => router.push(`/proyectos/review/${projectId}/users`)}
      isViewDetailsUser={{
        id: Number(userId),
        active: true
      }}
    />
  );
};

export default UserDetailPage;
