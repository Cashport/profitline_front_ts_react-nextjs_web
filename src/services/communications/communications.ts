import config from "@/config";

import { API, getIdToken } from "@/utils/api/api";
import { MessageType } from "@/context/MessageContext";

import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import {
  ICommunication,
  ICommunicationDetail,
  ICommunicationForm,
  ICreateCommunication,
  IPeriodicityModalForm,
  ITemplateCommunication,
  Iattachments
} from "@/types/communications/ICommunications";
import { GenericResponse } from "@/types/global/IGlobal";
import { IFormEmailNotification } from "@/components/molecules/modals/ModalSendEmail/ModalSendEmail";

interface IGetSelect {
  id: number;
  name: string;
}

export const getAllAtachments = async () => {
  const response: Iattachments[] = await API.get(`${config.API_HOST}/comunication/attachments`);
  return response;
};

export const getAllCommunications = async (projectId: number) => {
  const response: ICommunication[] = await API.get(
    `${config.API_HOST}/comunication/?project_id=${projectId}`
  );
  return response;
};

export const getCommunicationById = async (
  communicationId: number
): Promise<ICommunicationDetail | null> => {
  try {
    const response: ICommunicationDetail = await API.get(
      `${config.API_HOST}/comunication/detail/${communicationId}`
    );

    return response;
  } catch (error) {
    console.error("Error getting communication by id", error);
    return null;
  }
};

export const getForwardEvents = async (): Promise<IGetSelect[]> => {
  try {
    const response: IGetSelect[] = await API.get(`${config.API_HOST}/comunication/forward-events`);
    return response;
  } catch (error) {
    console.error("Error getting forward events", error);
    return [];
  }
};

export const getActions = async (): Promise<IGetSelect[]> => {
  try {
    const response: IGetSelect[] = await API.get(`${config.API_HOST}/comunication/actions`);
    return response;
  } catch (error) {
    console.error("Error getting actions", error);
    return [];
  }
};

export const getSubActions = async (action_ids: string[]): Promise<IGetSelect[]> => {
  const response: IGetSelect[] = await API.get(
    `${config.API_HOST}/comunication/actions/${action_ids[0]}/sub-actions`
  );
  return response;
};

interface IGetTags extends IGetSelect {
  description: string;
}

export const getTemplateTags = async (): Promise<IGetTags[]> => {
  const response: GenericResponse<IGetTags[]> = await API.get(
    `${config.API_HOST}/comunication/tags`
  );
  return response.data;
};

export const getForwardToEmails = async (): Promise<string[]> => {
  const response: string[] = await API.get(`${config.API_HOST}/comunication/get_emails`);
  return response;
};

interface ICreateCommunicationProps {
  data: ICommunicationForm;
  selectedPeriodicity: IPeriodicityModalForm | undefined;
  zones: number[];
  selectedBusinessRules: ISelectedBussinessRules;
  assignedGroups: number[];
  projectId: number;
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void;
}

