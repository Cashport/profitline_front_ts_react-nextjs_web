import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { useMessageApi } from "@/context/MessageContext";
import { acceptInvitation, AcceptInvitationRequest } from "@/services/cetaphil/acceptInvitation";
import { getDocumentTypeId } from "@/constants/documentTypes";

export interface RegisterFormData {
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  referralEmail: string;
  phone: string;
}

export const useRegisterForm = (decodedToken: any) => {
  const { showMessage } = useMessageApi();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const defaultValues = useMemo(
    () => ({
      email: decodedToken?.claims?.guestEmail || "",
      referralEmail: decodedToken?.claims?.userInvitingEmail || ""
    }),
    [decodedToken?.claims?.guestEmail, decodedToken?.claims?.userInvitingEmail]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue
  } = useForm<RegisterFormData>({
    defaultValues
  });

  // Actualizar los valores del formulario cuando cambien los valores por defecto
  useEffect(() => {
    if (defaultValues.email) {
      setValue("email", defaultValues.email);
    }
    if (defaultValues.referralEmail) {
      setValue("referralEmail", defaultValues.referralEmail);
    }
  }, [defaultValues.email, defaultValues.referralEmail, setValue]);

  const onSubmit = useCallback(
    async (data: RegisterFormData) => {
      try {
        const documentTypeId = getDocumentTypeId(data.documentType);

        if (!documentTypeId) {
          showMessage("error", "Tipo de documento inválido");
          return;
        }

        const payload: AcceptInvitationRequest = {
          guestData: {
            document: data.documentNumber,
            documentType: documentTypeId,
            email: data.email,
            name: data.fullName,
            phoneNumber: data.phone,
            projectId: decodedToken?.claims?.projectId || 0,
            uuid: decodedToken?.claims?.uuid || ""
          },
          token: token || ""
        };

        await acceptInvitation(payload);
        
        showMessage("success", "Registro exitoso");
        reset();
      } catch (error: any) {
        console.error("Error:", error);
        showMessage("error", error.message || "Error al aceptar la invitación");
      }
    },
    [
      decodedToken?.claims?.guestEmail,
      decodedToken?.claims?.projectId,
      decodedToken?.claims?.uuid,
      token,
      reset,
      showMessage
    ]
  );

  return {
    register,
    handleSubmit,
    control,
    errors,
    isSubmitting,
    isEmailDisabled: !!decodedToken?.claims?.guestEmail,
    isReferralEmailDisabled: !!decodedToken?.claims?.userInvitingEmail,
    onSubmit
  };
};
