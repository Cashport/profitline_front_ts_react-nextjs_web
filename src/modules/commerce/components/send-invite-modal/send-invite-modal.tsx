"use client";
import { useEffect, useState } from "react";
import { Modal, Typography, message } from "antd";
import { useForm } from "react-hook-form";

import { sendInvitationMarketplace } from "@/services/commerce/commerce";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";

import "./send-invite-modal.scss";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

interface ISendInviteForm {
  email: string;
}

export const SendInviteModal = ({ isOpen, onClose }: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<ISendInviteForm>({
    mode: "onChange"
  });

  const onSubmit = async (data: ISendInviteForm) => {
    setIsLoading(true);
    try {
      await sendInvitationMarketplace(data.email);
      message.success("Invitación enviada correctamente");
      onClose();
    } catch (error) {
      message.error("Error al enviar la invitación");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <Modal
      className="sendInviteModal"
      width={448}
      open={isOpen}
      title={
        <Title className="sendInviteModal__title" level={4}>
          Enviar invitación
        </Title>
      }
      footer={null}
      onCancel={onClose}
    >
      <p className="sendInviteModal__description">
        Ingresa un email para enviar una invitación de acceso al marketplace
      </p>

      <InputForm
        titleInput="Email"
        nameInput="email"
        control={control}
        error={errors.email}
        typeInput="email"
        placeholder="correo@mail.com"
        validationRules={{
          required: "El email es requerido",
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: "El email no es válido"
          }
        }}
      />

      <PrincipalButton
        onClick={handleSubmit(onSubmit)}
        disabled={!isValid}
        fullWidth
        loading={isLoading}
      >
        Enviar Código
      </PrincipalButton>
    </Modal>
  );
};
