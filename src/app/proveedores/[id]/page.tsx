import SupplierForm from "@/components/organisms/proveedores/Form";

const Page = async ({ params }: { params: { id: number } }) => {
  const { id: clientTypeId } = params;

  return <SupplierForm userType={"admin"} clientTypeId={clientTypeId} />;
};

export default Page;
