import { IFormDigitalRecordModal } from "@/components/molecules/modals/DigitalRecordModal/DigitalRecordModal";
import config from "@/config";
import { IFinancialDiscountForm } from "@/modules/clients/containers/accounting-adjustments-tab/Modals/ModalEditAdjustments/ModalEditAdjustments";
import { DiscountRequestBody } from "@/types/accountingAdjustment/IAccountingAdjustment";
import { GenericResponse } from "@/types/global/IGlobal";
import { IPaymentDetail } from "@/types/paymentAgreement/IPaymentAgreement";
import { API } from "@/utils/api/api";

interface RadicationData {
  invoices_id: number[];
  radication_type: string;
  accept_date: string;
  comments?: string;
}
interface AdjustmentData {
  invoice_id: number;
  date_agreement: string;
  amount: number;
  comment: string;
}

export const createAccountingAdjustment = async (requestBody: DiscountRequestBody) => {
  try {
    const response = await API.post(
      `${config.API_HOST}/financial-discount/project/${requestBody.project_id}/client/${requestBody.client_id}`,
      requestBody
    );
    return response;
  } catch (error) {
    throw error;
  }
};
export const applyAccountingAdjustment = async (
  adjustmentData: string,
  docFiles: File[] | null,
  projectId: string,
  clientId: string,
  type: number,
  comment: string | undefined
) => {
  const formData = new FormData();
  formData.append("adjustment_data", adjustmentData);
  formData.append("type", type.toString());
  if (comment) formData.append("comment", comment);
  if (docFiles) {
    docFiles.forEach((file) => {
      formData.append("doc", file);
    });
  }

  const response = await API.post(
    `${config.API_HOST}/invoice/adjusment/project/${projectId}/client/${clientId}`,
    formData
  );
  return response;
};

