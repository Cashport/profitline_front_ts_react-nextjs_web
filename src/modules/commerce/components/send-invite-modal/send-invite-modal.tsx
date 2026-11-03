"use client";
import { useEffect, useState } from "react";
import { Modal, Typography, message } from "antd";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";

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
  const t = useTranslations("commerce.sendInvite");
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
      message.success(t("success"));
      onClose();
    } catch (error) {
      message.error(t("error"));
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
          {t("title")}
        </Title>
      }
      footer={null}
      onCancel={onClose}
    >
      <p className="sendInviteModal__description">{t("description")}</p>

      <InputForm
        titleInput={t("email")}
        nameInput="email"
        control={control}
        error={errors.email}
        typeInput="email"
        placeholder={t("emailPlaceholder")}
        validationRules={{
          required: t("emailRequired"),
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: t("emailInvalid")
          }
        }}
      />

      <PrincipalButton
        onClick={handleSubmit(onSubmit)}
        disabled={!isValid}
        fullWidth
        loading={isLoading}
      >
        {t("submit")}
      </PrincipalButton>
    </Modal>
  );
};
