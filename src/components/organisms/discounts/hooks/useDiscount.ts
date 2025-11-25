"use client";
import useSearch from "@/hooks/useSearch";
import { useAppStore } from "@/lib/store/store";
import {
  changeStatus,
  changeStatusPackage,
  deleteDiscount,
  deleteDiscountPackages,
  getAllDiscountPackages,
  getAllDiscounts
} from "@/services/discount/discount.service";
import { DiscountBasics } from "@/types/discount/DiscountBasics";
import { DiscountPackage } from "@/types/discount/DiscountPackage";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { MessageInstance } from "antd/es/message/interface";
import { ChangeEvent, useEffect, useState } from "react";
import useSWR from "swr";

type Props = {
  messageApi: MessageInstance;
  tabActive: string;
};

export type DiscountBasicsState = DiscountBasics & { checked: boolean };
export type DiscountPackageState = DiscountPackage & { checked: boolean };

export default function useDiscount({ messageApi, tabActive }: Props) {
  const [page, setPage] = useState(1);
  const [isOpenModalDelete, setIsOpenModalDelete] = useState(false);
  const [isLoadingDelete, setIsLoadingDelete] = useState(false);
  const [active, setActive] = useState<number | undefined>(undefined);
  const [data, setData] = useState<Array<DiscountBasicsState | DiscountPackageState>>([]);
  const { searchQuery, handleChangeSearch } = useSearch();
  const { ID } = useAppStore((project) => project.selectedProject);
  const fetcher = tabActive === "1" ? getAllDiscountPackages : getAllDiscounts;
  const {
    data: res,
    isLoading,
    mutate
  } = useSWR<GenericResponsePage<DiscountBasics[] | DiscountPackage[]>>(
    {
      projectId: ID,
      params: {
        page,
        searchQuery,
        active
      },
      tabActive
    },
    ({ projectId, params }) => fetcher({ projectId, params }),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      errorRetryInterval: 1000,
      errorRetryCount: 3,
      onSuccess: (response) => {
        if (response.success) {
          return response;
        } else {
          messageApi.error(response.message);
          throw new Error(response.message);
        }
      }
    }
  );

  useEffect(() => {
    if (res?.data) {
      setData(res.data.map((item) => ({ ...item, checked: false })));
    }
  }, [res, tabActive]);

  const onChangeSearch = (e: ChangeEvent<HTMLInputElement>) => {
    handleChangePage(1);
    return handleChangeSearch(e);
  };

  const handleChangePage = (page: number) => {
    setPage(page);
  };

  const handleChangeActive = (
    filter: {
      label: string;
      value: number;
    }[]
  ) => {
    if (!filter?.length) setActive(undefined);
    else setActive(filter[0].value);
  };

  const handleSelectToDelete = (id: number, addToDelete: boolean) => {
    setData((data) =>
      data.map((item) => (item.id === id ? { ...item, checked: addToDelete } : item))
    );
  };

  const handleDeleteDiscount = async () => {
    try {
      setIsLoadingDelete(true);
      // Filtrar los IDs de los elementos seleccionados
      const selectedIds = data.filter((item) => item.checked).map((item) => item.id);

      // Llamar a la función adecuada según `tabActive`
      if (tabActive === "1") {
        await deleteDiscountPackages(selectedIds);
      } else {
        await deleteDiscount(selectedIds);
      }
    } catch (error) {
    } finally {
      handleClose();
      setIsLoadingDelete(false);
      mutate(undefined, {
        revalidate: true
      });
    }
  };

  const handleClose = () => {
    setIsOpenModalDelete(false);
  };
  const handleOpen = () => {
    setIsOpenModalDelete(true);
  };

  const handleChangeStatus = async (id: number, newStatus: boolean) => {
    let response;
    mutate(
      {
        ...res,
        data: data.map((item) => {
          if (item.id === id) {
            return {
              ...item,
              [tabActive === "1" ? "active" : "status"]: newStatus
            };
          }
          return item;
        })
      } as GenericResponsePage<DiscountBasics[] | DiscountPackage[]>,
      { revalidate: false }
    );
    if (tabActive === "1") {
      response = await changeStatusPackage(id, newStatus);
    } else {
      response = await changeStatus(id, newStatus);
    }
    if (response.success) {
      let message = "";
      if (tabActive === "1") {
        message = `Paquete de descuentos ${newStatus ? "activado" : "desactivado"} con éxito`;
      } else {
        message = `Descuento ${newStatus ? "activado" : "desactivado"} con éxito`;
      }
      messageApi.success(message);
    } else {
      mutate();
      messageApi.error(response.message);
    }
  };

  return {
    res,
    data,
    loading: isLoading,
    handleChangePage,
    handleChangeSearch: onChangeSearch,
    page,
    handleChangeActive,
    handleSelectToDelete,
    handleDeleteDiscount,
    handleChangeStatus,
    modalDelete: {
      removeDiscountAction: handleDeleteDiscount,
      isLoading: isLoadingDelete,
      isOpen: isOpenModalDelete,
      handleOpen,
      handleClose
    }
  };
}
