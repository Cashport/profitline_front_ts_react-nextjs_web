import React from "react";
import { Modal, Flex } from "antd";
import { useForm, SubmitHandler } from "react-hook-form";
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
    <Modal title="Enviar invitación" open={isOpen} onCancel={onCancel} footer={null} centered>
      <form onSubmit={handleSubmit(handleFinish)}>
        <Flex vertical gap={"1.5rem"}>
          <InputForm
            titleInput="Correo electrónico"
            placeholder="Ingresar correo electrónico"
            control={control}
            nameInput="email"
            error={errors.email}
          />
          <InputForm
            titleInput="CC"
            placeholder="Ingresar correo electrónico"
            control={control}
            nameInput="cc"
            error={errors.cc}
          />
          <InputForm
            titleInput="Asunto"
            placeholder="Ingresar asunto"
            control={control}
            nameInput="subject"
            error={errors.subject}
          />
          <InputForm
            titleInput="Mensaje"
            nameInput="message"
            control={control}
            error={errors.message}
            placeholder="Ingresa tu mensaje"
            isTextArea={true}
            rows={5}
            hiddenTitle={true}
            customStyle={{ heght: "100%" }}
          />
          <FooterButtons
            nextTitle="Enviar invitación"
            backTitle="Cancelar"
            handleBack={onCancel}
            handleNext={() => handleSubmit(handleFinish)}
          />
        </Flex>
      </form>
    </Modal>
  );
};

export default ModalSendInvitation;
