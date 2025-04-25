import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IApplicationInvoice, InvoicesData } from "@/types/invoices/IInvoices";
import { IClientPaymentStatus } from "@/types/clientPayments/IClientPayments";
import { StatusGroup } from "@/hooks/useAcountingAdjustment";

export const addItemsToTable = async (
  project_id: number,
  client_id: number,
  adding_type: "invoices" | "payments" | "discounts",
  selected_items_ids: number[]
) => {
  const modelData = {
    project_id,
    client_id,
    ...(adding_type === "invoices" && { invoice_ids: selected_items_ids }),
    ...(adding_type === "payments" && { payment_ids: selected_items_ids }),
    ...(adding_type === "discounts" && { discount_ids: selected_items_ids })
  };
  try {
    const response: GenericResponse<{ applications: number[] }> = await API.post(
      `${config.API_HOST}/paymentApplication/applications/batch`,
      modelData
    );

    return response.data;
  } catch (error) {
    console.error("error addItemsToTable", error);
    throw error;
  }
};

export const removeItemsFromTable = async (row_id: number) => {
  try {
    const response: GenericResponse<{ applications: number[] }> = await API.delete(
      `${config.API_HOST}/paymentApplication/applications/${row_id}`
    );

    return response.data;
  } catch (error) {
    console.error("error removeItemsFromTable", error);
    throw error;
  }
};

export interface ICreateGlobalAdjustment {
  amount: number;
  motive: number;
  description: string;
  invoice_id?: string;
}

export const createGlobalAdjustment = async (
  project_id: number,
  client_id: number,
  adjustments: ICreateGlobalAdjustment[]
) => {
  const modelData = {
    project_id,
    client_id,
    discounts: adjustments
  };

  try {
    const response: GenericResponse<{ applications: number[] }> = await API.post(
      `${config.API_HOST}/paymentApplication/applications/bulk-discounts`,
      modelData
    );

    return response.data;
  } catch (error) {
    console.error("error addItemsToTable", error);
    throw error;
  }
};

interface IDiscount {
  id: number;
  balanceToApply: number;
}

interface IAdjustmentData {
  invoice_id: number;
  discounts: IDiscount[];
}

interface ISpecificAdjustment {
  adjustment_data: IAdjustmentData[];
  type: number;
}

export const addSpecificAdjustments = async (
  project_id: number,
  client_id: string,
  data: ISpecificAdjustment
) => {
  const formData = new FormData();

  for (const key in data) {
    formData.append(key, JSON.stringify(data[key as keyof ISpecificAdjustment]));
  }

  try {
    const response: GenericResponse<{ applications: number[] }> = await API.post(
      `${config.API_HOST}/paymentApplication/projects/${project_id}/clients/${client_id}/adjustments`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("error addSpecificAdjustments", error);
    throw error;
  }
};

export const saveApplication = async (
  project_id: number,
  client_id: number,
  comment: string,
  file: File
) => {
  const modelData = {
    project_id,
    client_id,
    comments: comment,
    files: file
  };

  const formData = new FormData();
  for (const key in modelData) {
    const value = modelData[key as keyof typeof modelData];
    formData.append(
      key,
      typeof value === "string" || value instanceof File ? value : String(value)
    );
  }

  try {
    const response: GenericResponse<{ applications: number[] }> = await API.post(
      `${config.API_HOST}/paymentApplication/save-current-application`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("error saveApplication", error);
    throw error;
  }
};

export const getApplicationInvoices = async (project_id: number, client_id: number) => {
  try {
    const response: GenericResponse<InvoicesData[]> = await API.get(
      `${config.API_HOST}/paymentApplication/client/${client_id}/project/${project_id}?page=1&limit=50`
    );

    const fetchedInvoices = response.data.map((data) => data.invoices).flat();

    return fetchedInvoices as IApplicationInvoice[];
  } catch (error) {
    console.error("error getApplicationInvoices", error);
    throw error;
  }
};

export const getApplicationPayments = async (project_id: number, client_id: number) => {
  try {
    const response: GenericResponse<IClientPaymentStatus[]> = await API.get(
      `${config.API_HOST}/paymentApplication/get-available-payments/project/${project_id}/client/${client_id}`
    );

    return response.data;
  } catch (error) {
    console.error("error getApplicationPayments", error);
    throw error;
  }
};

export const getApplicationAdjustments = async (project_id: number, client_id: string) => {
  try {
    const response: GenericResponse<StatusGroup[]> = await API.get(
      `${config.API_HOST}/paymentApplication/project/${project_id}/client/${client_id}?type=2`
    );

    return response.data;
  } catch (error) {
    console.error("error getApplicationAdjustments", error);
    throw error;
  }
};

export const updateInvoiceOrPaymentAmount = async (
  project_id: number,
  client_id: number,
  application_id: number,
  amount: number
) => {
  try {
    const response: GenericResponse<{ applications: number[] }> = await API.put(
      `${config.API_HOST}/paymentApplication/project/${project_id}/client/${client_id}/application/${application_id}`,
      {
        amount
      }
    );

    return response.data;
  } catch (error) {
    console.error("error updateInvoiceOrPaymentAmount", error);
    throw error;
  }
};