export const createCommunication = async ({
  data,
  selectedPeriodicity,
  zones,
  selectedBusinessRules,
  assignedGroups,
  projectId,
  showMessage
}: ICreateCommunicationProps) => {
  const token = await getIdToken();
  const eventTriggerDays = data?.trigger?.settings?.noticeDaysEvent;

  const sendToRoles = data.template.send_to
    .filter((role) => {
      const isRole = role.value.split("_")[0];
      return isRole === "1";
    })
    .map((role) => Number(role.value.split("_")[1]));
  const copyToRoles =
    data.template.copy_to
      ?.filter((role) => {
        const isRole = role.value.split("_")[0];
        return isRole === "1";
      })
      .map((role) => Number(role.value.split("_")[1])) || [];
  const roles_ids = [...sendToRoles, ...copyToRoles];

  const sendToContactPositions = data.template.send_to
    .filter((role) => {
      const isContactPos = role.value.split("_")[0];
      return isContactPos === "0";
    })
    .map((role) => Number(role.value.split("_")[1]));
  const copyToContactPositions =
    data.template.copy_to
      ?.filter((role) => {
        const isContactPos = role.value.split("_")[0];
        return isContactPos === "0";
      })
      .map((role) => Number(role.value.split("_")[1])) || [];
  const contact_positions_ids = [...sendToContactPositions, ...copyToContactPositions];

  const sendTo_other_emails = data.template.send_to
    .map((email) => email.value)
    .filter((email) => email.length >= 6);
  const other_emails_copy =
    data.template.copy_to?.map((email) => email.value).filter((email) => email.length >= 6) || [];
  const other_emails = [...sendTo_other_emails, ...other_emails_copy];

  const jsonFreq = {
    start_date: selectedPeriodicity?.init_date?.format("YYYY-MM-DD") || "",
    repeat: {
      interval: selectedPeriodicity?.frequency_number || 0,
      frequency: selectedPeriodicity?.frequency.value || "Mensual",
      day:
        selectedPeriodicity?.frequency.value.toLowerCase() === "semanal"
          ? selectedPeriodicity?.days.map((day) => day.value.toLowerCase())
          : [Number(selectedPeriodicity?.init_date?.format("YYYY-MM-DD").split("-")[2])]
    },
    end_date: selectedPeriodicity?.end_date?.format("YYYY-MM-DD") || ""
  };

  const modelData: ICreateCommunication = {
    // Where does invoice should come from?
    project_id: projectId,
    name: data.name,
    attachment_ids: data.attachment_ids,
    description: data.description,
    subject: data.template.subject,
    message: data.template.message,
    via: data.template.via.value.toLowerCase(),
    user_roles: roles_ids,
    contact_roles: contact_positions_ids,
    other_mails: other_emails,
    client_group_ids: assignedGroups,
    comunication_type: data.trigger.type,
    // Frequency-specific properties (optional)
    json_frecuency: data.trigger.type === 1 ? jsonFreq && jsonFreq : undefined,

    // Event-specific properties (optional)
    id_event_type: Number(data.trigger.settings?.event_type?.value) || undefined,
    delay_event: Number(eventTriggerDays) || undefined,

    // Action-specific properties (optional)
    action_type_ids:
      data.trigger.settings?.actions?.map((action) => Number(action.value)) || undefined,
    sub_action_type_ids:
      data.trigger.settings?.subActions?.map((subAction) => Number(subAction.value)) || undefined
  };

  try {
    const response: GenericResponse<{ id: number }> = await API.post(
      `${config.API_HOST}/comunication`,
      modelData
    );

    if (response.status === 200) showMessage("success", "Comunicación creada correctamente");
    return response;
  } catch (error) {
    console.error("Error creating communication", error);
    showMessage("error", "Ocurrió un error al crear la comunicación");
    throw error;
  }
};

export const sendEmailNotification = async (data: IFormEmailNotification) => {
  const token = await getIdToken();

  const modelData = {
    subject: data.subject,
    body: data.body,
    to: data.forward_to.map((email) => email.value),
    copy: data.copy_to?.map((email) => email.value),
    files: data.attachments
  };

  const formData = new FormData();

  // for each of the keys in the data object, append the key and value to the formData object
  Object.entries(modelData).forEach(([key, value]) => {
    if (key === "files" && Array.isArray(value)) {
      value.forEach((file) => formData.append("files", file));
    } else if (value !== undefined && value !== null && value !== "") {
      formData.append(key, typeof value === "string" ? value : JSON.stringify(value));
    }
  });

  try {
    const response: GenericResponse<{ id: number }> = await API.post(
      `${config.API_HOST}/comunication/email`,
      formData,
      {
        headers: {
          Accept: "application/json, text/plain, */*",
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response;
  } catch (error) {
    console.error("Error sending email notification", error);
    throw error;
  }
};

export const getTemplateByEvent = async (
  projectId: number,
  clientId: string,
  actionId: string,
  subActionId?: string
) => {
  const basePath = `${config.API_HOST}/comunication/find-action-template?action=${actionId}&project_id=${projectId}&client_id=${clientId}`;
  const url = subActionId ? `${basePath}&sub_action=${subActionId}` : basePath;
  try {
    const response: GenericResponse<ITemplateCommunication> = await API.get(url);
    return response.data;
  } catch (error) {
    console.error("Error getting template by event", error);
    throw error;
  }
};
