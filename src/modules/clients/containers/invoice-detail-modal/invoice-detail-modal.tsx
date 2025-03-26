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
  clientId: number;
  showId: string;
  hiddenActions?: boolean;
  // eslint-disable-next-line no-unused-vars
  handleActionInDetail?: (invoice: IInvoice) => void;
  selectInvoice?: IInvoice;
  projectId?: number;
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
  handleActionInDetail
}) => {
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
  const getEventTitle = (item: string) => {
    switch (item) {
      case "Generar nota de credito":
        return "Nota de crédito aplicada";
      case "Generar nota de debito":
        return "Nota de débito aplicada";
      case "Generar descuento":
        return "Descuento aplicado";
      case "Radicar factura":
        return "Radicación";
      case "Registrar novedad":
        return "Nueva novedad";
      case "Emision de factura":
        return "Emisión de factura";
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
    openModal("novelty", { noveltyId: noveltyId });
  };

  return (
    <aside className={`${styles.wrapper} ${isOpen ? styles.show : styles.hide}`}>
      <InvoiceDownloadModal
        isModalOpen={isModalOpen}
        handleCloseModal={setIsModalOpen}
        title="Imagen"
        url={urlStep}
      />
      <div>
        <div className={styles.modalTopSide}>
          <button type="button" className={styles.back} onClick={onClose}>
            <CaretDoubleRight />
          </button>
        </div>
        <div className={styles.header}>
          <h4 className={styles.numberInvoice}>Factura {showId}</h4>
          <div className={styles.viewInvoice}>
            <Receipt size={20} />
            Ver factura
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
              Generar acción
            </Button>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.headerBody}>
            <div className={styles.title}>Trazabilidad</div>
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
                                    {item.is_legalized === 1 ? "Legalizada" : "Por legalizar"}
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
                                      ? "Cerrada"
                                      : "Abierta"}
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
                                      ? "Aprobada"
                                      : item.is_rejected === 0
                                        ? "Rechazada"
                                        : "Pendiente"}
                                  </span>
                                )}
                                {item.event_type_name === "Acuerdo de pago" &&
                                  item.status_name_payment_agreement == "Anulada" && (
                                    <span className={`${styles.tagLabel} ${styles.tagLabelBlack}`}>
                                      Anulado
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
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                  <div
                                    className={styles.name}
                                  >{`Valor: ${formatMoney(item.ammount ?? "0")}`}</div>
                                  <div className={styles.adjustment}>
                                    ID del ajuste:
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
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                  <div
                                    className={styles.name}
                                  >{`Valor: ${formatMoney(item.ammount ?? "0")}`}</div>
                                  <div className={styles.adjustment}>
                                    ID del ajuste:
                                    <div className={styles.idAdjustment}>{item.id}</div>
                                  </div>
                                </div>
                              ) : (
                                ""
                              )}
                              {item.event_type_name === "Acuerdo de pago" ? (
                                <div>
                                  <div className={styles.icons}>
                                    <Envelope size={14} onClick={() => {}} />
                                  </div>
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                  <div
                                    className={styles.name}
                                  >{`Valor: ${formatMoney(item.ammount)}`}</div>
                                  <div
                                    className={styles.name}
                                  >{`Fecha de pago acordada: ${formatDatePlane(item.event_date?.toString())}`}</div>
                                  <div className={styles.adjustment}>
                                    ID del acuerdo:
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
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                  <div className={styles.name}>{`Valor acordado: ${""}`}</div>
                                  <div className={styles.name}>{`ID del acuerdo: ${item.id}`}</div>
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
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
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

                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                  <div
                                    className={styles.name}
                                  >{`Estado inicial: ${item.previous_status ?? "N/A"}`}</div>
                                  <div
                                    className={styles.name}
                                  >{`Estado final: ${item.status_name}`}</div>
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
                                  <div
                                    className={styles.name}
                                  >{`Tipo novedad: ${item.type_incident}`}</div>
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                  <div className={styles.adjustment}>
                                    ID novedad:
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
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                  <div className={styles.adjustment}>
                                    ID novedad:
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
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                </div>
                              ) : null}

                              {item.event_type_name === "Pago aplicado" ? (
                                <div>
                                  <div className={styles.icons}>
                                    <Envelope size={14} onClick={() => {}} />
                                  </div>
                                  <div className={styles.name}>{`Acción: ${item.user_name}`}</div>
                                  <div
                                    className={styles.name}
                                  >{`Valor: ${formatMoney(item.ammount)}`}</div>
                                  {item.payment_id && (
                                    <div className={styles.adjustment}>
                                      ID del pago:
                                      <div className={styles.idAdjustment}>
                                        {item.payment_id}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                ""
                              )}

                              {item.comments && (
                                <div className={styles.commentsContainer}>
                                  <div className={styles.name}>Comentario: {item.comments}</div>
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
        <h4 className={styles.resume}>Resumen</h4>
        <div className={styles.bodyContent}>
          <div className={styles.initialValue}>
            <p className={styles.value}>Valor inicial</p>
            <p className={styles.result}>
              {formatMoney(invoiceData?.totals.total_initial.toString() ?? "")}
            </p>
          </div>
          {invoiceData?.totals?.total_creditNotes !== undefined &&
            invoiceData?.totals?.total_creditNotes > 0 && (
              <div className={styles.initialValue}>
                <p className={styles.value}>Nota credito</p>
                <p className={styles.result}>
                  {formatMoney(invoiceData?.totals.total_creditNotes.toString() ?? "")}
                </p>
              </div>
            )}
          {invoiceData?.totals?.total_debitNotes !== undefined &&
            invoiceData?.totals?.total_debitNotes > 0 && (
              <div className={styles.initialValue}>
                <p className={styles.value}>Nota debito</p>
                <p className={styles.result}>
                  {formatMoney(invoiceData?.totals.total_debitNotes.toString() ?? "")}
                </p>
              </div>
            )}
          {invoiceData?.totals?.total_discount !== undefined &&
            invoiceData?.totals?.total_discount > 0 && (
              <div className={styles.initialValue}>
                <p className={styles.value}>Descuento</p>
                <p className={styles.result}>
                  {formatMoney(invoiceData?.totals.total_discount.toString() ?? "")}
                </p>
              </div>
            )}

          <hr />
          <div className={styles.total}>
            <p className={styles.value}>Total</p>
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
