"use client";

import type React from "react";

import { useState, useEffect } from "react";
import Image from "next/image";
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

export default function CetaphilLanding() {
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [loginStep, setLoginStep] = useState<"email" | "otp">("email");
  const [loginEmail, setLoginEmail] = useState("");
  const [currentBanner, setCurrentBanner] = useState(0);
  const banners = [
    "/images/cetaphil/cetaphil-banner.jpeg",
    "/images/cetaphil/cetaphil-serums-banner.png"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const handleLoginClose = (open: boolean) => {
    setShowLogin(open);
    if (!open) {
      setLoginStep("email");
      setLoginEmail("");
    }
  };

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStep("otp");
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setShowLogin(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/55 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4">
              <Image
                src="/images/cetaphil/cashport-logo.png"
                alt="Cashport"
                width={120}
                height={32}
                className="!h-8 !w-auto"
              />
              <div className="h-6 w-px bg-border" />
              <Image
                src="/images/cetaphil/galderma-logo.png"
                alt="Galderma"
                width={120}
                height={28}
                className="!h-7 !w-auto -mb-[5px]"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={showLogin} onOpenChange={handleLoginClose}>
              <DialogTrigger asChild>
                <Button variant="ghost" className="text-foreground hover:text-primary">
                  Iniciar Sesión
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md bg-card">
                <DialogHeader className="space-y-2">
                  <DialogTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
                    {loginStep === "email" ? (
                      "Iniciar Sesión"
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setLoginStep("email")}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <ArrowLeft className="w-5 h-5" />
                        </button>
                        Verificar Código
                      </>
                    )}
                  </DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    {loginStep === "email"
                      ? "Ingresa tu email para recibir un código de acceso"
                      : `Ingresa el código enviado a ${loginEmail}`}
                  </DialogDescription>
                </DialogHeader>

                {loginStep === "email" ? (
                  <form onSubmit={handleSendOTP} className="space-y-4 py-4">
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
                        className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                      />
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#CBE71E] hover:bg-[#CBE71E]/90 text-[#141414] font-medium"
                    >
                      Enviar Código
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOTP} className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="otp-code" className="text-sm font-medium text-foreground">
                        Código OTP
                      </Label>
                      <Input
                        id="otp-code"
                        type="text"
                        placeholder="000000"
                        maxLength={6}
                        className="text-center text-2xl tracking-widest font-mono bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                        required
                      />
                      <p className="text-xs text-muted-foreground text-center">
                        Revisa tu correo electrónico
                      </p>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-[#CBE71E] hover:bg-[#CBE71E]/90 text-[#141414] font-medium"
                    >
                      Verificar e Ingresar
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full text-sm text-muted-foreground hover:text-foreground"
                      onClick={handleSendOTP}
                    >
                      ¿No recibiste el código? Reenviar
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
            <Dialog open={showRegister} onOpenChange={setShowRegister}>
              <DialogTrigger asChild>
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90 font-medium">
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
                <form className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="nombre-apellido"
                      className="text-sm font-medium text-foreground"
                    >
                      Nombre y Apellido
                    </Label>
                    <Input
                      id="nombre-apellido"
                      placeholder="Ingresa tu nombre"
                      required
                      className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo-documento" className="text-sm font-medium text-foreground">
                      Tipo de documento
                    </Label>
                    <Select>
                      <SelectTrigger
                        id="tipo-documento"
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="documento" className="text-sm font-medium text-foreground">
                      N° de identificación
                    </Label>
                    <Input
                      id="documento"
                      placeholder="Número de identificación"
                      required
                      className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">
                      Correo electrónico
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Ingresa tu correo"
                      required
                      className="bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular" className="text-sm font-medium text-foreground">
                      Celular
                    </Label>
                    <div className="flex gap-2">
                      <div className="w-16 flex items-center justify-center border border-[#DDDDDD] rounded-md bg-[#F7F7F7] text-sm font-medium text-foreground">
                        +57
                      </div>
                      <Input
                        id="celular"
                        type="tel"
                        placeholder="Ingresa tu celular"
                        required
                        className="flex-1 bg-white border-[#DDDDDD] focus:border-[#141414] focus-visible:ring-0 focus-visible:ring-offset-0 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      className="flex-1 bg-accent text-accent-foreground hover:bg-accent/90 font-medium border-2 border-accent"
                    >
                      Crear mi cuenta
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium"
                    >
                      Continuar
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
              key={banner}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentBanner ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={banner || "/placeholder.svg"}
                alt={`Cetaphil Banner ${index + 1}`}
                fill
                className="object-cover object-center"
                priority={index === 0}
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
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
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
                  src="/images/cetaphil/cetaphil-cleanser-bottle.jpg"
                  alt="Limpiador Cetaphil"
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
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
                  src="/images/cetaphil/cetaphil-moisturizer-bottle.jpg"
                  alt="Humectante Cetaphil"
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
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
                  src="/images/cetaphil/cetaphil-sunscreen-bottle.jpg"
                  alt="Protector Solar Cetaphil"
                  width={300}
                  height={300}
                  className="w-3/4 h-3/4 object-contain group-hover:scale-105 transition-transform"
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
