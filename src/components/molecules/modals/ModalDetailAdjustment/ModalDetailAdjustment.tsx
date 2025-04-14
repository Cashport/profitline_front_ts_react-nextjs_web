import { FC, useState } from "react";
import { ArrowLineDown, CaretDoubleRight, DotsThree } from "phosphor-react";
import { Button, Flex, Spin } from "antd";

import { useAppStore } from "@/lib/store/store";
import { formatDatePlane } from "@/utils/utils";
import { useModalDetail } from "@/context/ModalContext";
import { FileDownloadModal } from "../FileDownloadModal/FileDownloadModal";
import { IInvoices, useFinancialDiscountDetail } from "@/hooks/useDetailAdjustment";
import { ModalActionAdjusment } from "../modalActionAdjusment/ModalActionAdjusment";

import { FinancialDiscount } from "@/types/financialDiscounts/IFinancialDiscounts";

import styles from "./modalDetailAdjustment.module.scss";

interface ModalDetailAdjustmentProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  selectAdjusment?: FinancialDiscount;
  projectId: number;
  legalized?: boolean;
  adjusmentId?: number;
}

const ModalDetailAdjustment: FC<ModalDetailAdjustmentProps> = ({
  isOpen,
  onClose,
  clientId,
  projectId,
  selectAdjusment,
  adjusmentId = 1,
  legalized = false
}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const { data: adjusmentData, isLoading } = useFinancialDiscountDetail({
    financialDiscountId: selectAdjusment?.id ?? adjusmentId,
    projectId,
    clientId
  });
  const [urlStep, setUrlStep] = useState<string | undefined>(undefined);
  const [isModalSelectOpen, setIsModalSelectOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { openModal } = useModalDetail();
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
        return "Novedad";
      case "Legaliazcion de ajuste":
        return "Legalizado desde ajuste CashPort";
      case "Creacion de ajuste":
        return "Creación de ajuste";
      case "Emision del ajuste":
        return "Emisión del ajuste";
      default:
        return item;
    }
  };

  const extractType = (type: string) => {
    if (type === "Nota debito") {
      return "Nota de débito";
    } else if (type === "Nota credito") {
      return "Nota de crédito";
    } else if (type === "Descuento") {
      return "Descuento";
    }
    return type;
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
  const handelOpenInvoiceDetail = (invoice: IInvoices) => {
    openModal("invoice", {
      invoiceId: invoice.id,
      showId: invoice.id_erp,
      projectId: projectId,
      clientId: clientId,
      hiddenActions: true
    });
  };

  return (
    <aside className={`${styles.wrapper} ${isOpen ? styles.show : styles.hide}`}>
      {isLoading ? (
        <Flex justify="center" align="center" style={{ height: "100%" }}>
          <Spin />
        </Flex>
      ) : (
        <>
          <FileDownloadModal
            isModalOpen={isModalOpen}
            onCloseModal={setIsModalOpen}
            url={urlStep || ""}
          />
          <div>
            <div className={styles.modalTopSide}>
              <button type="button" className={styles.back} onClick={onClose}>
                <CaretDoubleRight />
              </button>
            </div>
            <div className={styles.header}>
              <h4 className={styles.numberInvoice}>
                {extractType(adjusmentData?.details[0]?.financial_type ?? "")}
                {"  "}
                {selectAdjusment?.id}
              </h4>
              <Button
                className={styles.button__actions}
                size="large"
                disabled={legalized}
                icon={<DotsThree size={"1.5rem"} />}
                onClick={() => {
                  setIsModalSelectOpen(true);
                }}
              >
                Generar acción
              </Button>
            </div>

            <div className={styles.body}>
              <div className={styles.headerBody}>
                <div className={styles.title}>Trazabilidad</div>
                {/* <div
              className={`${styles.status} ${statusClass(adjusmentData ? adjusmentData?.results[0].status_name : "")}`}
            >
              {adjusmentData ? adjusmentData[0].status_name : ""}
            </div> */}
              </div>
              <div className={styles.content}>
                <div className={styles.progress}></div>
                <div className={styles.description}>
                  <div className={styles.stepperContainer}>
                    <div className={styles.stepperContent}>
                      {(adjusmentData?.details ?? []).map((item, index, arr) => {
                        return (
                          <div key={item.id} className={styles.mainStep}>
                            <div
                              className={`${styles.stepLine} ${index === arr.length - 1 ? styles.inactive : styles.active}`}
                            />
                            <div className={`${styles.stepCircle} ${styles.active}`} />
                            <div className={styles.stepLabel}>
                              <div className={styles.cardInvoiceFiling}>
                                <h5 className={styles.title}>{getEventTitle(item.event_name)}</h5>
                                <div className={styles.date}>
                                  {formatDatePlane(item?.event_date?.toString())}
                                </div>
                                {item?.event_name === "Emision del ajuste" && (
                                  <Flex gap={"4px"} className={styles.date}>
                                    Cashport ID:{" "}
                                    <div className={styles.idAdjustment}>
                                      {item.id_financial_discount || item.cp_id}
                                    </div>
                                  </Flex>
                                )}
                                {item.username && (
                                  <div
                                    className={styles.name}
                                  >{`Responsable: ${item?.username}`}</div>
                                )}
                                {item?.event_name === "Creacion de ajuste" && item?.comments ? (
                                  <div>
                                    {item.cp_id && (
                                      <Flex gap={"4px"}>
                                        Cashport ID:{" "}
                                        <div className={styles.idAdjustment}>{item.cp_id}</div>
                                      </Flex>
                                    )}
                                    <div
                                      className={styles.name}
                                    >{`Valor: ${formatMoney(item?.amount ?? "0")}`}</div>
                                    <div className={styles.date}>comentarios</div>
                                    <div className={styles.date}>{item?.comments}</div>{" "}
                                  </div>
                                ) : null}
                                {item?.event_name === "Creacion de ajuste" ? (
                                  <div>
                                    {item.cp_id && item.id_financial_discount && (
                                      <div className={styles.idAdjustment}>
                                        {item.id_financial_discount || item.cp_id}
                                      </div>
                                    )}
                                    <div
                                      className={styles.name}
                                    >{`Valor: ${formatMoney(item?.amount ?? "0")}`}</div>
                                  </div>
                                ) : null}
                                {item?.event_name === "Legaliazcion de ajuste" ? (
                                  <div>
                                    {item?.amount && (
                                      <div className={styles.name}>
                                        {`Valor: ${formatMoney(item?.amount ?? "0")}`}
                                      </div>
                                    )}

                                    <div className={styles.adjustment}>
                                      {item.cp_id && (
                                        <Flex gap={"4px"}>
                                          Cashport ID:{" "}
                                          <div className={styles.idAdjustment}>{item.cp_id}</div>
                                        </Flex>
                                      )}

                                      <Flex gap={"4px"}>
                                        ID del ajuste:
                                        <div className={styles.idAdjustment}>
                                          {item.id_financial_discount}
                                        </div>
                                      </Flex>
                                    </div>
                                  </div>
                                ) : null}
                                {item?.event_name === "Facturas aplicadas" ? (
                                  <div>
                                    <div
                                      className={styles.icons}
                                      onClick={() => {
                                        handleDocumentClick((item?.files as string[])[0] || "");
                                      }}
                                    >
                                      <ArrowLineDown
                                        size={14}
                                        onClick={() => {
                                          setIsModalOpen;
                                        }}
                                      />
                                    </div>
                                    <div
                                      className={styles.name}
                                    >{`Valor: ${formatMoney(item?.amount ?? "0")}`}</div>
                                    <Flex wrap gap={"2px"}>
                                      {Array.isArray(item?.invoices) &&
                                        item?.invoices?.map((invoice: IInvoices, index, arr) => {
                                          return (
                                            <div
                                              key={invoice.id}
                                              className={styles.text_blue}
                                              onClick={() => handelOpenInvoiceDetail(invoice)}
                                            >
                                              {invoice.id_erp}
                                              {index < arr.length - 1 ? "," : ""}
                                            </div>
                                          );
                                        })}
                                    </Flex>
                                  </div>
                                ) : (
                                  ""
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.footer}>
            <h4 className={styles.resume}>Resumen</h4>
            <div className={styles.bodyContent}>
              {adjusmentData?.initial_amount !== undefined && adjusmentData?.initial_amount > 0 && (
                <div className={styles.initialValue}>
                  <p className={styles.value}>Monto inicial</p>
                  <p className={styles.result}>
                    {formatMoney(adjusmentData?.initial_amount.toString() ?? "")}
                  </p>
                </div>
              )}
              {adjusmentData?.appliedamount !== undefined && adjusmentData?.appliedamount > 0 && (
                <div className={styles.initialValue}>
                  <p className={styles.value}>Monto aplicado</p>
                  <p className={styles.result}>{formatMoney(adjusmentData?.appliedamount ?? "")}</p>
                </div>
              )}
              <hr />
              <div className={styles.total}>
                <p className={styles.value}>Valor disponible</p>
                <p className={styles.result}>
                  {formatMoney(adjusmentData?.current_amount.toString() ?? "")}
                </p>
              </div>
            </div>
          </div>
          <ModalActionAdjusment
            isOpen={isModalSelectOpen}
            onClose={() => {
              setIsModalSelectOpen(false);
            }}
            clientId={clientId}
            adjustment={{
              type: adjusmentData?.details[0].financial_type,
              id: selectAdjusment?.id.toString() ?? "",
              amount: adjusmentData?.initial_amount.toString() ?? ""
            }}
          />
        </>
      )}
    </aside>
  );
};

export default ModalDetailAdjustment;
