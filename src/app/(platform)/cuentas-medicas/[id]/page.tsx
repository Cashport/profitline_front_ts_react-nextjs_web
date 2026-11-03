import { MedicalAccountDetailView } from "@/modules/medicalAccounts/containers/MedicalAccountDetailView/MedicalAccountDetailView";

export default function MedicalAccountDetailPage({ params }: { params: { id: string } }) {
  return <MedicalAccountDetailView accountId={decodeURIComponent(params.id)} />;
}
