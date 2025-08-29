import { API } from "@/utils/api/api";
import config from "@/config";

import {
  ICreateProject,
  IProjectForFormData,
  IUpdateProjectData
} from "@/types/projects/ICreateProject";
import { IFormProject } from "@/types/projects/IFormProject";
import { GenericResponse } from "@/types/global/IGlobal";
import { IProject } from "@/types/projects/IProject";

export const addProject = async (data: IFormProject): Promise<ICreateProject> => {
  const currenciesFinal = data.general.currencies.map((currency) => ({
    id: currency.value,
    currency_name: currency.label
  }));
  const colorRgb = data.personalization.color.metaColor;
  const finalColorRgb = `rgb(${Math.trunc(colorRgb.r)},${Math.trunc(colorRgb.g)},${Math.trunc(colorRgb.b)})`;

  const billingPeriod = JSON.parse(data.general.billing_period);
  const finalData: IProjectForFormData = {
    logo: data.logo,
    project_description: data.general.name,
    rgb_config: finalColorRgb,
    nit: data.general.nit,
    email: data.contact.email,
    contact: data.contact.name,
    phone: data.contact.phone,
    address: data.general.address,
    country_id: data.general.country.value,
    currency: JSON.stringify(currenciesFinal),
    accept_date: data.general.accept_date === "Fecha de emisión" ? false : true,
    dso_days: data.general.DSO_days,
    dso_currenly_year: data.general.DSO_currenly_year === "Sí" ? true : undefined,
    name: data.general.name,
    position_contact: data.contact.position_contact,
    day_flag: billingPeriod.day_flag,
    day: billingPeriod.day_flag === "true" ? billingPeriod.day : undefined,
    order: billingPeriod.day_flag === "true" ? undefined : billingPeriod.order.toLowerCase(),
    day_of_week:
      billingPeriod.day_flag === "true" ? undefined : billingPeriod.day_of_week.toLowerCase()
  };
  const formData = new FormData();
  formData.append("logo", finalData.logo);
  formData.append("project_description", finalData.project_description);
  formData.append("rgb_config", finalData.rgb_config);
  formData.append("nit", finalData.nit);
  formData.append("email", finalData.email);
  formData.append("contact", finalData.contact);
  formData.append("phone", finalData.phone);
  formData.append("address", finalData.address);
  formData.append("country_id", finalData.country_id.toString());
  formData.append("currency", finalData.currency);
  formData.append("accept_date", finalData.accept_date.toString());
  if (finalData.dso_days) {
    formData.append("dso_days", finalData.dso_days.toString());
  }
  if (finalData.dso_currenly_year) {
    formData.append("dso_currenly_year", finalData.dso_currenly_year.toString());
  }
  formData.append("name", finalData.name);
  formData.append("position_contact", finalData.position_contact);
  formData.append("day_flag", finalData?.day_flag.toString());
  if (finalData.day) {
    formData.append("day", finalData.day.toString());
  }
  if (finalData.order) {
    formData.append("order", finalData.order);
  }
  if (finalData.day_of_week) {
    formData.append("day_of_week", finalData.day_of_week);
  }

  try {
    const response: ICreateProject = await API.post(`${config.API_HOST}/project`, formData);
    return response;
  } catch (error) {
    console.warn("error creating project: ", error);
    return error as any;
  }
};

export const updateProject = async (
  data: IFormProject,
  id: string,
  UUID: string
): Promise<ICreateProject> => {
  const currenciesFinal = data.general.currencies.map((currency) => ({
    id: currency.value,
    currency_name: currency.label
  }));
  const colorRgb = data.personalization.color.metaColor;
  const finalColorRgb = colorRgb
    ? `rgb(${Math.trunc(colorRgb.r)},${Math.trunc(colorRgb.g)},${Math.trunc(colorRgb.b)})`
    : data.personalization.color;

  const billingPeriod = JSON.parse(data.general.billing_period);
  const finalData: IUpdateProjectData = {
    id: id,
    is_active: true,
    project_description: data.general.name,
    rgb_config: finalColorRgb,
    logo: data.logo,
    nit: data.general.nit.trim(),
    email: data.contact.email.trim(),
    contact: data.contact.name.trim(),
    phone: data.contact.phone.trim(),
    address: data.general.address.trim(),
    country_id: data.general.country.value,
    currency: JSON.stringify(currenciesFinal),
    accept_date: data.general.accept_date !== "Fecha de emisión",
    dso_days: data.general.DSO_days,
    dso_currenly_year: data.general.DSO_currenly_year === "Sí" ? true : undefined,
    name: data.general.name.trim(),
    position_contact: data.contact.position_contact.trim(),
    day_flag: billingPeriod.day_flag === "true",
    day: billingPeriod.day_flag === "true" ? billingPeriod.day : undefined,
    order: billingPeriod.day_flag === "true" ? undefined : billingPeriod.order.toLowerCase(),
    day_of_week:
      billingPeriod.day_flag === "true" ? undefined : billingPeriod.day_of_week.toLowerCase()
  };

  const formData = new FormData();
  formData.append("id", id);
  formData.append("uuid", UUID);
  typeof finalData.logo !== "string" && formData.append("logo", finalData.logo);
  formData.append("project_description", finalData.project_description);
  formData.append("rgb_config", finalData.rgb_config);
  formData.append("nit", finalData.nit);
  formData.append("email", finalData.email);
  formData.append("contact", finalData.contact);
  formData.append("phone", finalData.phone);
  formData.append("address", finalData.address);
  formData.append("country_id", finalData.country_id.toString());
  formData.append("currency", finalData.currency);
  formData.append("accept_date", finalData.accept_date.toString());
  if (finalData.dso_days) {
    formData.append("dso_days", finalData.dso_days.toString());
  }
  if (finalData.dso_currenly_year) {
    formData.append("dso_currenly_year", finalData.dso_currenly_year.toString());
  }
  formData.append("name", finalData.name);
  formData.append("position_contact", finalData.position_contact);
  formData.append("day_flag", finalData?.day_flag.toString());
  if (finalData.day) {
    formData.append("day", finalData.day.toString());
  }
  if (finalData.order) {
    formData.append("order", finalData.order);
  }
  if (finalData.day_of_week) {
    formData.append("day_of_week", finalData.day_of_week);
  }

  try {
    const response: ICreateProject = await API.put(`${config.API_HOST}/project`, formData);

    return response;
  } catch (error) {
    console.warn("error updating project: ", error);
    return error as any;
  }
};
export const activateProject = async (id: string): Promise<any> => {
  try {
    const response = await API.put(`${config.API_HOST}/project/active/${id}`, {});

    return response;
  } catch (error) {
    throw error;
  }
};

export const desactiveProject = async (id: string): Promise<any> => {
  try {
    const response = await API.delete(`${config.API_HOST}/project/${id}`);
    return response;
  } catch (error) {
    console.warn("error desactivating project: ", error);
    throw error;
  }
};

export const getProjectDetails = async (id: string) => {
  try {
    const response: GenericResponse<IProject[]> = await API.get(`${config.API_HOST}/project/${id}`);
    return response.data[0];
  } catch (error) {
    console.warn("error getting project: ", error);
    throw error;
  }
};
export interface IGetCloseMonth {
  collection_period: string;
  start_date: string;
  end_date: string;
}

export const getCloseMonthByProject = async (projectId: number) => {
  try {
    const response: GenericResponse<IGetCloseMonth> = await API.get(
      `${config.API_HOST}/project/${projectId}/active-period`
    );
    return response.data;
  } catch (error) {
    console.error("error getting close month by project: ", error);
    throw error;
  }
};
