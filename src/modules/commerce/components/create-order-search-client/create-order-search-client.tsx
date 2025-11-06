import { FC, useContext, useState } from "react";
import { Flex } from "antd";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import SelectClient from "../create-order-select-client";
import {
  RegistrationDialog,
  type RegistrationFormData
} from "@/modules/cetaphil/components/registration-dialog";
import { OrderViewContext } from "../../contexts/orderViewContext";

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
    setShowNewClientDialog(true);
  };

  const handleSaveClient = async (data: any) => {
    console.log("Guardar nuevo cliente:", data);
    setShowNewClientDialog(false);
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
        onSubmit={handleSaveClient}
        title="Registrar Nuevo Cliente"
        description="Complete los datos del cliente para crear la orden"
        submitButtonText="Guardar Cliente"
        showReferralEmail={false}
      />
    </>
  );
};

export default CreateOrderSearchClient;
