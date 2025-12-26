import { useEffect, useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useAppStore } from "@/lib/store/store";
import { useRouter } from "next/navigation";
import { message } from "antd";
import { DiscountPackageSchema, generalResolver } from "../resolvers/generaResolver";
import useSWR from "swr";
import { ApiError, fetcher } from "@/utils/api/api";
import { createDiscountPackage, getOneDiscountPackage } from "@/services/discount/discount.service";
import { Discount } from "@/types/discount/DiscountPackage";
import { mapGetOneToDiscountPackageSchema } from "../logic/createPackageLogic";
import { useClientsGroups } from "@/hooks/useClientsGroups";

type Props = {
  params?: { id: string };
};
export interface DiscountListData {
  status: number;
  message: string;
  data: Discount[];
}
export default function useCreateDiscountPackage({ params }: Props) {
  const discountPackageId = !!Number(params?.id) ? Number(params?.id) : undefined;
  const [messageApi, contextHolder] = message.useMessage();
  const { ID: projectId } = useAppStore((project) => project.selectedProject);

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const [statusForm, setStatusForm] = useState<"create" | "edit" | "review">(
    discountPackageId ? "review" : "create"
  );
  const [defaultDiscount, setDefaultDiscount] = useState<DiscountPackageSchema>({
    name: "",
    description: "",
    startDate: null,
    endDate: undefined,
    is_active: false,
    primaryDiscounts: [],
    secondaryDiscounts: [],
    client_groups: []
  });

  const fetchDiscountPackage: () => Promise<DiscountPackageSchema> = async () => {
    setLoading(true);
    try {
      if (discountPackageId) {
        const { data } = await getOneDiscountPackage(projectId, discountPackageId);
        const result = mapGetOneToDiscountPackageSchema(data);
        setDefaultDiscount(result);
        setLoading(false);
        return result;
      }
    } catch (e: any) {
      messageApi.error(e.message);
      console.error(e.message);
      router.push("/descuentos");
    }
    return defaultDiscount;
  };

  const form = useForm({
    resolver: yupResolver(generalResolver),
    defaultValues: discountPackageId ? fetchDiscountPackage : defaultDiscount,
    disabled: statusForm === "review"
  });

  const {
    watch,
    trigger,
    control,
    formState: { errors, disabled }
  } = form;

  const {
    fields: primaryDiscountsFields,
    append: appendDiscount,
    remove: removeDiscount
  } = useFieldArray<DiscountPackageSchema>({
    control,
    name: "primaryDiscounts"
  });

  const {
    fields: secondaryDiscountsFields,
    append: appendAdditionalDiscount,
    remove: removeAdditionalDiscount
  } = useFieldArray<DiscountPackageSchema>({
    control,
    name: "secondaryDiscounts"
  });

  const { clients, loading: isLoadingClients } = useClientsGroups({
    noLimit: true
  });

  const { data: dataDiscountList, isLoading: isLoadingSelect } = useSWR<DiscountListData>(
    `/discount/discounts-to-apply/project/${projectId}`,
    fetcher,
    {}
  );

  const optionsDiscounts = useMemo(
    () =>
      dataDiscountList?.data.map((option) => ({
        value: option.id,
        label: option.discount_name ?? ""
      })),
    [dataDiscountList]
  );

  const discountList = useMemo(
    () =>
      dataDiscountList?.data.map((discount) => ({
        ...discount,
        packageId: discount.id
      })),
    [dataDiscountList]
  );

  const handleChangeStatusForm = (status: "create" | "edit" | "review") => {
    setStatusForm(status);
  };

  useEffect(() => {
    if (!Number(params?.id) && typeof params?.id === "string") {
      router.push("/descuentos");
    }
  }, [params?.id]);

  useEffect(() => {
    if (statusForm === "review") {
      form.reset();
    }
  }, [statusForm]);

  const handlePostDiscount = async (e: DiscountPackageSchema) => {
    setLoading(true);
    try {
      const res = await createDiscountPackage({ ...e, project_id: projectId });
      messageApi.success("Descuento creado exitosamente");
      router.push(`/descuentos/paquete/${res.id}`);
    } catch (e: any) {
      if (e instanceof ApiError) {
        messageApi.error(e.message);
      } else {
        messageApi.error(e.response.data.message);
      }
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleExecCallback = form.handleSubmit(
    handlePostDiscount
    // statusForm === "edit" ? handleUpdateDiscount : handlePostDiscount
  );

  return {
    form,
    handleExecCallback,
    loading,
    statusForm,
    handleChangeStatusForm,
    contextHolder,
    openModal,
    closeModal,
    errors,
    isModalOpen,
    setIsModalOpen,
    primaryDiscountsFields,
    secondaryDiscountsFields,
    control,
    trigger,
    appendAdditionalDiscount,
    appendDiscount,
    removeDiscount,
    removeAdditionalDiscount,
    watch,
    optionsDiscounts,
    isLoadingSelect,
    discountList,
    discountId: discountPackageId,
    isFormDisabled: disabled,
    clients,
    isLoadingClients
  };
}
