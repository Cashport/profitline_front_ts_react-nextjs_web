"use client";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Flex, Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import { assignClient, getClientsByProject } from "@/services/banksPayments/banksPayments";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import GeneralSelect from "@/components/ui/general-select";

import { ISingleBank } from "@/types/banks/IBanks";

import "./modal-actions-assign-client.scss";
const { Title } = Typography;

interface infoObject {
  file: File;
  fileList: File[];
}

interface ISelect {
  value: string;
  label: string;
}

interface IFormAssignClient {
  client: ISelect;
  evidence: File | undefined;
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  selectedRows: ISingleBank[] | undefined;
}

const ModalActionsAssignClient = ({ isOpen, onClose, selectedRows }: Props) => {
  const t = useTranslations("banks.assignCustomer");
  const tShared = useTranslations("banks.shared");
  const tCommon = useTranslations("common");
  const [clients, setClients] = useState<ISelect[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  } = useForm<IFormAssignClient>();

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

  const onSubmit = async (data: IFormAssignClient) => {
    setIsSubmitting(true);
    try {
      if (!selectedRows) return;
      await assignClient({
        id_user: userId,
        payment_ids: selectedRows?.map((row) => row.id),
        client_id: data.client.value,
        evidence: data.evidence
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
      className="modalActionsAssignClient"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <Title level={4}>{t("title")}</Title>

      <p className="modalActionsAssignClient__subTitle">{t("subtitle")}</p>

      <Controller
        name="client"
        control={control}
        rules={{ required: true }}
        render={({ field }) => (
          <GeneralSelect
            errors={errors.client}
            field={field}
            title={tCommon("fields.customer")}
            placeholder={t("searchCustomer")}
            options={clients}
            titleAbsolute
            showSearch
            customStyleContainer={{ width: "50%" }}
          />
        )}
      />

      <div className="modalActionsAssignClient__file">
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

      <div className="modalActionsAssignClient__footer">
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

export default ModalActionsAssignClient;
