import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import {
  IMonitoringSubscription,
  IMonitoringSubscriptionInput,
  MonitoringTestResult
} from "../types/monitoring";

const BASE = `${config.API_HOST}/data/monitoring/subscriptions`;

export const saveMonitoringSubscription = async (
  input: IMonitoringSubscriptionInput
): Promise<IMonitoringSubscription> => {
  const response: GenericResponse<IMonitoringSubscription> = await API.post(BASE, input);
  return response.data;
};

export const deleteMonitoringSubscription = async (id: number): Promise<void> => {
  await API.delete(`${BASE}/${id}`);
};

export const sendMonitoringTest = async (id: number): Promise<MonitoringTestResult> => {
  const response: GenericResponse<MonitoringTestResult> = await API.post(`${BASE}/${id}/test`, {});
  return response.data;
};
