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
import "@/modules/cetaphil/styles/cetaphilStyles.css";

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
  title = "Solicitud de Registro",
  description = "Complete el formulario para acceder al marketplace de distribuidores",
  submitButtonText = "Crear mi cuenta",
  showReferralEmail = false,
  showEmail = true,
  defaultValues,
  disabledFields,
  isSubmitting = false
}) => {
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
          <DialogTitle className="text-xl font-semibold text-foreground">{title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-4 py-4" onSubmit={handleSubmit(handleFormSubmit)}>
          {/* Nombre y Apellido */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Nombre y Apellido
            </Label>
            <Controller
              name="fullName"
              control={control}
              rules={{
                required: "Este campo es requerido",
                minLength: {
                  value: 2,
                  message: "El nombre debe tener al menos 2 caracteres"
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="fullName"
                  placeholder="Ingresa tu nombre"
                  className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              )}
            />
            {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
          </div>

          {/* Tipo de documento */}
          <div className="space-y-2">
            <Label htmlFor="documentType" className="text-sm font-medium text-foreground">
              Tipo de documento
            </Label>
            <Controller
              name="documentType"
              control={control}
              rules={{ required: "Este campo es requerido" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger
                    id="documentType"
                    className="bg-white border-[#DDDDDD] focus:border-[#141414] focus:ring-0 focus:ring-offset-0 transition-colors w-full"
                  >
                    <SelectValue placeholder="Seleccione su tipo de identificación" />
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
              N° de identificación
            </Label>
            <Controller
              name="documentNumber"
              control={control}
              rules={{
                required: "Este campo es requerido",
                pattern: {
                  value: /^[0-9]+$/,
                  message: "Solo se permiten números"
                }
              }}
              render={({ field }) => (
                <Input
                  {...field}
                  id="documentNumber"
                  placeholder="Número de identificación"
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
                Correo electrónico
              </Label>
              <Controller
                name="email"
                control={control}
                rules={{
                  required: "Este campo es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="Ingresa tu correo"
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
                Correo electrónico de referido
              </Label>
              <Controller
                name="referralEmail"
                control={control}
                rules={{
                  required: "Este campo es requerido",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Correo electrónico inválido"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="referralEmail"
                    type="email"
                    placeholder="Ingresa el correo de referido"
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
              Celular
            </Label>
            <div className="flex gap-2">
              <div className="w-16 flex items-center justify-center border border-[#DDDDDD] rounded-md bg-[#F7F7F7] text-sm font-medium text-foreground">
                +57
              </div>
              <Controller
                name="phone"
                control={control}
                rules={{
                  required: "Este campo es requerido",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Debe contener 10 dígitos"
                  }
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="phone"
                    type="tel"
                    placeholder="Ingresa tu celular"
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
              {isSubmitting ? "Enviando..." : submitButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
