import axios from "axios";
import config from "@/config";
import { auth } from "../../../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNotificationStore } from "@/context/CountNotification";
export async function getIdToken(forceRefresh?: boolean) {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken(forceRefresh);
  } else {
    return new Promise((resolve, reject) => {
      onAuthStateChanged(auth, async (user) => {
        if (user) resolve(await user.getIdToken(forceRefresh));
        else reject(new Error("Token not found"));
      });
    });
  }
}

export let idProject: number | null = null;

const instance = axios.create({
  baseURL: config.API_HOST,
  timeout: 10000,
  headers: {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json; charset=utf-8"
  }
});

instance.interceptors.response.use(
  async (response) => {
    if (!response.config.url?.includes("/notification/count")) {
      try {
        await useNotificationStore.getState().updateNotificationCount();
      } catch (error) {
        console.error("Error updating notification count:", error);
      }
    }
    return response;
  },
  (error) => {
    console.error("Interceptor error:", error);
    return Promise.reject(error);
  }
);

interface IError {
  error: boolean;
  message: string;
}

export const fetcher = async (url: string) => {
  return instance
    .get(url)
    .then((res) => {
      if (!res.data) {
        throw Error(res.data.message);
      }

      return res.data;
    })
    .catch((error) => {
      if (error.code === "ECONNABORTED") {
        throw new Error("La solicitud ha sido cancelada debido a un timeout");
      } else {
        if (error.response?.data) {
          const errorData = error.response.data as IError;
          throw new Error(errorData.message);
        }
        if (error?.message) {
          throw new Error(error.message);
        }
        throw new Error("error");
      }
    });
};

const API = axios.create({
  responseType: "json",
  baseURL: config.API_HOST
});

// set ProjectId in instance
export const setProjectInApi = (projectId: number) => {
  idProject = projectId;
};
API.interceptors.request.use((request) => {
  request.headers.set("projectId", `${idProject}`);
  return request;
});
instance.interceptors.request.use((request) => {
  request.headers.set("projectId", `${idProject}`);
  return request;
});

// set tokens in instance
instance.interceptors.request.use(async (request) => {
  const token = (await getIdToken(false)) as string;
  request.headers.set("Authorization", `Bearer ${token}`);
  return request;
});

API.interceptors.request.use(async (request) => {
  request.headers.set("Accept", "application/json, text/plain, */*");
  if (!request?.url?.includes("/user/accept-invitation"))
    request.headers.set("Authorization", `Bearer ${await getIdToken()}`);
  return request;
});

API.interceptors.response.use(
  function (response) {
    if (typeof response.data === "string") return response.data;
    response.data.success = true;
    return response.data;
  },
  function (error) {
    error.success = false;
    const response = error.response;
    if (response?.data?.message) {
      error.message = response.data.message;
    }
    throw new ApiError(response?.status, error.message);
  }
);

export class ApiError extends Error {
  status: number;
  message: string;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.message = message;
  }
}

export { API };
export default instance;
