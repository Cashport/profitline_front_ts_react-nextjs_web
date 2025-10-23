"use client";

import React, { useEffect, useState } from "react";
import { Button, message, Spin, Input } from "antd";
import { getWompiSignature, sendWompiTransaction } from "@/services/paymentWeb/payment";
import type { IWompiSignatureResponse } from "@/services/paymentWeb/payment";
import config from "@/config";
declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

export const PaymentWebView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [amount, setAmount] = useState<number>(100000);
  const [displayAmount, setDisplayAmount] = useState("1000");
  const [orderId, setOrderId] = useState<string>("");

  useEffect(() => {
    if (window.WidgetCheckout) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.wompi.co/widget.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => message.error("No se pudo cargar el módulo de pagos. Intenta de nuevo.");
    document.body.appendChild(script);
  }, []);

  const handlePago = async () => {
    try {
      if (!scriptLoaded) {
        message.warning("El módulo de pago aún se está cargando...");
        return;
      }

      if (!orderId) {
        message.warning("Debes ingresar un Order ID antes de continuar con el pago");
        return;
      }

      const reference = `orden_${Date.now()}`;
      const currency = "COP";
      setLoading(true);

      const { integrity }: IWompiSignatureResponse = await getWompiSignature({
        reference,
        amount,
        currency
      });

      if (!integrity) throw new Error("No se pudo obtener la firma de seguridad");
      if (!window.WidgetCheckout) throw new Error("Wompi WidgetCheckout no está disponible");

      const checkout = new window.WidgetCheckout({
        currency,
        amountInCents: amount,
        reference,
        publicKey: config.API_WOMPI_PUBLIC_KEY,
        signature: { integrity },
        redirectUrl: `${window.location.origin}/payment-web`,
        customerData: {
          email: "usuario@example.com",
          fullName: "Carlos Ramírez",
          phoneNumber: "3001234567",
          phoneNumberPrefix: "+57"
        }
      });

      checkout.open(async (result: any) => {
        try {
          await sendWompiTransaction({ order_id: orderId, transaction: result.transaction });

          if (result.transaction?.status === "APPROVED") {
            message.success("Pago aprobado");
          } else {
            message.info(`Estado del pago: ${result.transaction?.status}`);
          }
        } catch {
          message.error("No se pudo registrar la transacción en el backend");
        }
      });
    } catch (error: any) {
      console.error("Error al iniciar el pago:", error);
      message.error(error.message || "Error al iniciar el pago");
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "");
    setDisplayAmount(value);
    setAmount(Number(value) * 100);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen gap-6">
      <h1 className="text-2xl font-semibold text-gray-800">Pago con Wompi</h1>

      <div className="flex gap-4">
        <Input
          type="number"
          min={1}
          placeholder="Valor en pesos"
          value={displayAmount}
          onChange={handleAmountChange}
          style={{ width: 120, textAlign: "center" }}
        />
        <Input
          type="text"
          placeholder="Order ID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          style={{ width: 200, textAlign: "center" }}
        />
      </div>

      <Button
        type="primary"
        size="large"
        onClick={handlePago}
        disabled={!scriptLoaded || loading || amount <= 0 || !orderId}
      >
        {loading ? <Spin /> : `Pagar $${displayAmount || 0} COP`}
      </Button>

      {!scriptLoaded && <p className="text-gray-500">Cargando módulo de pagos...</p>}
    </div>
  );
};

export default PaymentWebView;
