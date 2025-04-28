import config from "@/config";
import { IContactOptions, ICreateEditContact, IGetContacts } from "@/types/contacts/IContacts";
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
  try {
    const response: genericResponse = await API.post(`${config.API_HOST}/client/contact`, contact);

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const putContact = async (
  contact: ICreateEditContact,
  contactId: number
): Promise<genericResponse> => {
  try {
    const response: genericResponse = await API.put(
      `${config.API_HOST}/client/contact/${contactId}`,
      contact
    );

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

export const deleteContact = async (
  contactsIds: { contacts_ids: number[] },
  clientId: string
): Promise<genericResponse> => {
  try {
    const customConfig = {
      data: contactsIds
    };

    const response: genericResponse = await API.delete(
      `${config.API_HOST}/client/${clientId}/contact`,
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
