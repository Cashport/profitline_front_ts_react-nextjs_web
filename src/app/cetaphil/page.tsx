"use client";

import type React from "react";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Button } from "@cetaphilUI/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@cetaphilUI/card";
import { Input } from "@cetaphilUI/input";
import { Label } from "@cetaphilUI/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@cetaphilUI/dialog";
import { ShieldCheck } from "lucide-react";
import { RegistrationDialog, type RegistrationFormData } from "@/modules/cetaphil/components/registration-dialog";

import "@/modules/cetaphil/styles/cetaphilStyles.css";
import { acceptInvitation, AcceptInvitationRequest } from "@/services/cetaphil/acceptInvitation";
import { getDocumentTypeId } from "@/constants/documentTypes";

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

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Actualizar estados según el token
  useEffect(() => {
    const decodedToken = decoder(token || "");
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
  }, [token, decoder]);

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

  const handleSendMailLink = useCallback(
    async (e: React.FormEvent) => {
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
    },
    [loginEmail]
  );

  /*   const handleVerifyOTP = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const bearer = `Bearer ${token}`;
    await validateOtp(loginEmail, otp, bearer);
    setShowLogin(false);
  }, []); */

  const onSubmitRegister = useCallback(
    async (data: RegistrationFormData) => {
      try {
        setIsSubmitting(true);
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
      } catch (error: any) {
        console.error("Error:", error);
        showMessage("error", error.message || "Error al aceptar la invitación");
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, showMessage, decodedToken]
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
            <Button
              onClick={() => setShowRegister(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
              disabled={isLoadingLogin}
            >
              Solicitar Acceso
            </Button>
            <RegistrationDialog
              open={showRegister}
              onOpenChange={setShowRegister}
              onSubmit={onSubmitRegister}
              title="Solicitud de Registro"
              description="Complete el formulario para acceder al marketplace de distribuidores"
              submitButtonText="Crear mi cuenta"
              showReferralEmail={true}
              defaultValues={{
                email: decodedToken?.claims?.guestEmail || "",
                referralEmail: decodedToken?.claims?.userInvitingEmail || "",
              }}
              disabledFields={{
                email: !!decodedToken?.claims?.guestEmail,
                referralEmail: !!decodedToken?.claims?.userInvitingEmail,
              }}
              isSubmitting={isSubmitting}
            />
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
