import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { discountTypeByAnnual } from "@/components/organisms/discounts/constants/discountTypes";
import { DiscountSchema } from "@/components/organisms/discounts/discount-rules/create/resolvers/generalResolver";
import config from "@/config";
import {
  DiscountBasics,
  DiscountCreateResponse,
  DiscountGetOne
} from "@/types/discount/DiscountBasics";
import { DiscountContractRange } from "@/types/discount/DiscountContractRange";
import { GenericResponse, GenericResponsePage } from "@/types/global/IGlobal";
import { API, getIdToken } from "@/utils/api/api";
import axios from "axios";
import {
  Discount,
  DiscountPackageCreateResponse,
  DiscountPackageGetOne
} from "@/types/discount/DiscountPackage";
import { DiscountPackageSchema } from "@/components/organisms/discounts/discount-package/create/resolvers/generaResolver";

const defaultRes = {
  data: [],
  pagination: {
    totalPages: 1,
    actualPage: 1,
    rowsperpage: 0,
    totalRows: 0
  }
};

export const getAllDiscounts = async ({
  projectId,
  params
}: {
  projectId: number;
  params?: Record<string, string | number>;
}): Promise<GenericResponsePage<DiscountBasics[]>> => {
  const response: GenericResponsePage<DiscountBasics[]> = await API.get(
    `/discount/project/${projectId}`,
    {
      params
    }
  );
  return response.success ? response : { ...defaultRes, ...response };
};

export const getAllDiscountPackages = async ({
  projectId,
  params
}: {
  projectId: number;
  params?: Record<string, string | number>;
}): Promise<GenericResponsePage<DiscountBasics[]>> => {
  const response: GenericResponsePage<DiscountBasics[]> = await API.get(
    `/discount/all/discount-packages/project/${projectId}`,
    {
      params
    }
  );
  return response.success ? response : { ...defaultRes, ...response };
};

export const deleteDiscount = async (ids: number[]) => {
  const res = ids.map((id) => API.delete(`/discount/${id}`));
  return Promise.all(res);
};

export const changeStatus = async (id: number, newStatus: boolean) => {
  const res = (await API.put(`/discount/change-status/${id}`, {
    status: newStatus ? 1 : 0
  })) as GenericResponse;
  return res;
};

export const getContractsRanges = async (projectId: number) => {
  const response: GenericResponse<DiscountContractRange[]> = await API.get(
    `/discount/contract-ranges/project/${projectId}`
  );
  return response;
};

export const createDiscount = async (
  discount: DiscountSchema & { project_id: number },
  invoice?: FileObject[]
) => {
  let body: any = { ...discount };
  const invoiceFile: any = invoice?.[0]?.file;
  body.discount_type_id = discount.discount_type;
  delete body.discount_type;
  body.min_units_order = discount.min_order;
  delete body.min_order;
  body.end_date = body.end_date ? body.end_date : undefined;
  body.products_category = body.products_category?.map((x: number) => ({ idProduct: x }));
  body.client_nit = discount.client;
  const form = new FormData();
  form.append("request", JSON.stringify(body));
  if (discountTypeByAnnual.includes(Number(discount.discount_type))) {
    form.append("invoice", invoiceFile);
  }
  body = form;

  const token = await getIdToken();
  const response = await axios.post<GenericResponse<DiscountCreateResponse>>(
    `${config.API_HOST}/discount`,
    body,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const updateDiscount = async (
  discount: DiscountSchema & { project_id: number },
  discountId: number,
  invoice?: FileObject[]
) => {
  let body: any = { ...discount };
  const invoiceFile: any = invoice?.[0]?.file;
  body.discount_type_id = discount.discount_type;
  delete body.discount_type;
  body.min_units_order = discount.min_order;
  delete body.min_order;
  body.end_date = body.end_date ? body.end_date : undefined;
  body.products_category = body.products_category?.map((x: number) => ({ idProduct: x }));
  body.client_nit = discount.client;

  const form = new FormData();
  form.append("request", JSON.stringify(body));
  if (discountTypeByAnnual.includes(Number(discount.discount_type)) && !discount.contract_archive) {
    if (!invoiceFile) throw new Error("El contrato es obligatorio");
    form.append("invoice", invoiceFile);
  }
  body = form;

  const token = await getIdToken();
  const response = await axios.put<GenericResponse<DiscountGetOne>>(
    `${config.API_HOST}/discount/${discountId}`,
    body,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getDiscount = async (id: number) => {
  const response: GenericResponse<DiscountGetOne> = await API.get(`/discount/${id}`);
  if (!response.success) throw new Error(response.message);
  return response;
};

export const createDiscountPackage = async (
  discount: DiscountPackageSchema & { project_id: number }
) => {
  const body: any = { ...discount };
  body.endDate = body.endDate ?? undefined;
  body.primaryDiscounts = body.primaryDiscounts?.map((x: Discount) => x.id);
  body.secondaryDiscounts = body.secondaryDiscounts?.map((x: Discount) => x.id);

  const token = await getIdToken();
  const response = await axios.post<GenericResponse<DiscountPackageCreateResponse>>(
    `${config.API_HOST}/discount/discount-package`,
    body,
    {
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${token}`
      }
    }
  );
  return response.data;
};

export const getOneDiscountPackage = async (project_id: number, id: number) => {
  const response: GenericResponse<DiscountPackageGetOne> = await API.get(
    `/discount/one/discount-package/project/${project_id}/${id}`
  );
  if (!response.success) throw new Error(response.message);
  return response;
};
