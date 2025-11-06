"use client";

import type React from "react";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@cetaphilUI/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@cetaphilUI/card";
import { Input } from "@cetaphilUI/input";
import { Label } from "@cetaphilUI/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@cetaphilUI/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@cetaphilUI/dialog";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import "@/modules/cetaphil/styles/cetaphilStyles.css";
import { acceptInvitation, AcceptInvitationRequest } from "@/services/cetaphil/acceptInvitation";
import { DOCUMENT_TYPES, getDocumentTypeId } from "@/constants/documentTypes";

// Static image imports for Next optimization
import cashportLogo from "@public/images/cetaphil/cashport-logo.png";
import galdermaLogo from "@public/images/cetaphil/galderma-logo.png";
import cetaphilBanner from "@public/images/cetaphil/cetaphil-banner.jpeg";
import cetaphilSerumsBanner from "@public/images/cetaphil/cetaphil-serums-banner.png";
import cetaphilCleanser from "@public/images/cetaphil/cetaphil-cleanser-bottle.jpg";
import cetaphilMoisturizer from "@public/images/cetaphil/cetaphil-moisturizer-bottle.jpg";
import cetaphilSunscreen from "@public/images/cetaphil/cetaphil-sunscreen-bottle.jpg";
import { useSearchParams } from "next/navigation";
import { useDecodeToken } from "@/hooks/useDecodeToken";
import { useMessageApi } from "@/context/MessageContext";
import { sendMailLink } from "@/services/externalAuth/externalAuth";
import axios from "axios";
import { useLoginCetaphil } from "@/hooks/useLoginCetaphil";

interface RegisterFormData {
  fullName: string;
  documentType: string;
  documentNumber: string;
  email: string;
  referralEmail: string;
  phone: string;
}

