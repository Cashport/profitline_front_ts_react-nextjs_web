import { IUserForm, WelcomeData } from "@/types/users/IUser";
import { API } from "@/utils/api/api";
import { SUCCESS } from "@/utils/constants/globalConstants";
import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import { IGroupsByUser } from "@/types/clientsGroups/IClientsGroups";
import { MessageType } from "@/context/MessageContext";

export const getUserById = async (idUser: string): Promise<WelcomeData> => {
  try {
    const response: WelcomeData = await API.get(`/user/${idUser}`);

    return response;
  } catch (error) {
    return error as any;
  }
};

// create
export const inviteUser = async (
  data: IUserForm,
  selectedBusinessRules: ISelectedBussinessRules,
  selectedGroups: number[],
  zones: any,
  ID: any
): Promise<any> => {
  const modelData = {
    email: data.info.email,
    user_name: data.info.name,
    channel: selectedBusinessRules.channels,
    line: selectedBusinessRules.lines,
    subline: selectedBusinessRules.sublines,
    zone: zones,
    password: "123456",
    phone: data.info.phone,
    position: data.info.cargo,
    project_id: ID,
    rol_id: data.info.rol?.value,
    groups_id: selectedGroups
  };
  const endpointRole = data.info.rol?.value === 2 ? "admin" : "user";
  try {
    const response = await API.post(`/user/invitation/${endpointRole}/email`, modelData);
    return response;
  } catch (error) {
    console.error("error inviting user: ", error);
    throw error;
  }
};

export const createPassword = async (token: string, password: string): Promise<any> => {
  const modelData = {
    password: password,
    token: token
  };
  try {
    const response = await API.post(`/user/accept-invitation`, modelData);
    return response;
  } catch (error) {
    console.error("error creating password: ", error);
    throw error;
  }
};
//update
export const updateUser = async (
  data: IUserForm,
  selectedBusinessRules: ISelectedBussinessRules,
  selectedGroups: number[],
  zones: any,
  ID: any,
  project_id: number,
  isActive: boolean
): Promise<any> => {
  const modelData = {
    active: isActive ? 1 : 0,
    channel: selectedBusinessRules.channels,
    email: data.info.email,
    id: ID,
    line: selectedBusinessRules.lines,
    phone: data.info.phone,
    position: data.info.cargo,
    project_id: `${project_id}`,
    rol_id: data.info.rol?.value,
    subline: selectedBusinessRules.sublines,
    user_name: data.info.name,
    zones: zones.map((zone: number) => ({ ZONE_ID: zone })),
    groups_id: selectedGroups
  };

  try {
    const response = await API.put(`/user`, modelData);
    return response;
  } catch (error) {
    console.warn("error updating user: ", error);
    return error as any;
  }
};

export const onChangeStatusById = async (
  userId: number,
  isActive: 1 | 0,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void,
  onClose: () => void
) => {
  const modelData = {
    active: isActive
  };
  try {
    const response = await API.put(`/user/${userId}/user-change-status`, modelData);
    if (response.status === SUCCESS) {
      showMessage(
        "success",
        `El usuario fue ${isActive === 1 ? "activado" : "desactivado"} exitosamente.`
      );
      onClose();
    } else {
      onClose();
    }

    return response;
  } catch (error) {
    showMessage("error", "Oops ocurrio un error.");
    onClose();
    throw error;
  }
};

export const onRemoveUserById = async (
  idUser: number,
  idProject: number,
  // eslint-disable-next-line no-unused-vars
  showMessage: (type: MessageType, content: string) => void,
  onClose: () => void
): Promise<any> => {
  try {
    const response = await API.delete(`/user/id=${idUser}&project_id=${idProject}`);
    if (response.status === SUCCESS) {
      showMessage("success", "El usuario fue eliminado exitosamente.");
      onClose();
    } else {
      showMessage("error", "Oops ocurrio un error.");
      onClose();
    }

    return response;
  } catch (error) {
    showMessage("error", "Oops ocurrio un error.");
    onClose();
    throw error;
  }
};
export const onResendInvitationUser = async (email: string): Promise<any> => {
  try {
    const response = await API.post(`/user/invitation/resend`, { email });

    return response;
  } catch (error) {
    return error as any;
  }
};

export const deleteUsersById = async (users_id: number[], project_id: string): Promise<any> => {
  const modelData = {
    users: users_id,
    project_id
  };

  try {
    const response = await API.put(`/massive-action/user/delete`, modelData);

    return response;
  } catch (error) {
    console.warn("error deleting users: ", error);
    return error as any;
  }
};

export const resendInvitationUsers = async (users_id: number[]): Promise<any> => {
  const modelData = {
    users: users_id
  };

  try {
    const response = await API.post(`/massive-action/user/resend-invitation`, modelData);

    return response;
  } catch (error) {
    console.warn("error re-sending invite to users: ", error);
    throw error;
  }
};

export const getGroupsByUser = async (userID: number, projectID: number) => {
  try {
    const response: IGroupsByUser = await API.get(
      `/group-client/user/${userID}/project/${projectID}`
    );

    return response;
  } catch (error) {
    console.warn("error getting groups by user: ", error);
    return error as any;
  }
};
