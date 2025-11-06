import config from "@/config";
import { AcceptGuestDataDto } from "@/types/commerce/guest/acceptGuest.dto";
import axios from "axios";

export interface AcceptInvitationRequest {
  guestData: AcceptGuestDataDto;
  token: string;
}

export interface AcceptInvitationResponse {
  message: string;
  success: boolean;
}

export const acceptInvitation = async (
  data: AcceptInvitationRequest
): Promise<AcceptInvitationResponse> => {
  try {
    const response = (await axios.post(
      `${config.API_HOST}/marketplace-guest/accept-invitation`,
      data
    )) as any;
    return response;
  } catch (error) {
    console.error("Error accepting invitation:", error);
    throw error;
  }
};
