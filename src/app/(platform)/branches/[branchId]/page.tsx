import BranchDetailView from "@/modules/branches/containers/branch-detail-view/branch-detail-view";

export default function BranchDetailPage({ params }: { params: { branchId: string } }) {
  return <BranchDetailView branchId={params.branchId} />;
}
