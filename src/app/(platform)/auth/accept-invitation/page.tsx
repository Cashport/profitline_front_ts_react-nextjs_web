import { ChangePass } from "@/components/organisms/auth/changePass/ChangePass";
import { pageMetadata } from "@/i18n/metadata";

export const generateMetadata = () => pageMetadata("acceptInvitation");

function AcceptInvitationPage() {
  return <ChangePass mode="accept" />;
}

export default AcceptInvitationPage;
