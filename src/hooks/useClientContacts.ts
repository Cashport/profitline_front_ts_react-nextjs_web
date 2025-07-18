import { MessageType } from "@/context/MessageContext";
import { deleteContact, postContact, putContact } from "@/services/contacts/contacts";
import { IContactForm, IGetContacts } from "@/types/contacts/IContacts";
import { fetcher } from "@/utils/api/api";
import useSWR from "swr";

export const useClientContacts = (clientId: string) => {
  const { data, isLoading, mutate } = useSWR<IGetContacts>(
    `client/${clientId}/contact`,
    fetcher,
    {}
  );

  const createContact = async (
    contactInfo: IContactForm,
    // eslint-disable-next-line no-unused-vars
    showMessage: (type: MessageType, content: string) => void
  ) => {
    const contact = {
      clientUUID: clientId,
      contact_name: contactInfo.name,
      contact_lastname: contactInfo.lastname,
      contact_email: contactInfo.email,
      contact_phone: contactInfo.phone,
      position: contactInfo.role.value,
      name_position: contactInfo.position,
      country_calling_code_id: contactInfo.indicative.value
    };

    try {
      const response = await postContact(contact);
      if (response.status === 200) {
        showMessage("success", "Contacto creado exitosamente");
      }
    } catch (error) {
      showMessage("error", "Error al crear contacto");
      console.warn("Error al crear contacto", error);
    } finally {
      mutate();
    }
  };

  const updateContact = async (
    contactInfo: IContactForm,
    contactId: number,
    // eslint-disable-next-line no-unused-vars
    showMessage: (type: MessageType, content: string) => void
  ) => {
    const contact = {
      clientUUID: clientId,
      contact_name: contactInfo.name,
      contact_lastname: contactInfo.lastname,
      contact_email: contactInfo.email,
      contact_phone: contactInfo.phone,
      position: contactInfo.role.value,
      name_position: contactInfo.position,
      country_calling_code_id: contactInfo.indicative.value
    };

    try {
      const response = await putContact(contact, contactId);
      if (response.status === 200) {
        showMessage("success", "Contacto actualizado exitosamente");
      }
    } catch (error) {
      showMessage("error", "Error al actualizar contacto");
      console.warn("Error al actualizar contacto", error);
    } finally {
      mutate();
    }
  };

  const deleteSelectedContacts = async (
    contactsIds: number[],
    // eslint-disable-next-line no-unused-vars
    showMessage: (type: MessageType, content: string) => void
  ) => {
    const formattedIds = { contacts_ids: contactsIds };

    try {
      const response = await deleteContact(formattedIds, clientId);
      if (response.status === 200) {
        showMessage("success", "Contactos eliminados exitosamente");
      }
    } catch (error) {
      showMessage("error", "Error al eliminar contactos");
      console.warn("Error al eliminar contactos", error);
    } finally {
      mutate();
    }
  };

  return {
    data,
    isLoading,
    createContact,
    updateContact,
    deleteSelectedContacts
  };
};
