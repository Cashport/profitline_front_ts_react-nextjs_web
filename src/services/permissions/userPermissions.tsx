import { IUserPermissions } from "@/types/userPermissions/IUserPermissions";
import { STORAGE_TOKEN } from "@/utils/constants/globalConstants";
import { decodedClaims } from "../../../firebase";

export const getUserPermissions = async (): Promise<IUserPermissions> => {
  try {
    const token = localStorage.getItem(STORAGE_TOKEN);
    if (!token) {
      return {
        status: 401,
        message: "No token found",
        data: {
          permissions: [],
          id_user: 0,
          userName: "",
          preferences: {
            currency: "",
            id: ""
          }
        }
      };
    }
    const decoded = await decodedClaims(token);
    const response = {
      status: 200,
      message: "OK",
      data: decoded.permissions
    };

    return response;
  } catch (error) {
    return error as any;
  }
};
