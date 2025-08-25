import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { IClientsGroup, IClientsGroupsFull } from "@/types/clientsGroups/IClientsGroups";
import { Key } from "react";

export const getOneGroup = async (groupId: number, projectId: number) => {
  try {
    const response: GenericResponse<IClientsGroup> = await API.get(
      `${config.API_HOST}/group-client/${groupId}/project/${projectId}`
    );
    return response;
  } catch (error) {
    return error as any;
  }
};

export const createGroup = async (
  data: {
    name: string;
    clients: Key[];
  },
  id: number
): Promise<any> => {
  const modelData = {
    name: data.name,
    clients: data.clients,
    project_id: id
  };

  try {
    const response = await API.post(`${config.API_HOST}/group-client`, modelData);
    return response;
  } catch (error) {
    return error as any;
  }
};

export const updateGroup = async (
  group_id: number,
  clients: string[],
  project_id: number
): Promise<any> => {
  const modelData = {
    group_id,
    clients,
    project_id
  };

  try {
    const response = await API.put(`${config.API_HOST}/group-client`, modelData);

    return response;
  } catch (error) {
    console.warn("error updating group: ", error);
    return error as any;
  }
};

export const deleteGroups = async (groupsId: number[], project_id: number): Promise<any> => {
  const modelData = {
    ids: groupsId,
    project_id
  };

  try {
    const response = await API.put(`${config.API_HOST}/group-client/delete`, modelData);

    return response;
  } catch (error) {
    return error as any;
  }
};

export const changeGroupState = async (
  groupsId: number[],
  status: 0 | 1,
  project_id: number
): Promise<any> => {
  const modelData = {
    groups_id: groupsId,
    project_id,
    status
  };

  try {
    const response = await API.put(`${config.API_HOST}/group-client/change-status`, modelData);

    return response;
  } catch (error) {
    return error as any;
  }
};

export const getClientGroups = async (): Promise<IClientsGroupsFull> => {
  try {
    const url = `/group-client/filter`;
    const response: IClientsGroupsFull = await API.get(url);
    return response;
  } catch (error) {
    return error as any;
  }
};
