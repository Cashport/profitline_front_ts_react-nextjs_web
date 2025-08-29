"use client";
import { useState } from "react";
import { Flex, Input, Modal, Typography } from "antd";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import "./modalMonthlyClosing.scss";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalMonthlyClosing = ({ isOpen, onClose }: Props) => {
  const [confirmationText, setConfirmationText] = useState<string>();

  const handleClosePeriod = () => {
    // Imprime el valor del input
    console.log("Texto de confirmación:", confirmationText);

    // Aquí puedes agregar validación si lo necesitas
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
      <Flex vertical gap="1.25rem" align="center">
        <p className="modalMonthlyClosing__description">
          Vas a cerrar el periodo <strong>08-2025</strong> que va desde el{" "}
          <strong>01/08/2025</strong> hasta hoy
          <strong> 27/02/2025</strong>
        </p>
        <p className="modalMonthlyClosing__description">
          Si estás seguro escribe el mes que vas a cerrar <strong>&quot;08-2025&quot;</strong>
        </p>

        <Input
          className="modalMonthlyClosing__input"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
        />

        <div style={{ height: "48px" }}>
          <PrincipalButton
            onClick={handleClosePeriod}
            disabled={confirmationText !== "08-2025"}
            customStyles={{
              width: "320px"
            }}
          >
            Cerrar periodo
          </PrincipalButton>
        </div>
      </Flex>
    </Modal>
  );
};
