import SupplierForm from "@/components/organisms/proveedores/Form";

const Page = ({ params }: { params: { id: number } }) => {
  const { id: clientTypeId } = params;

  return <SupplierForm userType={"admin"} clientTypeId={clientTypeId} />;
};

export default Page;