export const changeStatusInvoice = async (
  statusName: string,
  invoiceIds: number[],
  comments: string,
  docFiles: File[] | null,
  projectId: number,
  clientId: string
) => {
  const formData = new FormData();
  formData.append("status_name", statusName);
  formData.append("invoice_ids", JSON.stringify(invoiceIds));
  formData.append("comments", comments);
  if (docFiles) {
    docFiles.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await API.post(
    `${config.API_HOST}/invoice/project/${projectId}/client/${clientId}/update_status`,
    formData
  );
  return response;
};

export const reportInvoiceIncident = async (
  invoicesId: number[],
  comments: string,
  motiveId: string,
  files: File[] | null,
  clientId: string,
  project_id: string,
  amount?: string
) => {
  const formData = new FormData();
  formData.append("project_id", project_id);
  formData.append("invoices_id", JSON.stringify(invoicesId));
  formData.append("comments", comments);
  formData.append("motive_id", motiveId);
  if (amount) formData.append("amount", amount);

  if (files) {
    files.forEach((file) => {
      formData.append("files", file);
    });
  }

  const response = await API.post(
    `${config.API_HOST}/invoice/incident/client/${clientId}`,
    formData
  );
  return response.data;
};

export const radicateInvoice = async (
  radicationData: RadicationData,
  files: File[],
  clientId: string
) => {
  const formData = new FormData();
  formData.append("invoices_id", JSON.stringify(radicationData.invoices_id));
  formData.append("radication_type", radicationData.radication_type);
  formData.append("accept_date", radicationData.accept_date);
  radicationData.comments && formData.append("comments", radicationData.comments);

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await API.post(
    `${config.API_HOST}/invoice/radication/client/${clientId}`,
    formData
  );

  return response;
};

export const createPaymentAgreement = async (
  projectId: number,
  clientId: string,
  adjustmentData: AdjustmentData[],
  file: File | null
) => {
  const formData = new FormData();
  formData.append("adjustment_data", JSON.stringify(adjustmentData));

  if (file) {
    formData.append("file", file);
  }

  const response = await API.post(
    `${config.API_HOST}/invoice/paymentAgreement/project/${projectId}/client/${clientId}`,
    formData
  );

  return response;
};

export const getDetailPaymentAgreement = async (incident_id: number) => {
  try {
    const response: IPaymentDetail[] = await API.get(
      `${config.API_HOST}/invoice/paymentAgreement/get-detail/${incident_id}`
    );

    return response[0];
  } catch (error) {
    console.error("Error getting payment agreement detail", error);
    throw error;
  }
};

export const cancelPaymentAgreement = async (incident_id: number) => {
  try {
    const response = await API.delete(
      `${config.API_HOST}/invoice/paymentAgreement/cancel-payment-agreement/${incident_id}`
    );

    return response;
  } catch (error) {
    console.error("Error canceling payment agreement", error);
    throw error;
  }
};

export const legalizeFinancialDiscount = async (
  discountData: {
    discount_id_legalized: number;
    discount_id_not_legalized: number;
  },
  projectId: number,
  clientId: string
): Promise<GenericResponse> => {
  const response: GenericResponse = await API.post(
    `${config.API_HOST}/financial-discount/legalize/project/${projectId}/client/${clientId}`,
    discountData
  );

  return response;
};

interface User {
  label: string;
  value: string;
}

interface DigitalRecordResponse {
  usuarios: User[];
  asunto: string;
}

export const getDigitalRecordFormInfo = async (
  projectId: number,
  clientId: string
): Promise<DigitalRecordResponse> => {
  try {
    const response: DigitalRecordResponse = await API.get(
      `${config.API_HOST}/client/digital-record?projectId=${projectId}&clientId=${clientId}`
    );

    return response;
  } catch (error) {
    console.error("Error getting digital record form info", error);
    throw error;
  }
};

export const createDigitalRecord = async (
  data: IFormDigitalRecordModal,
  project_id: number,
  user_id: number,
  clientId: string
) => {
  const forward_to = data.forward_to.map((user) => user.value);
  const copy_to = data?.copy_to?.map((user) => user.value);

  const formData = new FormData();

  formData.append("forward_to", JSON.stringify(forward_to));
  if (copy_to) formData.append("copy_to", JSON.stringify(copy_to));
  formData.append("subject", data.subject);
  formData.append("commentary", data.comment);
  formData.append("user_id", user_id.toString());
  formData.append("project_id", project_id.toString());
  formData.append("clientUUID", clientId.toString());
  data.attachments.forEach((file) => {
    formData.append("attachments", file);
  });

  try {
    const response = await API.post(
      `${config.API_HOST}/client/digital-record?projectId=${project_id}`,
      formData
    );

    return response;
  } catch (error) {
    console.error("Error creating digital record", error);
    throw error;
  }
};

export const editAccountingAdjustments = async (adjustmentData: IFinancialDiscountForm[]) => {
  try {
    const body = {
      discounts: adjustmentData.map((item) => ({
        id: item.id,
        erp_id: item.adjustmentId || item.id,
        motive_id: item.requirementType?.value,
        comment: item.commentary,
        amount: item.amount ? parseFloat(item.amount.toString()) : 0
      }))
    };
    const response = await API.post(
      `${config.API_HOST}/paymentApplication/financial-discounts/update`,
      body
    );

    return response;
  } catch (error) {
    console.error("Error editing accounting adjustments", error);
    throw error;
  }
};

export interface IFinancialRecordAsociate {
  id: number;
  idErp: string;
}

export interface IAdjustmentToLegalize {
  id: number;
  comments: string;
  documentType: string;
  documentName: string;
  ammount: number;
  financialRecordsAsociate: IFinancialRecordAsociate[];
}

export const getFinancialRecordsToLegalize = async (
  accountingAdjustmentsIds: number[]
): Promise<IAdjustmentToLegalize[]> => {
  const body = {
    financialDiscountsIds: accountingAdjustmentsIds
  };
  try {
    const response: GenericResponse<IAdjustmentToLegalize[]> = await API.post(
      `${config.API_HOST}/financial-discount/financial-records-asociate`,
      body
    );
    return response.data;
  } catch (error) {
    console.error("Error getting financial records to legalize", error);
    throw error;
  }
};

export interface IAdjustmentsForSelect {
  id: number;
  erp_id: string;
  initial_value: number;
  current_value: number;
  document_type_name: string;
  comments: string;
}

export const getAvailableAdjustmentsForSelect = async (
  clientId: string
): Promise<IAdjustmentsForSelect[]> => {
  try {
    const response: GenericResponse<IAdjustmentsForSelect[]> = await API.get(
      `${config.API_HOST}/financial-discount/to-asociate/client/${clientId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting available adjustments to legalize", error);
    throw error;
  }
};

interface IBalances {
  financialDiscountId: number;
  financialDiscountIdBalance: number;
  observation: string;
  financialRecordIds: number[];
}

export const balanceLegalization = async (balances: IBalances[]): Promise<GenericResponse> => {
  try {
    const response: GenericResponse = await API.post(
      `${config.API_HOST}/financial-discount/legalize-balance`,
      { balances }
    );
    return response;
  } catch (error) {
    console.error("Error during balance legalization", error);
    throw error;
  }
};

export const addCommentHistoricAction = async (
  clientId: string,
  project_id: number,
  comment: string
): Promise<GenericResponse> => {
  const body = {
    comment: comment
  };
  try {
    const response: GenericResponse = await API.post(
      `${config.API_HOST}/portfolio/add-comment-history/client/${clientId}/project/${project_id}`,
      body
    );
    return response;
  } catch (error) {
    console.error("Error adding comment to historic action", error);
    throw error;
  }
};
