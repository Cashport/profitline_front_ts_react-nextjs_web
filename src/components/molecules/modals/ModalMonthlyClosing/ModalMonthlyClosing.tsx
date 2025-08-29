"use client";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Flex, Input, message, Modal, Typography } from "antd";

import { getCloseMonthByProject, IGetCloseMonth } from "@/services/projects/projects";
import { useAppStore } from "@/lib/store/store";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import "./modalMonthlyClosing.scss";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalMonthlyClosing = ({ isOpen, onClose }: Props) => {
  const [confirmationText, setConfirmationText] = useState<string>();
  const [closeMonthData, setCloseMonthData] = useState<IGetCloseMonth>();
  const [noCloseMonths, setNoCloseMonths] = useState<boolean>(false);
  const { ID } = useAppStore((state) => state.selectedProject);

  useEffect(() => {
    const fetchMont = async () => {
      try {
        const closeMonths = await getCloseMonthByProject(ID);
        setCloseMonthData(closeMonths);
      } catch (error) {
        message.error("Error al obtener el cierre de mes");
        setNoCloseMonths(true);
      }
    };
    fetchMont();
  }, []);

  const handleClosePeriod = () => {
    console.log("Texto de confirmación:", confirmationText);

    if (confirmationText === "08-2025") {
      console.log("Periodo cerrado correctamente");
      // Aquí puedes agregar la lógica para cerrar el periodo
      // Por ejemplo: llamar a una API, mostrar una notificación, etc.

      // Limpiar el estado y cerrar el modal
      setConfirmationText("");
      onClose();
    } else {
      console.log("El texto de confirmación no coincide");
    }
  };

  // Limpiar el estado cuando el modal se cierre
  const handleCancel = () => {
    setConfirmationText(undefined);
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
          Cerrar periodo contable
        </Title>
      }
      footer={null}
      onCancel={handleCancel}
    >
      {noCloseMonths ? (
        <p className="modalMonthlyClosing__description">No hay cierre para este proyecto</p>
      ) : (
        <Flex vertical gap="1.25rem" align="center">
          <p className="modalMonthlyClosing__description">
            Vas a cerrar el periodo <strong>{closeMonthData?.collection_period}</strong> que va
            desde el{" "}
            <strong>
              {closeMonthData?.start_date
                ? dayjs(closeMonthData.start_date).format("DD/MM/YYYY")
                : ""}
            </strong>{" "}
            hasta hoy
            <strong>
              {" "}
              {closeMonthData?.end_date ? dayjs(closeMonthData.end_date).format("DD/MM/YYYY") : ""}
            </strong>
          </p>
          <p className="modalMonthlyClosing__description">
            Si estás seguro escribe el mes que vas a cerrar{" "}
            <strong>&quot;{closeMonthData?.collection_period}&quot;</strong>
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
            >
              Cerrar periodo
            </PrincipalButton>
          </div>
        </Flex>
      )}
    </Modal>
  );
};
