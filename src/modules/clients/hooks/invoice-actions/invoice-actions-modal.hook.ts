import { useContext } from "react";
import { Calculator, Handshake } from "phosphor-react";
import { InvoiceAction } from "../../constants/invoice-actions.constants";
import { ClientDetailsContext } from "@/modules/clients/contexts/client-details-context";

export const useInvoiceActionsModal = () => {
  const { selectedOption, setSelectedOption } = useContext(ClientDetailsContext);

  const options = [
    {
      id: InvoiceAction.AccountingAdjustments,
      label: "Ajustes contables",
      icon: Calculator,
      subOptions: [
        {
          id: InvoiceAction.AccountingAdjustmentsGenerateCreditNote,
          label: "Generar nota crédito"
        },
        {
          id: InvoiceAction.AccountingAdjustmentsGenerateDiscount,
          label: "Generar descuento"
        },
        {
          id: InvoiceAction.AccountingAdjustmentsGenerateDebitNote,
          label: "Generar nota débito"
        }
      ]
    },
    {
      id: InvoiceAction.PaymentAgreement,
      label: "Acuerdo de pago",
      icon: Handshake,
      subOptions: [
        {
          id: InvoiceAction.PaymentAgreementGeneratePaymentAgreement,
          label: "Generar acuerdo de pago"
        },
        {
          id: InvoiceAction.PaymentAgreementGeneratePayment,
          label: "Generar pago"
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
