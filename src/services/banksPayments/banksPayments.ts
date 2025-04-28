import { GenericResponse } from "@/types/global/IGlobal";
import config from "@/config";
import { API } from "@/utils/api/api";
import { IClientsByProject, IPaymentDetail, IPaymentStatus } from "@/types/banks/IBanks";

export const getPaymentDetail = async (payment_id: number) => {
  try {
    const response: GenericResponse<IPaymentDetail[]> = await API.get(
      `/bank/get-payment-detail?payment_id=${payment_id}`
    );

    return response.data;
  } catch (error) {
    console.error("Error al obtener el detalle del pago:", error);
    return [];
  }
};

export const getClientsByProject = async (project_id: number) => {
  try {
    const response: GenericResponse<IClientsByProject[]> = await API.get(
      `/client/get-client-by-project?project_id=${project_id}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener los clientes:", error);
    return [];
  }
};

interface IAssignClient {
  id_user: number;
  payment_ids: number[];
  client_id: string;
  evidence?: File;
}

interface IEditClient extends IAssignClient {
  current_client_id: string;
}

export const assignClient = async ({
  id_user,
  payment_ids,
  client_id,
  evidence
}: IAssignClient) => {
  const formData = new FormData();
  formData.append("id_user", id_user.toString());
  formData.append("payment_ids", JSON.stringify(payment_ids));
  formData.append("assign_client_id", client_id);
  evidence && formData.append("evidence", evidence);
  try {
    const response: GenericResponse<any> = await API.put(
      `${config.API_HOST}/bank/assign-client-payments`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error al asignar el cliente al pago:", error);
    throw error;
  }
};

export const editClient = async ({
  id_user,
  payment_ids,
  client_id,
  evidence,
  current_client_id
}: IEditClient) => {
  const formData = new FormData();
  formData.append("id_user", id_user.toString());
  formData.append("payment_ids", JSON.stringify(payment_ids));
  formData.append("assign_client_id", client_id);
  evidence && formData.append("evidence", evidence);
  formData.append("previous_assign_client_id", current_client_id);
  try {
    const response: GenericResponse<any> = await API.put(
      `${config.API_HOST}/bank/updated-client-payments`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error al editar el cliente:", error);
    throw error;
  }
};

export const uploadEvidence = async (payment_id: number, user_id: number, evidence: File) => {
  const formData = new FormData();
  formData.append("user_id", user_id.toString());
  formData.append("files", evidence);
  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/bank/upload-evidence/${payment_id}`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error al subir la evidencia:", error);
    throw error;
  }
};

interface IDataSplitPayment {
  id_client: string;
  ammount: number;
  key_file: string;
}

interface ISpliPayment {
  payment_id: number;
  userId: number;
  data: IDataSplitPayment[];
  files: File[];
}

export const splitPayment = async ({ payment_id, userId, data, files }: ISpliPayment) => {
  const formData = new FormData();
  formData.append("payment_id", payment_id.toString());
  formData.append("data", JSON.stringify(data));
  formData.append("user_id", userId.toString());

  // for each file in files append with key files
  files.forEach((file) => {
    formData.append("files", file);
  });

  try {
    const response: GenericResponse<any> = await API.post(
      `${config.API_HOST}/bank/split-payment`,
      formData
    );

    return response.data;
  } catch (error) {
    console.error("Error al dividir el pago:", error);
    throw error;
  }
};

export const getPaymentsStatus = async () => {
  try {
    const response: GenericResponse<IPaymentStatus[]> = await API.get("/bank/get-status");
    return response.data;
  } catch (error) {
    console.error("Error al obtener los estados de los pagos:", error);
    throw error;
  }
};

interface IChangePaymentStatus {
  projectId: number;
  clientId: string | null;
  payment_ids: number[];
  status_id: number;
  comment?: string;
  file?: File;
}

export const changePaymentStatus = async ({
  projectId,
  clientId,
  payment_ids,
  status_id,
  comment,
  file
}: IChangePaymentStatus) => {
  const formData = new FormData();
  formData.append("project_id", projectId.toString());

  formData.append("client_id", clientId ? clientId.toString() : "");

  formData.append("payments", JSON.stringify(payment_ids));
  formData.append("status", status_id.toString());
  comment && formData.append("comment", comment);
  file && formData.append("file", file);

  try {
    const response: GenericResponse<any> = await API.put(
      `${config.API_HOST}/bank/change-status`,
      formData
    );

    return response;
  } catch (error) {
    console.error("Error al cambiar el estado del pago:", error);
    throw error;
  }
};

interface IApprovePayment {
  payments: number[];
  project_id: number;
  client_id: string;
}

export const approvePayment = async ({ payments, project_id, client_id }: IApprovePayment) => {
  const modelData = {
    payments,
    project_id,
    client_id
  };

  try {
    const response: GenericResponse<any> = await API.post("/bank/approve-assigment", modelData);
    return response.data;
  } catch (error) {
    console.error("Error al aprobar el pago:", error);
    throw error;
  }
};
