import { FC, useContext, useState } from "react";
import { Flex } from "antd";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { OrderViewContext } from "../../containers/create-order/create-order";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import SelectClient from "../create-order-select-client";
import {
  RegistrationDialog,
  type RegistrationFormData
} from "@/modules/cetaphil/components/registration-dialog";

import styles from "./create-order-search-client.module.scss";

export interface selectClientForm {
  client: {
    value: string;
    label: string;
    email: string;
  };
}

const CreateOrderSearchClient: FC = ({}) => {
  const { setClient } = useContext(OrderViewContext);
  const [showNewClientDialog, setShowNewClientDialog] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<selectClientForm>({});

  const handleCreateOrder = (data: selectClientForm) => {
    setClient({ name: data.client.label, id: data.client.value, email: data.client.email });
  };

  const handleClickNewClient = () => {
    console.log("Nuevo cliente");
    setShowNewClientDialog(true);
  };

  const handleSaveClient = (data: RegistrationFormData) => {
    // TODO: Llamar a la API para crear el cliente
    // Ejemplo: await clientService.create(data)

    console.log("Cliente guardado:", data);

    // setShowNewClientDialog(false);
  };

  const handleSaveAndContinue = (data: RegistrationFormData) => {
    // Mismo comportamiento que handleSaveClient
    handleSaveClient(data);
  };

  return (
    <>
      <Flex className={styles.FlexContainer} vertical gap={"1.5rem"}>
        <Flex justify="space-between" align="center" className={styles.FlexContainer__header}>
          <h3 className={styles.FlexContainer__title}>Buscar cliente</h3>
          <PrincipalButton onClick={handleClickNewClient}>Nuevo cliente</PrincipalButton>
        </Flex>
        <Controller
          name="client"
          control={control}
          rules={{ required: true, minLength: 1 }}
          render={({ field }) => <SelectClient errors={errors.client} field={field} />}
        />
      </Flex>
      <Flex gap={"0.5rem"} justify="flex-end">
        <Link href="/comercio">
          <SecondaryButton>Cancelar</SecondaryButton>
        </Link>
        <PrincipalButton disabled={!isValid} onClick={handleSubmit(handleCreateOrder)}>
          Crear orden
        </PrincipalButton>
      </Flex>
      <RegistrationDialog
        open={showNewClientDialog}
        onOpenChange={setShowNewClientDialog}
        title="Registrar Nuevo Cliente"
        description="Complete los datos del cliente para crear la orden"
        createButtonText="Guardar Cliente"
        continueButtonText="Guardar y Continuar"
        onCreateAccount={handleSaveClient}
        onContinue={handleSaveAndContinue}
      />
    </>
  );
};

export default CreateOrderSearchClient;
