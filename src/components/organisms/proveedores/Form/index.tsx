"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Table, Flex, Button, Typography } from "antd";
import DrawerComponent from "../components/DrawerComponent/DrawerComponent";
import { useParams, useRouter } from "next/navigation";
import { columns } from "./columns";
import Container from "@/components/atoms/Container/Container";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { CaretLeft } from "phosphor-react";
import { ModalGenerateAction } from "../components/ModalGenerateAction";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { InputNumber } from "@/components/atoms/inputs/InputNumber/InputNumber";
import { API } from "@/utils/api/api";
import { FieldError } from "react-hook-form";
import {
  Document,
  FormField,
  Props,
  ApiResponse,
  IOption,
  OPTIONS_TYPE_CLIENTS,
  UserType
} from "./types";
import "./form.scss";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";

const { Text } = Typography;

const SupplierForm: React.FC<Props> = ({ userType, clientTypeId }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue
  } = useForm<any>({
    defaultValues: {},
    disabled: false
  });

  const params = useParams();
  const router = useRouter();
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [modalGenerateActionVisible, setModalGenerateActionVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const handleOpenDrawer = () => setDrawerVisible(true);
  const handleCloseDrawer = () => setDrawerVisible(false);
  const handleCloseModal = () => setModalGenerateActionVisible(false);
  const handleOpenModal = () => setModalGenerateActionVisible(true);
  const handleGoBack = () => router.back();

  const supplierId = params?.id;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await API.get<ApiResponse>(`/subject/${supplierId}`);
        // Combinar todos los fields de todos los creationForms
        const allFields = response.data.creationForms?.reduce((acc: any[], form) => {
          if (form.fields) {
            return [...acc, ...form.fields];
          }
          return acc;
        }, []);

        if (allFields?.length) {
          setFormFields(allFields);
        }
        const allDocuments = [
          ...(response.data.forms?.map((form) => ({ ...form, type: "form" as const })) || []),
          ...(response.data.documents?.map((doc) => ({ ...doc, type: "document" as const })) || [])
        ];
        setDocuments(allDocuments);
      } catch (error) {
        console.error("Error fetching supplier data:", error);
      }
    };
    if (supplierId) {
      fetchData();
    }
  }, [supplierId]);

  useEffect(() => {
    // Initialize form values
    formFields.forEach((field: FormField) => {
      const fieldName = field.question.toLowerCase().replace(/\s+/g, "_");
      if (field.value !== undefined) {
        switch (field.formFieldType) {
          case "TEXT":
            setValue(fieldName, field.value === null ? "" : String(field.value));
            break;
          case "NUMBER":
            setValue(fieldName, typeof field.value === "number" ? field.value : null);
            break;
          case "SC":
            setValue(fieldName, field.value as IOption);
            break;
          case "MC":
            setValue(fieldName, Array.isArray(field.value) ? field.value : []);
            break;
        }
      }
    });
  }, [formFields, setValue]);

  const onSubmit = () => {};

  const renderFormField = (field: FormField) => {
    const fieldName = field.question.toLowerCase().replace(/\s+/g, "_");

    const commonProps = {
      titleInput: field.question,
      placeholder: `Ingresar ${field.description.toLowerCase()}`,
      control: control,
      nameInput: fieldName,
      error: errors?.[fieldName] as FieldError | undefined,
      disabled: true
    };

    switch (field.formFieldType) {
      case "TEXT":
        return <InputForm key={field.question} {...commonProps} typeInput={field.formFieldType} />;
      case "NUMBER":
        return <InputNumber key={field.question} {...commonProps} />;
      case "SC":
        return (
          <InputSelect
            key={field.question}
            {...commonProps}
            options={
              field.options?.opions.map((opt) => ({
                value: opt.value,
                label: opt.label
              })) || []
            }
            loading={false}
            placeholder={`Seleccionar ${field.description.toLowerCase()}`}
          />
        );
      case "MC":
        return (
          <InputSelect
            key={field.question}
            {...commonProps}
            options={
              field.options?.opions.map((opt) => ({
                value: opt.value,
                label: opt.label
              })) || []
            }
            loading={false}
            placeholder={`Seleccionar`}
            mode="tags"
          />
        );
      default:
        return null;
    }
  };

  const tableColumns = columns({ handleOpenDrawer, setSelectedDocument });

  const getHeaderTitle = () => {
    switch (userType) {
      case UserType.ADMIN:
        return (
          <Flex justify="space-between" align="center">
            <Button type="text" onClick={handleGoBack} icon={<CaretLeft size={"1.3rem"} />}>
              <Text
                strong
              >{`Crear ${OPTIONS_TYPE_CLIENTS.find((option) => option.value === clientTypeId)?.label}`}</Text>
            </Button>
            <GenerateActionButton onClick={handleOpenModal} />
          </Flex>
        );
      case UserType.CLIENT:
        return <></>;
      case UserType.APPROVER:
        return (
          <Flex justify="space-between" align="center">
            <Button type="text" onClick={handleGoBack} icon={<CaretLeft size={"1.3rem"} />}>
              <Text strong>Nuevo proveedor</Text>
            </Button>
            <GenerateActionButton onClick={handleOpenModal} />
          </Flex>
        );
      default:
        return "Nuevo proveedor";
    }
  };

  return (
    <div>
      <Container style={{ gap: 24 }}>
        {getHeaderTitle()}
        <Flex vertical gap={16}>
          <h3>Información General</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-grid">{formFields.map((field) => renderFormField(field))}</div>
          </form>
        </Flex>
        <hr style={{ border: "1px solid #DDDDDD" }} />
        <Flex vertical gap={16}>
          <h3>Documentos</h3>
          <Table dataSource={documents} columns={tableColumns} rowKey="id" pagination={false} />
        </Flex>
      </Container>
      <DrawerComponent
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        subjectId={supplierId.toString()}
        documentId={selectedDocument?.id ?? 0}
        control={control}
        errors={errors}
        type={selectedDocument?.type ?? "document"}
      />

      <ModalGenerateAction isOpen={modalGenerateActionVisible} onClose={handleCloseModal} />
    </div>
  );
};

export default SupplierForm;
