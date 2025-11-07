"use client";

import React, { useEffect, useState, FC } from "react";
import { Modal, Spin, message } from "antd";
import { getWompiSignature, sendWompiTransaction } from "@/services/paymentWeb/payment";
import type { IWompiSignatureResponse } from "@/services/paymentWeb/payment";
import config from "@/config";

declare global {
  interface Window {
    WidgetCheckout?: any;
  }
}

interface IWompiModalProps {
  visible: boolean;
  onClose: (result?: any) => void;
  client: { name: string; email: string; phone: string; indicative: { value: string } };
  amountInCents: number;
  orderId: string;
}

const WompiModal: FC<IWompiModalProps> = ({ visible, onClose, client, amountInCents, orderId }) => {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

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

  const [checkoutOpened, setCheckoutOpened] = useState(false);

  useEffect(() => {
    if (!visible || !scriptLoaded || !client || amountInCents <= 0 || checkoutOpened) return;

    setCheckoutOpened(true);

    const startCheckout = async () => {
      setLoading(true);
      try {
        const reference = `orden_${orderId}_${Date.now()}`;
        const currency = "COP";

        const { integrity }: IWompiSignatureResponse = await getWompiSignature({
          reference,
          amount: amountInCents,
          currency
        });

        if (!integrity) throw new Error("No se pudo obtener la firma de seguridad");
        if (!window.WidgetCheckout) throw new Error("Wompi WidgetCheckout no está disponible");

        const checkout = new window.WidgetCheckout({
          currency,
          amountInCents,
          reference,
          publicKey: config.API_WOMPI_PUBLIC_KEY,
          signature: { integrity },
          redirectUrl: window.location.href,
          customerData: {
            email: client.email,
            fullName: client.name,
            phoneNumber: client.phone,
            phoneNumberPrefix: client.indicative.value
          }
        });

        checkout.open(async (result: any) => {
          try {
            await sendWompiTransaction({ order_id: orderId, transaction: result.transaction });
            onClose(result);
          } catch {
            message.error("No se pudo registrar la transacción en el backend");
            onClose();
          }
        });
      } catch (error: any) {
        message.error(error.message || "Error al iniciar el pago");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    startCheckout();
  }, [visible, scriptLoaded, client, amountInCents, orderId, onClose, checkoutOpened]);

  return (
    <Modal
      open={visible}
      onCancel={() => onClose()}
      footer={null}
      title="Procesando pago..."
      centered
      closable={!loading}
    >
      <div className="flex justify-center items-center p-4">
        <Spin size="large" />
      </div>
    </Modal>
  );
};

export default WompiModal;
