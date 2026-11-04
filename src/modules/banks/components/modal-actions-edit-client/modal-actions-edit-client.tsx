"use client";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Flex, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";
import { editClient, getClientsByProject } from "@/services/banksPayments/banksPayments";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import GeneralSelect from "@/components/ui/general-select";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import { ISingleBank } from "@/types/banks/IBanks";

import "./modal-actions-edit-client.scss";
const { Title } = Typography;

interface infoObject {
  file: File;
  fileList: File[];
}

interface ISelect {
  value: string;
  label: string;
}

interface IFormEditClient {
  client: string;
  change_for: ISelect;
  evidence: File | undefined;
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: Boolean) => void;
  selectedRows: ISingleBank[] | undefined;
}

const ModalActionsEditClient = ({ isOpen, onClose, selectedRows }: Props) => {
  const t = useTranslations("banks.editCustomer");
  const tShared = useTranslations("banks.shared");
  const tCommon = useTranslations("common");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState<ISelect[]>([]);
  const { ID } = useAppStore((state) => state.selectedProject);
  const userId = useAppStore((state) => state.userId);

  const { showMessage } = useMessageApi();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClientsByProject(ID);

        const testClients = response.map((client) => {
          const key = Object.keys(client)[0];
          const value = client[key];
          return {
            value: value.toString(),
            label: key
          };
        });

        setClients(testClients);
      } catch (error) {
        console.error("Error al cargar los clientes del input");
      }
    };
    fetchClients();
  }, [ID]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isValid }
  } = useForm<IFormEditClient>({
    defaultValues: {
      client: selectedRows && selectedRows?.length > 0 ? selectedRows[0].CLIENT_NAME : undefined
    }
  });

  const evidence = watch("evidence");

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  const handleOnChangeDocument: any = (info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        showMessage("error", tShared("fileTooLarge", { maxMb: 30 }));
        return;
      }
      setValue("evidence", rawFile);
      trigger("evidence");
    }
  };

  const handleOnDeleteDocument = () => {
    setValue("evidence", undefined);
    trigger("evidence");
  };

  const onSubmit = async (data: IFormEditClient) => {
    setIsSubmitting(true);
    if (!selectedRows) return;

    try {
      await editClient({
        id_user: userId,
        payment_ids: selectedRows?.map((row) => row.id),
        client_id: data.change_for.value,
        evidence: data.evidence,
        current_client_id: selectedRows[0].id_client.toString()
      });

      showMessage("success", t("success"));

      onClose();
    } catch (error) {
      showMessage("error", t("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      className="modalActionsEditClient"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <Title level={4}>{t("title")}</Title>

      <p className="modalActionsEditClient__subTitle">{t("subtitle")}</p>
      <Flex gap={"1rem"}>
        <InputForm
          customStyle={{ width: "100%" }}
          titleInput={tCommon("fields.customer")}
          control={control}
          nameInput="client"
          error={errors.client}
          defaultValue={
            selectedRows && selectedRows.length > 0 ? selectedRows[0].CLIENT_NAME : undefined
          }
          readOnly
        />

        <Controller
          name="change_for"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <GeneralSelect
              errors={errors.change_for}
              field={field}
              title={t("changeTo")}
              placeholder={t("customerPlaceholder")}
              options={clients}
              showSearch
              customStyleContainer={{ width: "100%" }}
              customStyleTitle={{ marginBottom: "4px" }}
            />
          )}
        />
      </Flex>

      <div className="modalActionsEditClient__file">
        <Flex vertical>
          <p>{tShared("evidence")}</p>
          <em>{tShared("optional")}</em>
        </Flex>
        <DocumentButton
          key={evidence?.name}
          title={evidence?.name}
          handleOnChange={handleOnChangeDocument}
          handleOnDelete={() => handleOnDeleteDocument()}
          fileName={evidence?.name}
          fileSize={evidence?.size}
        />
      </div>

      <div className="modalActionsEditClient__footer">
        <SecondaryButton onClick={() => onClose(true)}>{tCommon("actions.cancel")}</SecondaryButton>

        <PrincipalButton
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid}
          loading={isSubmitting}
        >
          {t("title")}
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default ModalActionsEditClient;
