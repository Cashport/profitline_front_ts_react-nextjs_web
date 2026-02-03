import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Modal, message } from "antd";
import { CaretLeft } from "@phosphor-icons/react";

import { createClient, updateClient } from "@/services/dataQuality/dataQuality";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { useAppStore } from "@/lib/store/store";

import "./modalCreateEditClient.scss";

interface ModalCreateEditClientProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  countryName: string;
  countryId: string;
  mode: "create" | "edit";
  clientData?: {
    id: number;
    client_name: string;
    stakeholder: string;
  };
}

interface IFormCreateEditClient {
  client_name: string;
  stakeholder: string;
}

const ModalCreateEditClient = ({
  isOpen,
  onClose,
  onSuccess,
  countryName,
  countryId,
  mode,
  clientData
}: ModalCreateEditClientProps) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset,
    setValue
  } = useForm<IFormCreateEditClient>({
    defaultValues: {
      client_name: "",
      stakeholder: ""
    }
  });

  useEffect(() => {
    if (isOpen && mode === "edit" && clientData) {
      setValue("client_name", clientData.client_name);
      setValue("stakeholder", clientData.stakeholder);
    }
    if (!isOpen) {
      reset();
    }
  }, [isOpen, mode, clientData, setValue, reset]);

  const onSubmit = async (data: IFormCreateEditClient) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await createClient({
          id_client: "",
          id_project: projectId,
          client_name: data.client_name,
          id_country: Number(countryId),
          stakeholder: Number(data.stakeholder) || 0,
          archive_rules: []
        });
        message.success("Cliente creado exitosamente");
      } else if (clientData) {
        await updateClient(clientData.id, {
          client_name: data.client_name,
          id_country: Number(countryId),
          archive_rules: []
        });
        message.success("Cliente actualizado exitosamente");
      }
      reset();
      onSuccess();
      onClose();
    } catch {
      message.error(
        mode === "create" ? "Error al crear el cliente" : "Error al actualizar el cliente"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const isCreate = mode === "create";

  return (
    <Modal
      className="modalCreateEditClient"
      width={400}
      footer={null}
      open={isOpen}
      closable={false}
    >
      <button className="modalCreateEditClient__header" onClick={handleClose}>
        <CaretLeft size="1.25rem" />
        <h4>{isCreate ? "Crear Nuevo Cliente" : "Editar Cliente"}</h4>
      </button>

      <p className="modalCreateEditClient__description">
        {isCreate
          ? `Ingresa el nombre del nuevo cliente para ${countryName}`
          : "Modifica la información general del cliente"}
      </p>

      <form className="modalCreateEditClient__form">
        <InputForm
          titleInput="Nombre del Cliente"
          nameInput="client_name"
          control={control}
          error={undefined}
          placeholder="Ej: Farmacia San José"
        />
        <InputForm
          titleInput="Stakeholder"
          nameInput="stakeholder"
          control={control}
          error={undefined}
          placeholder="Ej: Juan Pérez"
        />
      </form>

      <FooterButtons
        handleOk={() => handleSubmit(onSubmit)()}
        onClose={handleClose}
        titleConfirm={isCreate ? "Crear Cliente" : "Guardar Cambios"}
        isConfirmLoading={isSubmitting}
        isConfirmDisabled={!isValid}
      />
    </Modal>
  );
};

export default ModalCreateEditClient;
