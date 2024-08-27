import axios, { AxiosResponse } from "axios";
import config from "@/config";
import { API } from "@/utils/api/api";
import { IFormGeneralUser, IListData } from "@/types/logistics/schema";
import { FileObject } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import { GenericResponse } from "@/types/global/IGlobal";
import { DocumentCompleteType } from "@/types/logistics/certificate/certificate";

export const getAllUsers = async ({ providerId }: { providerId: number }): Promise<any[]> => {
  const response: GenericResponse<any[]> = await API.get(`/User/provider/${providerId}`);
  if (response.success) return response.data;
  throw response;
};

export const getUserById = async (id: string): Promise<IListData> => {
  try {
    const response: IListData = await axios.get(`${config.API_HOST}/User/${id}`, {
      headers: {
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error get User: ", error);
    return error as any;
  }
};
export const createUserForm = (
  generalData: IFormGeneralUser,
  logo: FileObject[],
  files: DocumentCompleteType[]
) => {
  const form = new FormData();
  const body: any = generalData;
 
  body.logo = logo ? logo.map((file: any) => ({
    docReference: file.docReference,
    uid: file?.file?.uid,
  })): undefined

  const expiration = files.find(f=>!f.expirationDate && f.expiry);

  if(expiration){
    throw new Error(`El documento ${expiration.description} debe tener una fecha de vencimiento`);
  }

  body.files = files
  form.append("body", JSON.stringify({...body, rh: body.rhval as any}));
  logo && form.append("logo", logo[0].file as unknown as File);

  files.forEach((file) => {
    if (file.file) {
      form.append(`file-for-${file.id}`, file.file);
    } else {
      console.warn(`File with id ${file.id} is undefined.`);
    }
  });
  return form
}

export const updateUser = async (
  generalData: IFormGeneralUser,
  logo: FileObject[],
  files: DocumentCompleteType[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createUserForm(generalData, logo, files)
    const response = await axios.put(`${config.API_HOST}/User/update`, form, {
      headers: {
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error update User: ", error);
    return error as any;
  }
};

export const addUser = async (
  generalData: IFormGeneralUser,
  logo: FileObject[],
  files: DocumentCompleteType[]
): Promise<AxiosResponse<any, any>> => {
  try {
    const form = createUserForm(generalData, logo, files)
    const response = await axios.post(`${config.API_HOST}/User/create`, form, {
      headers: {
        "content-type": "multipart/form-data",
        Accept: "application/json, text/plain, */*"
      }
    });
    return response;
  } catch (error) {
    console.log("Error create User: ", error);
    throw error as any;
  }
};
