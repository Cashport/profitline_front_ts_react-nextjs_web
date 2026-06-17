import config from "@/config";
import { API } from "@/utils/api/api";
import { GenericResponse } from "@/types/global/IGlobal";
import { getCorrectMimeType } from "@/utils/files/getCorrectMimeType";

export const uploadBalanceFile = async (
  balanceId: number,
  modelData: {
    financialDiscountMotiveId: number;
    observation: string;
    file: File;
  }
) => {
  const formData = new FormData();
  formData.append("financialDiscountMotiveId", String(modelData.financialDiscountMotiveId));
  formData.append("observation", modelData.observation);
  formData.append("file", getCorrectMimeType(modelData.file));

  try {
    const response: GenericResponse<any> = await API.patch(
      `${config.API_HOST}/financial-discount/balance/${balanceId}/classify-audit`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      }
    );
    return response;
  } catch (error) {
    throw error;
  }
};
