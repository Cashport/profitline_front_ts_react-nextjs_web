"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Flex, Input, message, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import {
  closeMonthByProject,
  getCloseMonthByProject,
  IGetCloseMonth
} from "@/services/projects/projects";
import { useAppStore } from "@/lib/store/store";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import "./modalMonthlyClosing.scss";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalMonthlyClosing = ({ isOpen, onClose }: Props) => {
  const t = useTranslations("modals.monthlyClosing");
  const [confirmationText, setConfirmationText] = useState<string>();
  const [closeMonthData, setCloseMonthData] = useState<IGetCloseMonth>();
  const [noCloseMonths, setNoCloseMonths] = useState<boolean>(false);
  const [loadingRequest, setLoadingRequest] = useState<boolean>(false);
  const { ID } = useAppStore((state) => state.selectedProject);

  useEffect(() => {
    const fetchMont = async () => {
      try {
        const closeMonths = await getCloseMonthByProject(ID);
        setCloseMonthData(closeMonths);
      } catch (error) {
        message.error(t("fetchError"));
        setNoCloseMonths(true);
      }
    };
    fetchMont();
  }, [isOpen, ID]);

  const handleClosePeriod = async () => {
    setLoadingRequest(true);

    if (confirmationText === closeMonthData?.collection_period) {
      try {
        await closeMonthByProject(ID, confirmationText || "");
        message.success(t("success"));
        handleCancel();
      } catch (error) {
        message.error(t("closeError"));
      }
    } else {
      message.error(t("mismatch"));
    }
    setLoadingRequest(false);
  };

  // Limpiar el estado cuando el modal se cierre
  const handleCancel = () => {
    setConfirmationText(undefined);
    setCloseMonthData(undefined);
    setNoCloseMonths(false);
    onClose();
  };

  return (
    <Modal
      className="modalMonthlyClosing"
      width={"600px"}
      open={isOpen}
      centered
      title={
        <Title className="modalMonthlyClosing__title" level={4}>
          {t("title")}
        </Title>
      }
      footer={null}
      onCancel={handleCancel}
    >
      {noCloseMonths ? (
        <p className="modalMonthlyClosing__description">{t("noClosing")}</p>
      ) : (
        <Flex vertical gap="1.25rem" align="center">
          <p className="modalMonthlyClosing__description">
            {t.rich("description", {
              period: closeMonthData?.collection_period ?? "",
              start: closeMonthData?.start_date
                ? dayjs(closeMonthData.start_date).format("DD/MM/YYYY")
                : "",
              end: closeMonthData?.end_date
                ? dayjs(closeMonthData.end_date).format("DD/MM/YYYY")
                : "",
              b: (chunks) => <strong>{chunks}</strong>
            })}
          </p>
          <p className="modalMonthlyClosing__description">
            {t.rich("confirmPrompt", {
              period: closeMonthData?.collection_period ?? "",
              b: (chunks) => <strong>{chunks}</strong>
            })}
          </p>

          <Input
            className="modalMonthlyClosing__input"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />

          <div style={{ height: "48px" }}>
            <PrincipalButton
              onClick={handleClosePeriod}
              disabled={confirmationText !== closeMonthData?.collection_period}
              customStyles={{
                width: "320px"
              }}
              loading={loadingRequest}
            >
              {t("closePeriod")}
            </PrincipalButton>
          </div>
        </Flex>
      )}
    </Modal>
  );
};
