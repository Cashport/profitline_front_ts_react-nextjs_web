import config from "@/config";
import {
  IContact,
  IContactOptions,
  ICreateEditContact,
  IGetContacts
} from "@/types/contacts/IContacts";
import { GenericResponse } from "@/types/global/IGlobal";
import { API } from "@/utils/api/api";

interface genericResponse {
  status: number;
  message: string;
}

export const getContact = async (clientId: string, contactId: number): Promise<IGetContacts> => {
  try {
    const response: IGetContacts = await API.get(
      `${config.API_HOST}/client/${clientId}/contact/${contactId}`
    );

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const postContact = async (contact: ICreateEditContact): Promise<genericResponse> => {
  const response: genericResponse = await API.post(`/client/contact`, contact);

  return response;
};

export const putContact = async (
  contact: ICreateEditContact,
  contactId: number
): Promise<genericResponse> => {
  const response: genericResponse = await API.put(`/client/contact/${contactId}`, contact);

  return response;
};

export const deleteContact = async (
  contactsIds: { contacts_ids: number[] },
  clientId: string,
  projectId: number
): Promise<genericResponse> => {
  try {
    const customConfig = {
      data: contactsIds
    };

    const response: genericResponse = await API.delete(
      `${config.API_HOST}/client/${clientId}/contact/project/${projectId}`,
      customConfig
    );

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const getContactOptions = async (): Promise<IContactOptions> => {
  try {
    const response: GenericResponse<IContactOptions> = await API.get(
      `${config.API_HOST}/client/contact/options`
    );

    return response.data;
  } catch (error) {
    throw Promise.reject(error);
  }
};

export const getContactByClientId = async (clientId: string): Promise<IContact[]> => {
  try {
    const response: GenericResponse<IContact[]> = await API.get(
      `${config.API_HOST}/client/${clientId}/contact`
    );

    return response.data;
  } catch (error) {
    throw Promise.reject(error);
  }
};
