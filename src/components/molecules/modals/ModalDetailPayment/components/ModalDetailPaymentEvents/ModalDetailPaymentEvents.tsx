import { FC, useState } from "react";
import { ArrowLineDown } from "phosphor-react";
import { Flex } from "antd";
import { useTranslations } from "use-intl";

import { useAppStore } from "@/lib/store/store";

import TimelineEvents from "@/components/ui/timeline-events";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal";

import { IEvent } from "@/types/banks/IBanks";

import styles from "./modalDetailPaymentEvents.module.scss";

interface ModalDetailPaymentProps {
  paymentEvents: IEvent[] | undefined;
  // eslint-disable-next-line no-unused-vars
  handleOpenPaymentDetail?: (paymentId: number) => void;
}

const ModalDetailPaymentEvents: FC<ModalDetailPaymentProps> = ({
  paymentEvents,
  handleOpenPaymentDetail
}) => {
  const t = useTranslations("modals.detailPayment.events");
  const formatMoney = useAppStore((state) => state.formatMoney);
  const [isModalFileDetailOpen, setIsModalFileDetailOpen] = useState<boolean>(false);
  const [urlStep, setUrlStep] = useState<string>("");

  const handleDocumentClick = (documentUrl: string) => {
    const fileExtension = documentUrl?.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg"].includes(fileExtension)) {
      setUrlStep(documentUrl);
      if (isModalFileDetailOpen === false) setIsModalFileDetailOpen(true);
    } else {
      window.open(documentUrl, "_blank");
    }
  };

  const items = paymentEvents?.map((event) => {
    const leftIcon =
      event.files && Array.isArray(event.files)
        ? {
            children: <ArrowLineDown size={14} />,
            onClick: () => {
              handleDocumentClick(event?.files[0] || "");
            }
          }
        : event.url_aplication_payment
          ? {
              children: <ArrowLineDown size={14} />,
              onClick: () => {
                handleDocumentClick(event?.url_aplication_payment || "");
              }
            }
          : undefined;

    const content = (
      <div className={styles.modalDetailPaymentEvents__eventContent}>
        {event.USER_NAME && (
          <p className={styles.regularEntry}>{t("owner", { name: event.USER_NAME })}</p>
        )}

        {event.id_payment_parent && (
          <Flex gap={"0.2rem"} wrap="wrap">
            <p className={styles.regularEntry}>{t("parentPaymentId")}</p>
            <p
              className={styles.linkEntry}
              onClick={() => {
                handleOpenPaymentDetail && handleOpenPaymentDetail(event.id_payment_parent);
              }}
            >
              {event.id_payment_parent}
            </p>
          </Flex>
        )}

        {event.client_name &&
          (event.payments_events_types_name === "Identificación" ||
            event.payments_events_types_name === "Identificación automática") && (
            <p className={styles.regularEntry}>{t("customer", { name: event.client_name })}</p>
          )}

        {event.previous_name_client && (
          <p className={styles.regularEntry}>
            {t("previousCustomer", { name: event.previous_name_client })}
          </p>
        )}
        {event.payments_events_types_name === "Cambio de cliente asignado" && (
          <p className={styles.regularEntry}>
            {t("newCustomer", { name: event.client_name ?? "" })}
          </p>
        )}

        {event.payments_events_types_name === "Aplicación de pagos" && (
          <>
            {event.id_aplication_payment && (
              <Flex gap={"0.2rem"} wrap="wrap">
                <p className={styles.regularEntry}>{t("applicationId")}</p>
                <p className={styles.linkEntry} style={{ cursor: "default" }}>
                  {event.id_aplication_payment}
                </p>
              </Flex>
            )}

            <p className={styles.regularEntry}>
              {t("appliedAmount", { amount: formatMoney(event.ammount_applied) })}
            </p>

            {event.ids_split_payment && (
              <Flex gap={"0.2rem"} wrap="wrap">
                <p className={styles.regularEntry}>{t("invoiceIds")}</p>

                {event.ids_split_payment?.map((id, index) => (
                  <p
                    key={id}
                    className={styles.linkEntry}
                    onClick={() => handleOpenPaymentDetail && handleOpenPaymentDetail(id)}
                  >
                    {id}
                    {event.ids_split_payment && index === event.ids_split_payment.length - 1
                      ? ""
                      : ","}
                  </p>
                ))}
              </Flex>
            )}
          </>
        )}

        {event.comments && (
          <p className={styles.regularEntry}>{t("comments", { comments: event.comments })}</p>
        )}
      </div>
    );

    const showTime =
      event.payments_events_types_name === "Identificación" ||
      event.payments_events_types_name === "Identificación automática";

    return {
      id: event.id,
      title: event.payments_events_types_name,
      date: showTime ? event.created_at : event.event_date,
      showTime,
      content,
      leftIcon
    };
  });

  return (
    <div className={styles.modalDetailPaymentEvents}>
      <h3 className={styles.modalDetailPaymentEvents__title}>{t("title")}</h3>
      <TimelineEvents events={items} />
      <InvoiceDownloadModal
        isModalOpen={isModalFileDetailOpen}
        handleCloseModal={setIsModalFileDetailOpen}
        title={urlStep.substring(0, urlStep.lastIndexOf("."))}
        url={urlStep}
      />
    </div>
  );
};

export default ModalDetailPaymentEvents;
