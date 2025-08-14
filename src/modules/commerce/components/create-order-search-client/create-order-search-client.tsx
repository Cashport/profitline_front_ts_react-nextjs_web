import { FC, useContext } from "react";
import { Flex } from "antd";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";

import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { OrderViewContext } from "../../containers/create-order/create-order";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import SelectClient from "../create-order-select-client";

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

  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<selectClientForm>({});

  const handleCreateOrder = (data: selectClientForm) => {
    setClient({ name: data.client.label, id: data.client.value, email: data.client.email });
  };

  return (
    <>
      <Flex className={styles.FlexContainer} vertical>
        <h3 className={styles.FlexContainer__title}>Buscar cliente</h3>
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
    </>
  );
};

export default CreateOrderSearchClient;
