import { ChangePass } from "@/components/organisms/auth/changePass/ChangePass";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aceptar invitación",
  description: "Aceptar invitación"
};

function AcceptInvitationPage() {
  return <ChangePass mode="accept" />;
}

export default AcceptInvitationPage;
