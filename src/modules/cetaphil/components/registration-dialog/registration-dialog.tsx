"use client";

import React from "react";
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

import "@/modules/cetaphil/styles/cetaphilStyles.css";

export interface RegistrationFormData {
  fullName: string;
  documentType: "cc" | "ce" | "nit" | "pasaporte";
  documentNumber: string;
  email: string;
  phone: string;
}

export interface RegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateAccount: (data: RegistrationFormData) => void;
  onContinue: (data: RegistrationFormData) => void;
  title?: string;
  description?: string;
  createButtonText?: string;
  continueButtonText?: string;
}

export const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  open,
  onOpenChange,
  onCreateAccount,
  onContinue,
  title = "Solicitud de Registro",
  description = "Complete el formulario para acceder al marketplace de distribuidores",
  createButtonText = "Crear mi cuenta",
  continueButtonText = "Continuar"
}) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<RegistrationFormData>({
    defaultValues: {
      fullName: "",
      documentType: "cc",
      documentNumber: "",
      email: "",
      phone: ""
    }
  });

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      reset();
    }
    onOpenChange(newOpen);
  };

  const handleCreateAccount = (data: RegistrationFormData) => {
    onCreateAccount(data);
  };

  const handleContinue = (data: RegistrationFormData) => {
    onContinue(data);
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
        <form className="space-y-4 py-4">
          {/* Nombre y Apellido */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Nombre y Apellido
            </Label>
            <Controller
              name="fullName"
              control={control}
              rules={{
                required: "El nombre es requerido",
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
              rules={{ required: "El tipo de documento es requerido" }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger
                    id="documentType"
                    className="bg-white border-[#DDDDDD] focus:border-[#141414] focus:ring-0 focus:ring-offset-0 transition-colors w-full"
                  >
                    <SelectValue placeholder="Seleccione su tipo de identificación" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="cc">Cédula de Ciudadanía</SelectItem>
                    <SelectItem value="ce">Cédula de Extranjería</SelectItem>
                    <SelectItem value="nit">NIT</SelectItem>
                    <SelectItem value="pasaporte">Pasaporte</SelectItem>
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
                required: "El número de identificación es requerido",
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
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Correo electrónico
            </Label>
            <Controller
              name="email"
              control={control}
              rules={{
                required: "El correo electrónico es requerido",
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
                  className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                />
              )}
            />
            {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
          </div>

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
                  required: "El celular es requerido",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Debe tener 10 dígitos"
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

          {/* Botones de acción */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={handleSubmit(handleCreateAccount)}
              className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-medium border-2 border-accent"
            >
              {createButtonText}
            </Button>
            <Button
              type="button"
              onClick={handleSubmit(handleContinue)}
              variant="secondary"
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium"
            >
              {continueButtonText}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
