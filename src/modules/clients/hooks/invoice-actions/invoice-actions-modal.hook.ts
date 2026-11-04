import { useContext } from "react";
import { useTranslations } from "use-intl";
import { Calculator, Handshake } from "phosphor-react";
import { InvoiceAction } from "../../constants/invoice-actions.constants";
import { ClientDetailsContext } from "@/modules/clients/contexts/client-details-context";

export const useInvoiceActionsModal = () => {
  const { selectedOption, setSelectedOption } = useContext(ClientDetailsContext);
  const t = useTranslations("clients.invoiceActions.options");

  const options = [
    {
      id: InvoiceAction.AccountingAdjustments,
      label: t("accountingAdjustments"),
      icon: Calculator,
      subOptions: [
        {
          id: InvoiceAction.AccountingAdjustmentsGenerateCreditNote,
          label: t("generateCreditNote")
        },
        {
          id: InvoiceAction.AccountingAdjustmentsGenerateDiscount,
          label: t("generateDiscount")
        },
        {
          id: InvoiceAction.AccountingAdjustmentsGenerateDebitNote,
          label: t("generateDebitNote")
        }
      ]
    },
    {
      id: InvoiceAction.PaymentAgreement,
      label: t("paymentAgreement"),
      icon: Handshake,
      subOptions: [
        {
          id: InvoiceAction.PaymentAgreementGeneratePaymentAgreement,
          label: t("generatePaymentAgreement")
        },
        {
          id: InvoiceAction.PaymentAgreementGeneratePayment,
          label: t("generatePayment")
        }
      ]
    }
  ];

  const goToOptionId = (optionId: InvoiceAction) => {
    setSelectedOption(optionId);
  };

  return {
    options,
    selectedOption,
    goToOptionId
  };
};
