"use client";
import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Flex, message } from "antd";
import { PencilSimpleLine } from "@phosphor-icons/react";

import { signInWithCustomToken } from "@firebase/auth";
import { auth } from "../../../../../firebase";
import { getClientWallet } from "@/services/clients/clients";

import MobileNavBar from "../../components/atoms/MobileNavBar/MobileNavBar";
import PendingInvoiceCard from "../../components/PendingInvoiceCard/PendingInvoiceCard";
import PaymentSummaryCard from "../../components/PaymentSummaryCard/PaymentSummaryCard";
import MobileLoader from "../../components/Loader/MobileLoader";
import ErrorMobile from "../../components/ErrorView/ErrorMobile";

import { IClientWalletData } from "@/types/clients/IClients";

import "./mobileConfirmPayment.scss";
import { formatCurrencyMoney } from "@/utils/utils";

const MobileConfirmPayment: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");
  const paymentLink = searchParams.get("payment_link");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<IClientWalletData | null>(null);

  useEffect(() => {
    if (!token || !paymentLink) {
      setError("Información de pago incompleta o inválida.");
      setLoading(false);
      return;
    }

    signInAndGetWallet(token);
  }, [token, paymentLink]);

  const signInAndGetWallet = async (token: string) => {
    setLoading(true);
    setError(null);

    try {
      const res = await signInWithCustomToken(auth, token);
      const idToken = await res.user.getIdToken();
      const walletData = await getClientWallet(idToken);

      // Validación extra de seguridad
      if (!walletData?.payment_link) {
        throw new Error("Link de pago inválido");
      }

      setData(walletData);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar la información del pago.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push(`/mobile?token=${encodeURIComponent(token || "")}`);
  };

  const handleModifyPayment = () => {
    router.push(
      `/mobile/confirmPayment/modify?token=${encodeURIComponent(
        token || ""
      )}`
    );
  };

  if (loading) return <MobileLoader />;
  if (error) return <ErrorMobile message={error} />;

  return (
    <MobileNavBar title="Detalles del pago" onBack={handleGoBack}>
      <Flex vertical gap="2rem" className="mobileConfirmPayment">
        <PaymentSummaryCard
          billed={data?.total_debt || 0}
          discount={data?.early_payment_discount || 0}
          total={data?.total_to_pay || 0}
          paymentLink={data?.payment_link}
        />

        <Flex vertical gap="1rem">
          <h4 className="mobileConfirmPayment__title">Facturas incluidas</h4>

          <Flex vertical gap="0.5rem">
            {(data?.invoices_list || []).map((invoice, index) => (
              <PendingInvoiceCard
                key={index}
                invoice={{
                  id: index.toString(),
                  code: invoice.invoice,
                  date: invoice.expiration_date,
                  status: invoice.status as any,
                  isPastDue: invoice.status === "Vencida",
                  formattedAmount: formatCurrencyMoney(invoice.value),
                }}
                isInteractive={false}
              />
            ))}
          </Flex>

          <button
            className="mobileConfirmPayment__modifyButton"
            onClick={handleModifyPayment}
          >
            Modificar pago
            <PencilSimpleLine size={14} />
          </button>
        </Flex>
      </Flex>
    </MobileNavBar>
  );
};

export default MobileConfirmPayment;
