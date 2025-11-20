import { useEffect, useState } from "react";
import discountCategories from "../../../constants/discountTypes";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { DiscountSchema, generalResolver } from "../resolvers/generalResolver";
import { createDiscount, getDiscount, updateDiscount } from "@/services/discount/discount.service";
import { useAppStore } from "@/lib/store/store";
import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { useRouter } from "next/navigation";
import { mapDiscountGetOneToDiscountSchema } from "../logic/createDiscountLogic";
import { message } from "antd";

type Props = {
  params?: { id: string };
};

export default function useCreateDiscountView({ params }: Props) {
  const discountId = !!Number(params?.id) ? Number(params?.id) : undefined;
  const [messageApi, contextHolder] = message.useMessage();
  const [selectedType, setSelectedType] = useState<number>(1);
  const { ID } = useAppStore((project) => project.selectedProject);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<FileObject[]>([]);
  const [statusForm, setStatusForm] = useState<"create" | "edit" | "review">(
    discountId ? "review" : "create"
  );
  const [defaultDiscount, setDefaultDiscount] = useState<DiscountSchema>({
    name: "",
    description: "",
    discount_type: undefined,
    start_date: null,
    is_active: false,
    products_category: [],
    min_order: 0,
    computation_type: 1,
    client_groups: [],
    discount: 0,
    ranges: [],
    annual_ranges: [],
    end_date: undefined,
    client: undefined
  });

  const handleChangeStatusForm = (status: "create" | "edit" | "review") => {
    setStatusForm(status);
  };

  const fetchDiscount: () => Promise<DiscountSchema> = async () => {
    setLoading(true);
    try {
      const { data } = await getDiscount(Number(params?.id));
      setLoading(false);
      const selectedType =
        Object.values(discountCategories).find((t) =>
          t.discountType.includes(data.discount_type_id)
        )?.id || 1;
      setSelectedType(selectedType);
      const result = mapDiscountGetOneToDiscountSchema(data);
      setDefaultDiscount(result);
      return result;
    } catch (e: any) {
      messageApi.error(e.message);
      console.error(e.message);
      router.push("/descuentos");
    }
    return defaultDiscount;
  };

  useEffect(() => {
    if (!Number(params?.id) && typeof params?.id === "string") {
      // if id is not a number and it is a string then the path is incorrect
      router.push("/descuentos");
    }
  }, [params?.id]);

  useEffect(() => {
    if (statusForm === "review") {
      form.reset();
      setFiles([]);
    }
  }, [statusForm]);

  useEffect(() => {
    if (files.length > 0) {
      handleUpdateContract();
    }
  }, [files]);

  const handleClick = (type: number) => {
    setSelectedType(type);
  };

  const form = useForm({
    resolver: yupResolver(generalResolver),
    defaultValues: Number(params?.id) ? fetchDiscount : defaultDiscount,
    disabled: statusForm === "review"
  });

  const handlePostDiscount = async (e: DiscountSchema) => {
    setLoading(true);
    try {
      const res = await createDiscount({ ...e, project_id: ID }, files);
      messageApi.success("Descuento creado exitosamente");
      router.push(`/descuentos/regla/${res.idDiscount}`);
    } catch (e: any) {
      messageApi.error(e.response.data.message);
      console.error(e);
    }
    setLoading(false);
  };

  const handleUpdateDiscount = async (e: DiscountSchema) => {
    setLoading(true);
    try {
      const res = await updateDiscount({ ...e, project_id: ID }, discountId as number, files);
      messageApi.success("Descuento actualizado exitosamente");
      setDefaultDiscount(mapDiscountGetOneToDiscountSchema(res));
      setStatusForm("review");
      form.reset(mapDiscountGetOneToDiscountSchema(res));
    } catch (e: any) {
      messageApi.error(e.response.data.message);
      console.error(e);
    }
    setLoading(false);
  };

  const handleExecCallback = form.handleSubmit(
    statusForm === "edit" ? handleUpdateDiscount : handlePostDiscount
  );

  const handleUpdateContract = () => {
    form.setValue("contract_archive", undefined as never);
  };

  return {
    discountId,
    selectedType,
    handleClick,
    form,
    handleExecCallback,
    loading,
    statusForm,
    setFiles,
    handleChangeStatusForm,
    contextHolder,
    handleUpdateContract
  };
}
