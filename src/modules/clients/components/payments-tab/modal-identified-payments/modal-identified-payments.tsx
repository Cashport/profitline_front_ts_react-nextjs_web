import { Dispatch, FC, SetStateAction, useState } from "react";
import { Radio } from "antd";
import { CaretLeft } from "phosphor-react";
import { useParams } from "next/navigation";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { extractSingleParam, formatDateDMY } from "@/utils/utils";
import { matchPayment } from "@/services/clientsPayments/clientsPayments";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import { DividerVerticalModal } from "@/components/atoms/DividerVertical/DividerVerticalModal";

import {
  IFormIdentifyPaymentModal,
  IIdentifiedPayment
} from "@/types/clientPayments/IClientPayments";

import styles from "./modal-identified-payments.module.scss";

interface ModalIdentifiedPaymentProps {
  setViewInfo: Dispatch<
    SetStateAction<{
      current: "form" | "identified" | "not_identified";
      paymentInfo: IFormIdentifyPaymentModal | undefined;
    }>
  >;
  paymentInfo: IFormIdentifyPaymentModal | undefined;
  identifiedPayments?: IIdentifiedPayment[];
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean, mutatePaymentsData?: boolean) => void;
}

const ModalIdentifiedPayment: FC<ModalIdentifiedPaymentProps> = ({
  setViewInfo,
  paymentInfo,
  identifiedPayments,
  onClose
}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { showMessage } = useMessageApi();
  const params = useParams();
  const clientId = extractSingleParam(params.clientId);
  const [loading, setLoading] = useState(false);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  const handleIdentifyPayments = async () => {
    setLoading(true);
    try {
      const identifiedPayment = identifiedPayments?.find(
        (payment) => payment.id === selectedPaymentId
      );

      if (!identifiedPayment || !paymentInfo || !clientId) {
        return;
      }
      await matchPayment({
        data: paymentInfo,
        paymentId: identifiedPayment.id,
        clientId
      });

      showMessage("success", "Pago identificado enviado correctamente!");
      onClose(false, true);
      setViewInfo((prev) => ({ ...prev, current: "form" }));
    } catch (error) {
      showMessage("error", "Ocurrió un error al identificar el pago");
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setViewInfo((prev) => ({ ...prev, current: "form" }));
  };

  return (
    <div className={styles.content}>
      <button className={styles.content__header} onClick={handleCancel}>
        <CaretLeft size={"1.25rem"} />
        <h4>Pagos identificados</h4>
      </button>
      <p className={styles.content__description}>Selecciona el pago que quieres aplicar</p>

      <Radio.Group
        className={styles.content__payments}
        onChange={(e) => setSelectedPaymentId(e.target.value)}
        value={selectedPaymentId}
      >
        {identifiedPayments?.map((payment) => (
          <Radio key={payment.id} value={payment.id} className={styles.paymentRadio}>
            <div className={styles.paymentContent}>
              <div className={styles.paymentContent__colorLabelContainer}>
                <DividerVerticalModal customStyles={{ width: "6px", margin: "8px 8px 8px 0px" }} />
              </div>
              <div className={styles.paymentContent__content}>
                <div className={styles.paymentContent__content__left}>
                  <h3 className={styles.paymentContent__content__name}>Pago {payment.id}</h3>
                  <p className={styles.paymentContent__content__date}>{payment.description}</p>
                  <p className={styles.paymentContent__content__client}>{payment.CLIENT_NAME}</p>
                </div>
                <h2 className={styles.paymentContent__content__amount}>
                  {formatMoney(payment.initial_value)}
                </h2>
              </div>
            </div>
          </Radio>
        ))}
      </Radio.Group>

      <div className={styles.footer}>
        <SecondaryButton onClick={handleCancel}>Cancelar</SecondaryButton>
        <PrincipalButton
          onClick={handleIdentifyPayments}
          disabled={selectedPaymentId === null}
          loading={loading}
        >
          Identificar
        </PrincipalButton>
      </div>
    </div>
  );
};

export default ModalIdentifiedPayment;
