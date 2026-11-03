import { FC, useState } from "react";
import {
  ArrowLineDown,
  CaretDoubleRight,
  DotsThree,
  Envelope,
  Minus,
  Plus,
  Receipt
} from "phosphor-react";
import { Button } from "antd";
import { useTranslations } from "use-intl";

import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";
import { useInvoiceDetail } from "@/hooks/useInvoiceDetail";
import { formatDatePlane } from "@/utils/utils";

import InvoiceDownloadModal from "../../components/invoice-download-modal";
import StepperContentSkeleton from "./skeleton/skeleton-invoid-detail";
import { ModalAgreementDetail } from "@/components/molecules/modals/ModalAgreementDetail/ModalAgreementDetail";

import { IInvoice } from "@/types/invoices/IInvoices";

import styles from "./invoice-detail-modal.module.scss";

interface InvoiceDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  clientId: string;
  showId: string;
  hiddenActions?: boolean;
  // eslint-disable-next-line no-unused-vars
  handleActionInDetail?: (invoice: IInvoice) => void;
  selectInvoice?: IInvoice;
  projectId?: number;
  deselectInvoices?: () => void;
}

const InvoiceDetailModal: FC<InvoiceDetailModalProps> = ({
  isOpen,
  onClose,
  showId,
  invoiceId,
  clientId,
  hiddenActions,
  projectId = 0,
  selectInvoice,
  handleActionInDetail,
  deselectInvoices
}) => {
  const t = useTranslations("clients.invoiceDetail");
  const tCommon = useTranslations("common");
  const formatMoney = useAppStore((state) => state.formatMoney);

  const {
    data: invoiceData,
    loading,
    mutate
  } = useInvoiceDetail({ invoiceId, clientId, projectId });
  const [urlStep, setUrlStep] = useState<string | undefined>(undefined);
  const [isModalPaymentAgreementOpen, setIsModalPaymentAgreementOpen] = useState({
    isOpen: false,
    incident_id: 0
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const { openModal } = useModalDetail();
  const statusClass = (status: string): string => {
    switch (status) {
      case "Identificado" || "coinciliada":
        return styles.identifiedReconciled;
      case "En auditoría":
        return styles.inAudit;
      case "No identificado":
        return styles.unidentified;
      case "aplicacion":
        return styles.applied;
      case "Ap. parcialmente":
        return styles.partially;
      case "sin conciliar":
        return styles.noReconcile;
      case "novedades":
        return styles.novelty;
      case "saldo":
        return styles.balances;
      case "glosado":
        return styles.glossed;
      case "devolucion":
        return styles.return;
      case "vencida":
        return styles.annulment;
      default:
        return "";
    }
  };
  // event_type_name llega del backend en español: se muestra con su etiqueta traducida
  const getEventTitle = (item: string) => {
    switch (item) {
      case "Generar nota de credito":
        return t("events.creditNoteApplied");
      case "Generar nota de debito":
        return t("events.debitNoteApplied");
      case "Generar descuento":
        return t("events.discountApplied");
      case "Radicar factura":
        return t("events.submission");
      case "Registrar novedad":
        return t("events.newDispute");
      case "Emision de factura":
        return t("events.invoiceIssued");
      case "Cierre de novedad":
        return t("events.disputeClosed");
      case "Acuerdo de pago":
        return t("events.paymentAgreement");
      case "Vencimiento acuerdo de pago":
        return t("events.paymentAgreementExpired");
      case "Aviso de vencimiento":
        return t("events.dueNotice");
      case "Cambiar estado":
        return t("events.statusChanged");
      case "Factura conciliada":
        return t("events.invoiceReconciled");
      case "Pago aplicado":
        return t("events.paymentApplied");
      case "Pago parcial":
        return t("events.partialPayment");
      case "Saldo Confirmado":
        return t("events.balanceConfirmed");
      default:
        return item;
    }
  };

  const handleDocumentClick = (documentUrl: string) => {
    const fileExtension = documentUrl?.split(".").pop()?.toLowerCase() ?? "";
    if (["png", "jpg", "jpeg"].includes(fileExtension)) {
      setUrlStep(documentUrl);
      if (isModalOpen === false) setIsModalOpen(true);
    } else {
      window.open(documentUrl, "_blank");
    }
  };
  const handelOpenAdjusmentDetail = (adjusmentId: number) => {
    openModal("adjustment", {
      adjusmentId: adjusmentId,
      clientId: clientId,
      projectId
    });
  };
  const handelOpenNoveltyDetail = (noveltyId: number) => {
    // deselect invoices in wallet tab
    openModal("novelty", { noveltyId: noveltyId, deselectInvoices });
  };

  return (
    <aside className={`${styles.wrapper} ${isOpen ? styles.show : styles.hide}`}>
      <InvoiceDownloadModal
        isModalOpen={isModalOpen}
        handleCloseModal={setIsModalOpen}
        title={t("image")}
        url={urlStep}
      />
      <div>
        <div className={styles.modalTopSide}>
          <button type="button" className={styles.back} onClick={onClose}>
            <CaretDoubleRight />
          </button>
        </div>
        <div className={styles.header}>
          <h4 className={styles.numberInvoice}>{t("title", { id: showId })}</h4>
          <div className={styles.viewInvoice}>
            <Receipt size={20} />
            {t("viewInvoice")}
          </div>
          {hiddenActions ? null : (
            <Button
              className={styles.button__actions}
              size="large"
              icon={<DotsThree size={"1.5rem"} />}
              onClick={() => {
                mutate();
                handleActionInDetail?.(selectInvoice!);
              }}
            >
              {t("generateAction")}
            </Button>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.headerBody}>
            <div className={styles.title}>{t("traceability")}</div>
            <div
              className={`${styles.status} ${statusClass(invoiceData ? invoiceData?.results[0]?.status_name : "")}`}
            >
              {invoiceData ? invoiceData?.results[0]?.status_name : ""}
            </div>
          </div>
          <div className={styles.content}>
            <div className={styles.progress}></div>
            <div className={styles.description}>
              <div className={styles.stepperContainer}>
                <div className={styles.stepperContent}>
                  {loading ? (
                    <StepperContentSkeleton />
                  ) : (
                    (invoiceData?.results ?? []).map((item, index, arr) => {
                      return (
                        <div key={item.id} className={styles.mainStep}>
                          <div
                            className={`${styles.stepLine} ${index === arr.length - 1 ? styles.inactive : styles.active}`}
                          />
                          <div className={`${styles.stepCircle} ${styles.active}`} />
                          <div className={styles.stepLabel}>
                            <div className={styles.cardInvoiceFiling}>
                              <h5
                                className={
                                  item.event_type_name === "Vencimiento acuerdo de pago"
                                    ? styles.title_red
                                    : styles.title
                                }
                              >
                                {getEventTitle(item.event_type_name)}
                                {"  "}
                                {(item.event_type_name === "Generar nota de credito" ||
                                  item.event_type_name === "Generar nota de debito") && (
                                  <span
                                    className={`${styles.tagLabel} ${item.is_legalized === 1 ? styles.tagLabelGreen : styles.tagLabelRed}`}
                                  >
                                    {item.is_legalized === 1
                                      ? t("tags.settled")
                                      : t("tags.pendingSettlement")}
                                  </span>
                                )}
                                {item.event_type_name === "Registrar novedad" && (
                                  <span
                                    className={`${styles.tagLabel} ${
                                      item.is_rejected || item.is_rejected === 0
                                        ? styles.tagLabelBlack
                                        : styles.tagLabelGray
                                    }`}
                                  >
                                    {item.is_rejected || item.is_rejected === 0
                                      ? item.is_reconciled === 1
                                        ? t("tags.closedUnlinked")
                                        : t("tags.closed")
                                      : item.is_reconciled === 1
                                        ? t("tags.openUnlinked")
                                        : t("tags.open")}
                                  </span>
                                )}
                                {item.event_type_name === "Cierre de novedad" && (
                                  <span
                                    className={`${styles.tagLabel} ${
                                      item.is_rejected === 1
                                        ? styles.tagLabelGreen
                                        : item.is_rejected === 0
                                          ? styles.tagLabelRose
                                          : styles.tagLabelRed
                                    }`}
                                  >
                                    {item.is_rejected === 1
                                      ? t("tags.approved")
                                      : item.is_rejected === 0
                                        ? t("tags.rejected")
                                        : t("tags.pending")}
                                  </span>
                                )}
                                {item.event_type_name === "Acuerdo de pago" &&
                                  item.status_name_payment_agreement == "Anulada" && (
                                    <span className={`${styles.tagLabel} ${styles.tagLabelBlack}`}>
                                      {t("tags.voided")}
                                    </span>
                                  )}
                              </h5>
                              <div className={styles.date}>
                                {item.event_type_name === "Acuerdo de pago"
                                  ? formatDatePlane(item.create_at?.toString())
                                  : formatDatePlane(item.event_date.toString())}
                              </div>
                              {item.event_type_name === "Aviso de vencimiento" ? (
                                <div className={styles.quantity}>
                                  <div
                                    className={styles.button}
                                    onClick={() => {
                                      setQuantity(quantity - 1);
                                    }}
                                  >
                                    <Minus size={12} />
                                  </div>
                                  <div className={styles.number}>{quantity}</div>
                                  <div
                                    className={styles.button}
                                    onClick={() => {
                                      setQuantity(quantity + 1);
                                    }}
                                  >
                                    <Plus size={12} />
                                  </div>
                                </div>
                              ) : null}
                              {item.event_type_name === "Generar nota de credito" ||
                              item.event_type_name === "Generar nota de debito" ? (
                                <div>
                                  <div
                                    className={styles.icons}
                                    onClick={() => {
                                      handleDocumentClick(item?.files[0] || "");
                                    }}
                                  >
                                    <ArrowLineDown
                                      size={14}
                                      onClick={() => {
                                        setIsModalOpen;
                                      }}
                                    />
                                  </div>
                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("value", { value: formatMoney(item.ammount ?? "0") })}
                                  </div>
                                  <div className={styles.adjustment}>
                                    {t("adjustmentId")}
                                    <div
                                      className={styles.idAdjustment}
                                      onClick={() =>
                                        item.financial_discount_id &&
                                        handelOpenAdjusmentDetail(item.financial_discount_id)
                                      }
                                    >
                                      {item.financial_discount_id ?? "N/A"}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}

                              {item.event_type_name === "Emision de factura" ? (
                                <div>
                                  <div
                                    className={styles.icons}
                                    onClick={() => {
                                      handleDocumentClick(item.files[0] || "");
                                    }}
                                  >
                                    <ArrowLineDown
                                      size={14}
                                      onClick={() => {
                                        setIsModalOpen(true);
                                      }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              {item.event_type_name === "Generar descuento" ? (
                                <div>
                                  <div
                                    className={styles.icons}
                                    onClick={() => {
                                      handleDocumentClick(item.files[0] || "");
                                    }}
                                  >
                                    <ArrowLineDown size={14} onClick={() => {}} />
                                  </div>
                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("value", { value: formatMoney(item.ammount ?? "0") })}
                                  </div>
                                  <div className={styles.adjustment}>
                                    {t("adjustmentId")}
                                    <div className={styles.idAdjustment}>{item.id}</div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              {item.event_type_name === "Acuerdo de pago" ? (
                                <div>
                                  {item.files[0] && (
                                    <div className={styles.icons}>
                                      <Envelope
                                        size={14}
                                        onClick={() => {
                                          window.open(item.files[0], "_blank");
                                        }}
                                      />
                                    </div>
                                  )}

                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("value", { value: formatMoney(item.ammount) })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("agreedPaymentDate", {
                                      date: formatDatePlane(item.event_date?.toString())
                                    })}
                                  </div>
                                  <div className={styles.adjustment}>
                                    {t("agreementId")}
                                    <div
                                      className={styles.idAdjustment}
                                      onClick={() => {
                                        setIsModalPaymentAgreementOpen({
                                          isOpen: true,
                                          incident_id: item.id
                                        });
                                      }}
                                    >
                                      {" "}
                                      {`${item.payment_agreement_id}`}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              {item.event_type_name === "Vencimiento acuerdo de pago" ? (
                                <div>
                                  <div className={styles.icons}>
                                    <Envelope size={14} onClick={() => {}} />
                                  </div>
                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("agreedValue", { value: "" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("agreementIdValue", { id: item.id })}
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              {item.event_type_name === "Radicar factura" ? (
                                <div>
                                  <div
                                    className={styles.icons}
                                    onClick={() => {
                                      handleDocumentClick(item.files[0] || "");
                                    }}
                                  >
                                    <ArrowLineDown size={14} onClick={() => {}} />
                                  </div>
                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              {item.event_type_name === "Cambiar estado" ? (
                                <div>
                                  {item.files[0] && (
                                    <div
                                      className={styles.icons}
                                      onClick={() => {
                                        handleDocumentClick(item.files[0] || "");
                                      }}
                                    >
                                      <ArrowLineDown size={14} onClick={() => {}} />
                                    </div>
                                  )}

                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("initialStatus", { status: item.previous_status ?? "N/A" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("finalStatus", { status: item.status_name })}
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              {item.event_type_name === "Registrar novedad" ? (
                                <div>
                                  <div
                                    className={styles.icons}
                                    onClick={() => {
                                      handleDocumentClick(item.files[0] || "");
                                    }}
                                  >
                                    <ArrowLineDown size={14} onClick={() => {}} />
                                  </div>
                                  <div className={styles.name}>
                                    {t("disputeType", { type: item.type_incident ?? "" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                  <div className={styles.adjustment}>
                                    {t("disputeId")}
                                    <div
                                      className={styles.idAdjustment}
                                      onClick={() =>
                                        item.id && handelOpenNoveltyDetail(item.incident_id)
                                      }
                                    >
                                      {item.sequence}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}

                              {item.event_type_name === "Cierre de novedad" ? (
                                <div>
                                  <div
                                    className={styles.icons}
                                    onClick={() => {
                                      handleDocumentClick(item.files[0] || "");
                                    }}
                                  >
                                    <ArrowLineDown size={14} onClick={() => {}} />
                                  </div>
                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                  <div className={styles.adjustment}>
                                    {t("disputeId")}
                                    <div
                                      className={styles.idAdjustment}
                                      onClick={() =>
                                        item.id && handelOpenNoveltyDetail(item.incident_id)
                                      }
                                    >
                                      {item.sequence}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}

                              {item.event_type_name === "Factura conciliada" ? (
                                <div>
                                  <div
                                    className={styles.icons}
                                    onClick={() => {
                                      handleDocumentClick(item?.files[0] || "");
                                    }}
                                  >
                                    <ArrowLineDown
                                      size={14}
                                      onClick={() => {
                                        setIsModalOpen;
                                      }}
                                    />
                                  </div>
                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                </div>
                              ) : null}

                              {item.event_type_name === "Pago aplicado" ||
                              item.event_type_name === "Pago parcial" ? (
                                <div>
                                  <div className={styles.icons}>
                                    <Envelope size={14} onClick={() => {}} />
                                  </div>
                                  <div className={styles.name}>
                                    {t("actionBy", { user: item.user_name ?? "" })}
                                  </div>
                                  <div className={styles.name}>
                                    {t("value", { value: formatMoney(item.ammount) })}
                                  </div>
                                  {item.payment_id && (
                                    <div className={styles.adjustment}>
                                      {t("paymentId")}
                                      <div
                                        className={styles.idAdjustment}
                                        onClick={() =>
                                          item.payment_identification_url &&
                                          handleDocumentClick(item.payment_identification_url)
                                        }
                                      >
                                        {item.payment_id}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                ""
                              )}

                              {item.event_type_name === "Saldo Confirmado" ? (
                                <div className={styles.name}>
                                  {t("value", { value: formatMoney(item.ammount) })}
                                </div>
                              ) : null}

                              {item.comments && (
                                <div className={styles.commentsContainer}>
                                  <div className={styles.name}>
                                    {t("comment", { comment: item.comments })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <h4 className={styles.resume}>{t("summary.title")}</h4>
        <div className={styles.bodyContent}>
          <div className={styles.initialValue}>
            <p className={styles.value}>{t("summary.initialValue")}</p>
            <p className={styles.result}>
              {formatMoney(invoiceData?.totals.total_initial.toString() ?? "")}
            </p>
          </div>
          {invoiceData?.totals?.total_creditNotes !== undefined &&
            invoiceData?.totals?.total_creditNotes > 0 && (
              <div className={styles.initialValue}>
                <p className={styles.value}>{t("summary.creditNote")}</p>
                <p className={styles.result}>
                  {formatMoney(invoiceData?.totals.total_creditNotes.toString() ?? "")}
                </p>
              </div>
            )}
          {invoiceData?.totals?.total_debitNotes !== undefined &&
            invoiceData?.totals?.total_debitNotes > 0 && (
              <div className={styles.initialValue}>
                <p className={styles.value}>{t("summary.debitNote")}</p>
                <p className={styles.result}>
                  {formatMoney(invoiceData?.totals.total_debitNotes.toString() ?? "")}
                </p>
              </div>
            )}
          {invoiceData?.totals?.total_discount !== undefined &&
            invoiceData?.totals?.total_discount > 0 && (
              <div className={styles.initialValue}>
                <p className={styles.value}>{t("summary.discount")}</p>
                <p className={styles.result}>
                  {formatMoney(invoiceData?.totals.total_discount.toString() ?? "")}
                </p>
              </div>
            )}

          <hr />
          <div className={styles.total}>
            <p className={styles.value}>{tCommon("fields.total")}</p>
            <p className={styles.result}>
              {formatMoney(invoiceData?.totals.total_general.toString() ?? "")}
            </p>
          </div>
        </div>
      </div>
      <ModalAgreementDetail
        isModalPaymentAgreementOpen={isModalPaymentAgreementOpen}
        onClose={() => {
          mutate();
          setIsModalPaymentAgreementOpen({ isOpen: false, incident_id: 0 });
        }}
      />
    </aside>
  );
};

export default InvoiceDetailModal;