export default function CetaphilLanding() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { isLoading: isLoadingLogin } = useLoginCetaphil(token);
  const decoder = useDecodeToken();
  const decodedToken = decoder(token || "");
  const { showMessage } = useMessageApi();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);

  const [isLoading, setIsLoading] = useState(false);

  const banners = useMemo(() => [cetaphilBanner, cetaphilSerumsBanner], []);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset
  } = useForm<RegisterFormData>();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Actualizar los valores del formulario cuando cambien los valores por defecto
  useEffect(() => {
    const decodedToken = decoder(token || "");
    reset({
      email: decodedToken?.claims?.guestEmail || "",
      referralEmail: decodedToken?.claims?.userInvitingEmail || ""
    });
    const guestEmail = decodedToken?.claims?.guestEmail || "";
    if (guestEmail) {
      if (token && decodedToken?.claims?.mode === "invite") {
        setShowRegister(true);
        setLoginEmail(guestEmail);
      }
      if (token && decodedToken?.claims?.mode === "login") {
        setLoginEmail(guestEmail);
        setShowLogin(true);
      }
    }
  }, [token]);

  const handleLoginClose = useCallback((open: boolean) => {
    setShowLogin(open);
  }, []);

  /*   const handleSendOtpWithEmail = useCallback(async (email: string) => {
    try {
      const bearer = `Bearer ${token}`;
      await sendOtp(email, bearer);
      setLoginStep("otp");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        showMessage("error", (typeof message === "string" && message) || "Error al enviar el OTP");
      } else {
        showMessage("error", "Error desconocido");
      }
    }
  }, []); */

  /*   const handleSendOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendOtpWithEmail(loginEmail);
  }, []); */

  const handleSendMailLink = useCallback(async (e: React.FormEvent) => {
    try {
      console.log("Sending mail link to:", loginEmail);
      e.preventDefault();
      setIsLoading(true);
      await sendMailLink(loginEmail);
      showMessage(
        "success",
        "Enlace de correo enviado exitosamente. Revisa tu bandeja de entrada."
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const data = error.response?.data?.data;
        if (message === "Invalid params" && Array.isArray(data)) {
          const errorMessages = data.map((item: any) => item.msg).join(", ");
          showMessage("error", errorMessages);
        } else {
          showMessage(
            "error",
            (typeof message === "string" && message) || "Error al enviar el enlace de correo"
          );
        }
      }
    }
    setShowLogin(false);
  }, [loginEmail]);

  /*   const handleVerifyOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const bearer = `Bearer ${token}`;
    await validateOtp(loginEmail, otp, bearer);
    setShowLogin(false);
  }, []); */

  const onSubmitRegister = useCallback(
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

        setShowRegister(false);
        setShowLogin(true);
        reset();
      } catch (error: any) {
        console.error("Error:", error);
        showMessage("error", error.message || "Error al aceptar la invitación");
      }
    },
    [token, reset, showMessage]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/55 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col min-[550px]:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8 max-[549px]:self-start">
            <div className="flex items-center gap-4">
              <Image
                src={cashportLogo}
                alt="Cashport"
                width={120}
                height={32}
                className="!h-8 !w-auto"
                placeholder="blur"
              />
              <div className="h-6 w-px bg-border" />
              <Image
                src={galdermaLogo}
                alt="Galderma"
                width={120}
                height={28}
                className="!h-7 !w-auto -mb-[5px]"
                placeholder="blur"
              />
            </div>
          </div>
          <div className="flex items-center gap-3 max-[549px]:self-end">
            <Dialog open={showLogin} onOpenChange={handleLoginClose}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-foreground hover:text-primary"
                  disabled={isLoadingLogin}
                >
                  Iniciar Sesión
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    Iniciar Sesión
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Ingresa tu email para recibir un código de acceso
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSendMailLink} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium text-foreground">
                      Email
                    </Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="tu@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-[#CBE71E] hover:bg-[#CBE71E]/90 text-[#141414] font-medium"
                    disabled={isLoading}
                  >
                    Enviar Código
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showRegister} onOpenChange={setShowRegister}>
              <DialogTrigger asChild>
                <Button
                  className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
                  disabled={isLoadingLogin}
                >
                  Solicitar Acceso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-semibold text-foreground">
                    Solicitud de Registro
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Complete el formulario para acceder al marketplace de distribuidores
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4 py-4" onSubmit={handleSubmit(onSubmitRegister)}>
                  <div className="space-y-2">
                    <Label
                      htmlFor="nombre-apellido"
                      className="text-sm font-medium text-foreground"
                    >
                      Nombre y Apellido
                    </Label>
                    <Controller
                      name="fullName"
                      control={control}
                      rules={{ required: "Este campo es requerido" }}
                      render={({ field }) => (
                        <Input
                          id="nombre-apellido"
                          placeholder="Ingresa tu nombre"
                          {...field}
                          className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                        />
                      )}
                    />
                    {errors.fullName && (
                      <p className="text-xs text-red-500">{errors.fullName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo-documento" className="text-sm font-medium text-foreground">
                      Tipo de documento
                    </Label>
                    <Controller
                      name="documentType"
                      control={control}
                      rules={{ required: "Este campo es requerido" }}
                      render={({ field }) => (
                        <Select onValueChange={field.onChange} value={field.value}>
                          <SelectTrigger
                            id="tipo-documento"
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

                  <div className="space-y-2">
                    <Label htmlFor="documento" className="text-sm font-medium text-foreground">
                      N° de identificación
                    </Label>
                    <Controller
                      name="documentNumber"
                      control={control}
                      rules={{ required: "Este campo es requerido" }}
                      render={({ field }) => (
                        <Input
                          id="documento"
                          placeholder="Número de identificación"
                          {...field}
                          className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                        />
                      )}
                    />
                    {errors.documentNumber && (
                      <p className="text-xs text-red-500">{errors.documentNumber.message}</p>
                    )}
                  </div>

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
                          message: "Email inválido"
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          id="email"
                          type="email"
                          placeholder="Ingresa tu correo"
                          {...field}
                          disabled={!!decodedToken?.claims?.guestEmail}
                          className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      )}
                    />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="referral-email" className="text-sm font-medium text-foreground">
                      Correo electrónico de referido
                    </Label>
                    <Controller
                      name="referralEmail"
                      control={control}
                      rules={{
                        required: "Este campo es requerido",
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: "Email inválido"
                        }
                      }}
                      render={({ field }) => (
                        <Input
                          id="referral-email"
                          type="email"
                          placeholder="Ingresa tu correo"
                          {...field}
                          disabled={!!decodedToken?.claims?.userInvitingEmail}
                          className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        />
                      )}
                    />
                    {errors.referralEmail && (
                      <p className="text-xs text-red-500">{errors.referralEmail.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular" className="text-sm font-medium text-foreground">
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
                            id="celular"
                            type="tel"
                            placeholder="Ingresa tu celular"
                            {...field}
                            className="flex-1 bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                          />
                        )}
                      />
                    </div>
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-medium border-2 border-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Enviando..." : "Crear mi cuenta"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Banner Carousel */}
      <section className="relative overflow-hidden">
        <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
          {banners.map((banner, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={banner}
                alt={`Cetaphil Banner ${index + 1}`}
                fill
                className="object-cover object-center"
                priority={index === 0}
                placeholder="blur"
              />
            </div>
          ))}

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentBanner(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentBanner ? "bg-white w-8" : "bg-white/50"
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Badge */}
      <section className="py-8 bg-background flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-center">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">
            Marketplace Exclusivo para trabajadores de Galderma
          </span>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Productos <span className="text-primary">Cetaphil</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Línea completa de cuidado dermatológico para piel sensible
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                <Image
                  src={cetaphilCleanser}
                  alt="Limpiador Cetaphil"
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
                  placeholder="blur"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Limpiadores</CardTitle>
                <CardDescription>Limpieza suave para piel sensible</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                <Image
                  src={cetaphilMoisturizer}
                  alt="Humectante Cetaphil"
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
                  placeholder="blur"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Humectantes</CardTitle>
                <CardDescription>Hidratación profunda y duradera</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                <Image
                  src={cetaphilSunscreen}
                  alt="Protector Solar Cetaphil"
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
                  placeholder="blur"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">Protección Solar</CardTitle>
                <CardDescription>Protección UV para piel sensible</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="font-bold text-foreground">Cashport</span>
              <span className="text-muted-foreground">×</span>
              <span className="font-semibold text-primary">Cetaphil</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Marketplace Exclusivo para Distribuidores Autorizados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
