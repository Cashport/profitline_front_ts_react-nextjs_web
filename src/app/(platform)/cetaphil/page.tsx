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
import {
  RegistrationDialog,
  type RegistrationFormData
} from "@/modules/cetaphil/components/registration-dialog";
import "@/modules/cetaphil/styles/cetaphilStyles.css";
import {
  acceptInvitation,
  AcceptInvitationRequest,
  autoinviteGuest,
  AutoinviteRequest
} from "@/services/cetaphil/acceptInvitation";
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
import { useTranslations } from "use-intl";

export default function CetaphilLanding() {
  const t = useTranslations("publicPortals.cetaphil.landing");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { isLoading: isLoadingLogin, registerMode } = useLoginCetaphil(token);
  const decoder = useDecodeToken();
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const { showMessage } = useMessageApi();

  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
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
    setDecodedToken(decodedToken);
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
  }, []);

  const handleLoginClose = useCallback((open: boolean) => {
    setShowLogin(open);
  }, []);

  const handleSendMailLinkWithMail = async (loginEmail: string) => {
    try {
      setIsLoading(true);
      await sendMailLink(loginEmail);
      showMessage("success", t("mailLinkSent"));
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        const data = error.response?.data?.data;
        if (message === "Invalid params" && Array.isArray(data)) {
          const errorMessages = data.map((item: any) => item.msg).join(", ");
          showMessage("error", errorMessages);
        } else {
          showMessage("error", (typeof message === "string" && message) || t("mailLinkError"));
        }
      }
    }
    setShowLogin(false);
  };

  const handleSendMailLink = useCallback(
    async (e: React.FormEvent) => {
      console.log("Sending mail link to:", loginEmail);
      e.preventDefault();
      handleSendMailLinkWithMail(loginEmail);
    },
    [loginEmail, t]
  );

  const onSubmitRegister = useCallback(
    async (data: RegistrationFormData) => {
      try {
        setIsSubmitting(true);
        const documentTypeId = getDocumentTypeId(data.documentType);

        if (!documentTypeId) {
          showMessage("error", t("invalidDocumentType"));
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
        await handleSendMailLinkWithMail(data.email);
        setShowLogin(false);
        setShowRegisterSuccess(true);

        setShowRegister(false);
        setShowLogin(true);
      } catch (error: any) {
        console.error("Error:", error);
        showMessage("error", error.message || t("acceptInvitationError"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, showMessage, decodedToken, t]
  );

  const onSubmitRegisterAutoinvite = useCallback(
    async (data: RegistrationFormData) => {
      try {
        if (data.referralEmail === data.email) {
          showMessage("error", t("referralSameAsEmail"));
          return;
        }
        if (!data.referralEmail) {
          showMessage("error", t("referralRequired"));
          return;
        }
        setIsSubmitting(true);
        const documentTypeId = getDocumentTypeId(data.documentType);

        if (!documentTypeId) {
          showMessage("error", t("invalidDocumentType"));
          return;
        }

        const payload: AutoinviteRequest = {
          guestData: {
            document: data.documentNumber,
            documentType: documentTypeId,
            email: data.email,
            name: data.fullName,
            phoneNumber: data.phone,
            projectId: decodedToken?.claims?.projectId || 0,
            uuid: decodedToken?.claims?.uuid || "",
            referralEmail: data.referralEmail
          }
        };

        await autoinviteGuest(payload);
        setShowLogin(false);
        setShowRegisterSuccess(true);

        setShowRegister(false);
        setShowLogin(true);
      } catch (error: any) {
        console.error("Error:", error);
        showMessage("error", error.message || t("acceptInvitationError"));
      } finally {
        setIsSubmitting(false);
      }
    },
    [token, showMessage, decodedToken, t]
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
                  {t("signIn")}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    {t("signIn")}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {t("signInDescription")}
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
                      placeholder={t("emailPlaceholder")}
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
                    {t("sendCode")}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Dialog open={showRegisterSuccess} onOpenChange={setShowRegisterSuccess}>
              <DialogContent className="sm:max-w-md bg-card">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    {t("checkEmailTitle")}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {registerMode === "autoinvite" ? t("requestReceived") : t("accessLinkSent")}
                  </DialogDescription>
                </DialogHeader>

                {registerMode === "complete-invitation" && (
                  <form
                    onSubmit={(e: any) => {
                      e.preventDefault();
                    }}
                    className="space-y-4 py-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium text-foreground">
                        Email
                      </Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        value={loginEmail}
                        required
                        disabled={true}
                        className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                      />
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>
            <Button
              onClick={() => setShowRegister(true)}
              className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium"
              disabled={isLoadingLogin}
            >
              {t("requestAccess")}
            </Button>
            <RegistrationDialog
              open={showRegister}
              onOpenChange={setShowRegister}
              onSubmit={
                registerMode === "autoinvite" ? onSubmitRegisterAutoinvite : onSubmitRegister
              }
              title={t("registration.title")}
              description={t("registration.description")}
              submitButtonText={t("registration.submit")}
              showReferralEmail={!decodedToken?.claims?.userInvitingEmail ? true : false}
              showEmail={!decodedToken?.claims?.guestEmail ? true : false}
              defaultValues={{
                email: decodedToken?.claims?.guestEmail || "",
                referralEmail: decodedToken?.claims?.userInvitingEmail || ""
              }}
              disabledFields={{
                email: !!decodedToken?.claims?.guestEmail,
                referralEmail: !!decodedToken?.claims?.userInvitingEmail
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
                alt={t("bannerAlt", { number: index + 1 })}
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
                aria-label={t("goToBanner", { number: index + 1 })}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Marketplace Badge */}
      <section className="py-8 bg-background flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-center">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-600">{t("exclusiveBadge")}</span>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              {t.rich("productsTitle", {
                brand: (chunks) => <span className="text-primary">{chunks}</span>
              })}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("productsSubtitle")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                <Image
                  src={cetaphilCleanser}
                  alt={t("products.cleanserAlt")}
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
                  placeholder="blur"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{t("products.cleansers")}</CardTitle>
                <CardDescription>{t("products.cleansersDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                <Image
                  src={cetaphilMoisturizer}
                  alt={t("products.moisturizerAlt")}
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
                  placeholder="blur"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{t("products.moisturizers")}</CardTitle>
                <CardDescription>{t("products.moisturizersDescription")}</CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-border overflow-hidden group hover:border-primary/50 transition-all">
              <div className="aspect-square bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center relative">
                <Image
                  src={cetaphilSunscreen}
                  alt={t("products.sunscreenAlt")}
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
                  placeholder="blur"
                  loading="lazy"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{t("products.sunscreen")}</CardTitle>
                <CardDescription>{t("products.sunscreenDescription")}</CardDescription>
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
            <p className="text-sm text-muted-foreground">{t("footer")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
