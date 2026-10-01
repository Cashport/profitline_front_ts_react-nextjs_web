import React, { useMemo } from "react";
import { Controller, UseFormReturn, useFieldArray } from "react-hook-form";
import { Button, DatePicker, Flex, Select, Typography } from "antd";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import {
  FileObject,
  UploadDocumentButton
} from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import AnnualFeatures from "./annualFeatures/AnnualFeatures";
import { DiscountSchema } from "../../resolvers/generalResolver";
import { useAppStore } from "@/lib/store/store";
import { Pencil } from "phosphor-react";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import style from "./AnnualDiscountDefinition.module.scss";
import { fetcher } from "@/utils/api/api";
import useSWR from "swr";

const { Title, Text } = Typography;

type Props = {
  selectedType: number;
  form: UseFormReturn<DiscountSchema, any, undefined>;
  setFiles: React.Dispatch<React.SetStateAction<FileObject[]>>;
  statusForm: "create" | "edit" | "review";
  handleChangeStatusForm: (status: "create" | "edit" | "review") => void;
  loadingMain: boolean;
  handleUpdateContract: () => void;
};

export default function AnnualDiscountDefinition({
  form,
  setFiles,
  statusForm,
  handleChangeStatusForm,
  loadingMain,
  handleUpdateContract
}: Readonly<Props>) {
  const { ID: projectId } = useAppStore((project) => project.selectedProject);

  interface IResponseClients {
    status: number;
    message: string;
    data: IClient[];
  }
  interface IClient {
    client_id: string;
    client_name: string;
  }

  const { data: clients, isLoading } = useSWR<IResponseClients>(
    `/marketplace/projects/${projectId}/clients`,
    fetcher,
    {}
  );

  const {
    control,
    getValues,
    formState: { errors },
    watch
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "annual_ranges"
  });
  const clientName = watch("client_name");

  const options = useMemo(() => {
    return (
      clients?.data?.map((client: { client_name: string; client_id: string }) => ({
        label: client.client_name,
        value: client.client_id
      })) || []
    );
  }, [clients]);

  return (
    <Flex className={style.HeaderContainer} vertical gap={20}>
      <Flex gap={20} justify="space-between">
        <Title level={4}>Selecciona cliente</Title>
        {statusForm !== "create" && (
          <Button
            className={style.buttonEdit}
            htmlType="button"
            loading={loadingMain}
            onClick={(e) => {
              e.preventDefault();
              handleChangeStatusForm(statusForm === "review" ? "edit" : "review");
            }}
          >
            {statusForm === "review" ? "Editar Descuento" : "Cancelar Edicion"}
            <Pencil size={"1.2rem"} />
          </Button>
        )}
      </Flex>
      <Flex vertical>
        <Controller
          name="client"
          control={control}
          render={({ field }) => (
            <>
              <Select
                {...field}
                showSearch
                optionFilterProp="label"
                placeholder="Selecciona cliente"
                className={`${style.selectInput} translate`}
                loading={isLoading}
                variant="borderless"
                optionLabelProp="label"
                options={
                  statusForm !== "create" && field.value
                    ? [
                        ...options,
                        { value: field.value, label: clientName } // Añade el valor actual si no está en las opciones
                      ]
                    : options
                }
                value={field.value}
                disabled={statusForm !== "create"}
                filterOption={(input, option) =>
                  option!.label!.toString().toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              />
              <Text type="danger" hidden={!errors.client}>
                {errors?.client?.message}
              </Text>
            </>
          )}
        />
      </Flex>
      <Title level={4}>{statusForm === "create" ? "Adjuntar contrato" : "Ver contrato"}</Title>
      <Flex gap={20}>
        <UploadDocumentButton
          title="Contrato"
          isMandatory={true}
          setFiles={setFiles}
          containerClassName={style.uploadDocumentButton}
          draggerClassname={style.dragger}
          disabled={statusForm === "review" || !!getValues("contract_archive")}
        >
          {(statusForm === "review" || !!getValues("contract_archive")) && (
            <UploadDocumentChild
              showTrash={statusForm !== "review"}
              linkFile={getValues("contract_archive") || ""}
              nameFile={getValues("contract_archive")?.split("-").pop() || ""}
              onDelete={handleUpdateContract}
            />
          )}
        </UploadDocumentButton>
      </Flex>
      <Title level={4}>Descripción</Title>
      <Flex gap={20}>
        <InputForm
          control={control}
          error={errors.name}
          nameInput="name"
          titleInput="Nombre"
          className={style.input}
        />
        <InputForm
          control={control}
          error={errors.description}
          nameInput="description"
          titleInput="Descripción"
          className={style.inputDesc}
        />
      </Flex>
      <Title level={4}>Fechas</Title>
      <Flex gap={20}>
        <Flex vertical>
          <Controller
            name="start_date"
            control={control}
            render={({ field }) => {
              return (
                <>
                  <Text type="secondary">Inicio</Text>
                  <DatePicker
                    className={style.inputDatePicker}
                    placeholder="Inicio"
                    type="secondary"
                    {...field}
                  />
                  <Text type="danger" style={{ textWrap: "wrap" }} hidden={!errors.start_date}>
                    {errors?.start_date?.message}
                  </Text>
                </>
              );
            }}
          />
        </Flex>
        <Flex vertical>
          <Controller
            name="end_date"
            control={control}
            render={({ field }) => {
              return (
                <>
                  <Text type="secondary">Fin</Text>
                  <DatePicker
                    className={style.inputDatePicker}
                    placeholder="Fin"
                    type="secondary"
                    {...field}
                  />
                  <Text type="danger" style={{ textWrap: "wrap" }} hidden={!errors.end_date}>
                    {errors?.end_date?.message}
                  </Text>
                </>
              );
            }}
          />
        </Flex>
      </Flex>
      <hr></hr>
      <Title level={4}>Características del descuento</Title>
      <Title level={5}>Productos a aplicar</Title>
      <AnnualFeatures
        form={form}
        fields={fields}
        append={append}
        remove={remove}
        statusForm={statusForm}
      />
      {
        <Text type="danger" hidden={!errors.annual_ranges?.message}>
          {errors?.annual_ranges?.message}
        </Text>
      }
    </Flex>
  );
}
