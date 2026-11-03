"use client";

import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@cetaphilUI/dialog";
import { Button } from "@cetaphilUI/button";
import { Input } from "@cetaphilUI/input";
import { Label } from "@cetaphilUI/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cetaphilUI/select";
import { DOCUMENT_TYPES } from "@/constants/documentTypes";
import { useTranslations } from "use-intl";

export interface RegistrationFormData {
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  referralEmail?: string;
  phone: string;
}

export interface RegistrationDialogProps {
  // Control del dialog
  open: boolean;
  onOpenChange: (open: boolean) => void;

  // Callback principal
  onSubmit: (data: RegistrationFormData) => void | Promise<void>;

  // Personalización del contenido
  title?: string;
  description?: string;
  submitButtonText?: string;

  // Campos opcionales
  showReferralEmail?: boolean;
  showEmail?: boolean;

  // Valores por defecto y estado disabled
  defaultValues?: Partial<RegistrationFormData>;
  disabledFields?: {
    email?: boolean;
    referralEmail?: boolean;
  };

  // Estado del formulario
  isSubmitting?: boolean;
}

export const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  description,
  submitButtonText,
  showReferralEmail = false,
  showEmail = true,
  defaultValues,
  disabledFields,
  isSubmitting = false
}) => {
  const t = useTranslations("publicPortals.cetaphil.registration");
  const tCommon = useTranslations("common");
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    defaultValues: {
      fullName: "",
      documentType: "",
      documentNumber: "",
      email: "",
      referralEmail: "",
      phone: "",
      ...defaultValues
    }
  });

  // Actualizar valores por defecto cuando cambien
  useEffect(() => {
    if (defaultValues) {
      reset({
        fullName: defaultValues.fullName || "",
        documentType: defaultValues.documentType || "",
        documentNumber: defaultValues.documentNumber || "",
        email: defaultValues.email || "",
        referralEmail: defaultValues.referralEmail || "",
        phone: defaultValues.phone || ""
      });
    }
  }, [defaultValues?.email, defaultValues?.referralEmail]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const handleFormSubmit = async (data: RegistrationFormData) => {
    await onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md bg-card">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl font-semibold text-foreground">
            {title ?? t("title")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description ?? t("description")}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 py-4" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Nombre y Apellido */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              {t("fullName")}
            </Label>
            <Controller
              name="fullName"
              control={control}
              rules={{
                required: tCommon("validation.required"),
                minLength: {
                  value: 2,
                  message: t("fullNameMinLength")
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="fullName"
                  placeholder={t("fullNamePlaceholder")}
                  className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              )}
            />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label htmlFor="documentType" className="text-sm font-medium text-foreground">
              {t("documentType")}
            </Label>
            <Controller
              name="documentType"
              control={control}
              rules={{ required: tCommon("validation.required") }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="documentType"
                    className="bg-white border-[#DDDDDD] focus:border-[#141414] focus:ring-0 focus:ring-offset-0 transition-colors w-full"
                  >
                    <SelectValue placeholder={t("documentTypePlaceholder")} />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {DOCUMENT_TYPES.map((docType) => (
                      <SelectItem key={docType.id} value={docType.value}>
                        {docType.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.documentType && (
              <p className="text-xs text-red-500">{errors.documentType.message}</p>
            )}
          </div>

          {/* N° de identificación */}
          <div className="space-y-2">
            <Label htmlFor="documentNumber" className="text-sm font-medium text-foreground">
              {t("documentNumber")}
            </Label>
            <Controller
              name="documentNumber"
              control={control}
              rules={{
                required: tCommon("validation.required"),
                pattern: {
                  value: /^[0-9]+$/,
                  message: t("onlyNumbers")
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="documentNumber"
                  placeholder={t("documentNumberPlaceholder")}
                  className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              )}
            />
            {errors.documentNumber && (
              <p className="text-xs text-red-500">{errors.documentNumber.message}</p>
            )}
          </div>

          {/* Correo electrónico */}
          {showEmail && (
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                {tCommon("fields.email")}
              </Label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: tCommon("validation.required"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: tCommon("validation.invalidEmail")
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder={t("emailPlaceholder")}
                    disabled={disabledFields?.email}
                    className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                )}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>
          )}

          {/* Correo electrónico de referido (condicional) */}
          {showReferralEmail && (
            <div className="space-y-2">
              <Label htmlFor="referralEmail" className="text-sm font-medium text-foreground">
                {t("referralEmail")}
              </Label>
              <Controller
                name="referralEmail"
                control={control}
                rules={{
                  required: tCommon("validation.required"),
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: tCommon("validation.invalidEmail")
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="referralEmail"
                    type="email"
                    placeholder={t("referralEmailPlaceholder")}
                    disabled={disabledFields?.referralEmail}
                    className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                )}
              />
              {errors.referralEmail && (
                <p className="text-xs text-red-500">{errors.referralEmail.message}</p>
              )}
            </div>
          )}

          {/* Celular */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-foreground">
              {t("phone")}
            </Label>
            <div className="flex gap-2">
              <div className="w-16 flex items-center justify-center border border-[#DDDDDD] rounded-md bg-[#F7F7F7] text-sm font-medium text-foreground">
                +57
              </div>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: tCommon("validation.required"),
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: t("phoneDigits", { count: 10 })
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="phone"
                    type="tel"
                    placeholder={t("phonePlaceholder")}
                    className="flex-1 bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                  />
                )}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>

          {/* Botón de acción */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-medium border-2 border-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? tCommon("status.sending") : submitButtonText ?? t("submit")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
