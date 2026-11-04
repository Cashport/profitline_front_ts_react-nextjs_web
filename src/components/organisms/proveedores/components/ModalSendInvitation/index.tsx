import React from "react";
import { Modal, Flex } from "antd";
import { useForm, SubmitHandler } from "react-hook-form";
import { useTranslations } from "use-intl";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { FooterButtons } from "@/components/molecules/FooterButtons/FooterButtons";

interface InviteModalProps {
  isOpen: boolean;
  onCancel: () => void;
  onSubmit: (values: InviteFormValues) => void;
}

interface InviteFormValues {
  email: string;
  cc?: string;
  subject: string;
  message: string;
}

const ModalSendInvitation: React.FC<InviteModalProps> = ({ isOpen, onCancel, onSubmit }) => {
  const t = useTranslations("suppliers.invitation");
  const tCommon = useTranslations("common");
  const {
    handleSubmit,
    formState: { errors },
    reset,
    control
  } = useForm<InviteFormValues>();

  const handleFinish: SubmitHandler<InviteFormValues> = (data) => {
    onSubmit(data);
    reset(); // Resetea los campos del formulario
  };

  return (
    <Modal title={t("title")} open={isOpen} onCancel={onCancel} footer={null} centered>
      <form onSubmit={handleSubmit(handleFinish)}>
        <Flex vertical gap={"1.5rem"}>
          <InputForm
            titleInput={tCommon("fields.email")}
            placeholder={t("emailPlaceholder")}
            control={control}
            nameInput="email"
            error={errors.email}
          />
          <InputForm
            titleInput={t("cc")}
            placeholder={t("emailPlaceholder")}
            control={control}
            nameInput="cc"
            error={errors.cc}
          />
          <InputForm
            titleInput={t("subject")}
            placeholder={t("subjectPlaceholder")}
            control={control}
            nameInput="subject"
            error={errors.subject}
          />
          <InputForm
            titleInput={t("message")}
            nameInput="message"
            control={control}
            error={errors.message}
            placeholder={t("messagePlaceholder")}
            isTextArea={true}
            rows={5}
            hiddenTitle={true}
            customStyle={{ heght: "100%" }}
          />
          <FooterButtons
            nextTitle={t("submit")}
            backTitle={tCommon("actions.cancel")}
            handleBack={onCancel}
            handleNext={() => handleSubmit(handleFinish)}
          />
        </Flex>
      </form>
    </Modal>
  );
};

export default ModalSendInvitation;
