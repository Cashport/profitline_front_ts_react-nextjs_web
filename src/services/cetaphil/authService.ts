import axios from "axios";
import { getIdTokenWithToken } from "../../../firebase-utils";

export const loginCetaphil = async (token: string) => {
  try {
    /* fetch("/api/auth", {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${token}`,
                    tokenExm: `${JSON.stringify(userCred)}`
                  }
                }).then(async (response) => {
                  const data = await response.json();
                  if (response.status === 200) {
                    localStorage.setItem(STORAGE_TOKEN, data.data.token);
                    router.push("/clientes/all");
                  }
                }); */
    const idToken = await getIdTokenWithToken(token);
    const response = axios.post(
      "/api/auth",
      {},
      {
        headers: {
          Authorization: `Bearer ${await idToken?.user.getIdToken()}`
        }
      }
    );
    return response;
  } catch (error) {
    console.error("Error in authCetaphil:", error);
    throw error;
  }
};
