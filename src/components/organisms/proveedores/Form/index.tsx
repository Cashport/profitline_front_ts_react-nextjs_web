"use client";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { useForm } from "react-hook-form";
import { Table, Flex, Button, Typography } from "antd";
import { CaretLeft } from "phosphor-react";
import { FieldError } from "react-hook-form";

import { fetcher } from "@/utils/api/api";
import { deleteDocumentById } from "@/services/providers/providers";
import { extractSingleParam } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";

import DrawerComponent from "../components/DrawerComponent/DrawerComponent";
import { useParams, useRouter } from "next/navigation";
import { columns } from "./columns";
import Container from "@/components/atoms/Container/Container";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { ModalGenerateAction } from "../components/ModalGenerateAction";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { InputNumber } from "@/components/atoms/inputs/InputNumber/InputNumber";
import ModalAuditRequirements from "../components/ModalAuditRequirements/ModalAuditRequirements";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { ModalAddRequirement } from "../../projects/RequirementsView/components/ModalAddRequirement/ModalAddRequirement";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";

import { Document, FormField, Props, ApiResponse, IOption, UserType } from "./types";

import "./form.scss";

const { Text } = Typography;

const SupplierForm: React.FC<Props> = ({ userType, clientTypeId }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue
  } = useForm<any>({
    defaultValues: {},
    disabled: false
  });

  const { showMessage } = useMessageApi();

  const params = useParams();
  const router = useRouter();
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocumentRows, setSelectedDocumentRows] = useState<Document[]>();

  const [drawerVisible, setDrawerVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState({
    selected: 0
  });
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const handleOpenDrawer = () => setDrawerVisible(true);
  const handleCloseDrawer = () => setDrawerVisible(false);
  const handleCloseModal = () =>
    setIsModalOpen({
      selected: 0
    });
  const handleOpenModal = (modalNumber: number) =>
    setIsModalOpen({
      selected: modalNumber
    });
  const handleGoBack = () => router.back();

  const supplierId = extractSingleParam(params?.id);

  const { data, error, mutate } = useSWR<ApiResponse>(
    supplierId ? `/subject/${supplierId}` : null,
    fetcher,
    {}
  );

  useEffect(() => {
    if (error) {
      return;
    }
    if (data) {
      const allFields = data?.data?.creationForms?.reduce((acc: any[], form) => {
        if (form.fields) {
          return [...acc, ...form.fields];
        }
        return acc;
      }, []);

      if (allFields?.length) {
        setFormFields(allFields);
      }
      const allDocuments = [
        ...(data.data?.forms?.map((form) => ({ ...form, type: "form" as const })) || []),
        ...(data.data?.documents?.map((doc) => ({ ...doc, type: "document" as const })) || [])
      ];
      setDocuments(allDocuments);
    }
  }, [data]);

  useEffect(() => {
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
              <Text strong>{`Ver Proveedores`}</Text>
            </Button>
            <GenerateActionButton onClick={() => handleOpenModal(1)} />
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
            <GenerateActionButton onClick={() => handleOpenModal(1)} />
          </Flex>
        );
      default:
        return "Nuevo proveedor";
    }
  };

  const onSelectChange = (_newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedDocumentRows(newSelectedRow);
  };

  const rowSelection = {
    columnWidth: 40,
    selectedRowKeys: selectedDocumentRows?.map((row) => row.id) || [],
    onChange: onSelectChange
  };

  const handleDeleteDocument = async () => {
    setLoadingRequest(true);
    if (selectedDocumentRows?.length) {
      const ids = selectedDocumentRows.map((row) => row.id);
      try {
        await Promise.all(ids.map((id) => deleteDocumentById(supplierId ?? "0", id)));
        showMessage("success", "Documentos eliminados correctamente");
        setIsModalOpen({ selected: 0 });
        setSelectedDocumentRows([]);
        mutate();
      } catch (error) {
        showMessage("error", "Error al eliminar documentos");
      }
    }
    setLoadingRequest(false);
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
          <Table
            dataSource={documents.map((doc) => ({ ...doc, key: doc.id }))}
            columns={tableColumns}
            rowKey="id"
            pagination={false}
            rowSelection={rowSelection}
          />
        </Flex>
      </Container>
      <DrawerComponent
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        subjectId={supplierId?.toString() ?? ""}
        documentId={selectedDocument?.id ?? 0}
        control={control}
        errors={errors}
        type={selectedDocument?.type ?? "document"}
        mutateSupplierInfo={mutate}
      />

      <ModalGenerateAction
        isOpen={isModalOpen.selected === 1}
        onClose={handleCloseModal}
        selectedClientType={clientTypeId}
        handleOpenModal={handleOpenModal}
        selectedDocumentRows={selectedDocumentRows}
      />
      <ModalAuditRequirements
        isOpen={isModalOpen.selected === 2}
        onClose={(cancelClicked) => {
          if (cancelClicked) {
            return setIsModalOpen({ selected: 1 });
          }
          handleCloseModal();
          mutate();
          setSelectedDocumentRows([]);
        }}
        selectedRows={selectedDocumentRows}
      />
      <ModalAddRequirement
        isOpen={isModalOpen.selected === 3}
        onClose={(cancelClicked) => {
          if (cancelClicked) {
            return setIsModalOpen({ selected: 1 });
          }
          handleCloseModal();
          mutate();
        }}
        selectedClientType={clientTypeId}
      />
      <ModalConfirmAction
        isOpen={isModalOpen.selected === 4}
        onClose={() => {
          setIsModalOpen({ selected: 0 });
        }}
        onOk={handleDeleteDocument}
        title={`¿Está seguro de eliminar ${selectedDocumentRows?.length ?? 0} documento${(selectedDocumentRows?.length ?? 0) > 1 ? "s" : ""}?`}
        okText="Eliminar"
        okLoading={loadingRequest}
      />
    </div>
  );
};

export default SupplierForm;
