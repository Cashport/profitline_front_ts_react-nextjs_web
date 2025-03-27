import { FC, useMemo, useState } from "react";
import useSWR from "swr";
import { CaretDoubleRight, ArrowsClockwise } from "phosphor-react";
import styles from "./OrderTrackingModal.module.scss";
import { Dropdown, Flex, MenuProps, Skeleton, Typography, message } from "antd";
import InvoiceDownloadModal from "@/modules/clients/components/invoice-download-modal/invoice-download-modal";

import "dayjs/locale/es"; // Importar el idioma español
// import { formatMoney } from "@/utils/utils";
// import { ApiResponse, VehicleTracking } from "@/types/logistics/tracking/tracking";
import React from "react";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { ButtonGenerateAction } from "@/components/atoms/ButtonGenerateAction/ButtonGenerateAction";
import { invoiceMock } from "./mocked-data";
import ModalHeader from "./components/ModalHeader";
import { formatCurrencyMoney, formatDate } from "@/utils/utils";
import { Tag } from "@/components/atoms/Tag/Tag";
// import { ModalVehicleFollowUp } from "./components/ModalVehicleFollowUp";
// import ModalHeader from "./components/ModalHeader";
// import { updateTripTrackingStatus } from "@/services/logistics/tracking";

const { Text } = Typography;
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  idInvoice: number;
}

const OrderTrackingModal: FC<ModalProps> = ({ isOpen, onClose, idInvoice }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const invoice = invoiceMock;
  const timeLineData = invoice?.tracking;

  const itemsGenerateAction: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <ButtonGenerateAction
          icon={<ArrowsClockwise size={"1.5rem"} />}
          title="Seguimiento"
          onClick={() => {}}
          hideArrow
        />
      )
    }
  ];
  const menuStyle: React.CSSProperties = {
    backgroundColor: "white",
    boxShadow: "none"
  };
  const getTagColor = (status: string) => {
    let color;
    switch (status) {
      case "En tránsito":
        color = "#0085FF";
        break;
      case "Entregado":
        color = "#00DE16";
        break;
      case "Rechazado":
        color = "#E53261";
        break;
      case "Alistando":
        color = "#FF6A00";
        break;
      default:
        color = "black";
    }
    return color;
  };
  return (
    <aside className={`${styles.wrapper} ${isOpen ? styles.show : styles.hide}`}>
      <div>
        <button type="button" className={styles.buttonBack} onClick={onClose}>
          <CaretDoubleRight />
        </button>
        <div className={styles.header}>
          <Flex vertical gap={8}>
            <h4 className={styles.numberInvoice}>Factura {invoice.id}</h4>
            <Text className={styles.subtitle}>
              ID orden de compra <strong>{invoice.purchaseOrderId} </strong>
            </Text>
            <Flex wrap={false}>
              <Tag
                color={getTagColor(invoice.status)}
                content={invoice.status}
                style={{ fontSize: 14, fontWeight: 400 }}
                icon={
                  <div
                    style={{
                      backgroundColor: getTagColor(invoice.status),
                      width: 6,
                      height: 6,
                      borderRadius: "50%"
                    }}
                  />
                }
                iconPosition="left"
                withBorder={false}
              />
            </Flex>
          </Flex>
          <Dropdown
            menu={{ items: itemsGenerateAction }}
            trigger={["click"]}
            dropdownRender={(menu) => (
              <div>
                {React.cloneElement(
                  menu as React.ReactElement<{
                    style: React.CSSProperties;
                  }>,
                  { style: menuStyle }
                )}
              </div>
            )}
          >
            <GenerateActionButton
              onClick={() => {
                console.log("click");
              }}
            />
          </Dropdown>
        </div>
        <hr />
        <Skeleton loading={false} active>
          {invoice && (
            <>
              <ModalHeader invoice={invoice} />
              <hr />
              <div className={styles.body}>
                <div className={styles.trackingTitle}>Trazabilidad</div>
                <div className={styles.content}>
                  <div className={styles.progress}></div>
                  <div className={styles.description}>
                    <div className={styles.stepperContainer}>
                      <div className={styles.stepperContent}>
                        {(timeLineData ?? []).map((item, index) => {
                          return (
                            <div key={index} className={styles.mainStep}>
                              <div className={`${styles.stepLine} ${styles.active}`} />
                              <div className={`${styles.stepCircle} ${styles.active}`} />
                              <div className={styles.stepLabel}>
                                <div className={styles.cardInvoiceFiling}>
                                  <div
                                    style={{ display: "flex", alignItems: "center", gap: "10px" }}
                                  >
                                    <h5 className={styles.title}>{item.status}</h5>
                                  </div>
                                  <div className={styles.date}>{item.date}</div>
                                  {item.responsible && (
                                    <div
                                      className={styles.name}
                                    >{`Responsable: ${item.responsible}`}</div>
                                  )}
                                  {item.estimatedValue && (
                                    <p className={styles.name}>
                                      {`Valor estimado: `}
                                      <span style={{ fontWeight: 600 }}>
                                        {formatCurrencyMoney(item.estimatedValue ?? "$0")}
                                      </span>
                                    </p>
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
            </>
          )}
        </Skeleton>
      </div>
    </aside>
  );
};

export default OrderTrackingModal;
