"use client";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Flex, Modal, Typography } from "antd";
import { Plus } from "phosphor-react";
import { useTranslations } from "use-intl";

import { renameFile } from "@/utils/utils";
import { useAppStore } from "@/lib/store/store";
import { getClientsByProject, splitPayment } from "@/services/banksPayments/banksPayments";

import { useMessageApi } from "@/context/MessageContext";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import GeneralSelect from "@/components/ui/general-select";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";

import { ISingleBank } from "@/types/banks/IBanks";

import "./modal-actions-split-payment.scss";
const { Title } = Typography;

interface infoObject {
  file: File;
  fileList: File[];
}

interface ISelect {
  value: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: Boolean) => void;
  selectedRows: ISingleBank[] | undefined;
}

export interface PaymentForm {
  client: ISelect | null;
  value: number;
  evidence: File | undefined;
}

const ModalActionsSplitPayment = ({ isOpen, onClose, selectedRows }: Props) => {
  const t = useTranslations("banks.splitPayment");
  const tShared = useTranslations("banks.shared");
  const tCommon = useTranslations("common");
  const formatMoney = useAppStore((state) => state.formatMoney);
  const { ID } = useAppStore((state) => state.selectedProject);
  const userId = useAppStore((state) => state.userId);
  const [availableMoney, setAvailableMoney] = useState<number>();
  const [clients, setClients] = useState<ISelect[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showMessage } = useMessageApi();

  useEffect(() => {
    //useEffect to set and clean the availableMoney state
    if (selectedRows && typeof selectedRows[0]?.current_value === "number") {
      setAvailableMoney(selectedRows[0]?.current_value);
    }
    if (!isOpen) {
      setAvailableMoney(0);
    }
  }, [isOpen]);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isValid }
  } = useForm<{ payments: PaymentForm[] }>({
    mode: "onChange",
    defaultValues: { payments: [] }
  });

  const { fields, append } = useFieldArray({
    control,
    name: "payments"
  });

  useEffect(() => {
    if (isOpen) {
      reset(); // Clear the form when modal opens
      append({ client: null, value: 0, evidence: undefined }); // Start with one payment
    }
  }, [isOpen, append, reset]);

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

  const handleValueChange = (index: number, value: string) => {
    const numericValue = parseInt(value) || 0;
    const currentPayments = watch("payments");
    const totalUsed = currentPayments.reduce(
      (sum, payment, idx) => sum + (idx !== index ? payment.value || 0 : 0),
      0
    );

    const totalMoney = (selectedRows && selectedRows[0]?.current_value) || 0;

    // Calculate the remaining available money
    const remainingMoney = totalMoney - totalUsed;

    if (numericValue > remainingMoney) {
      setValue(`payments.${index}.value`, remainingMoney);
      setAvailableMoney(0);
    } else {
      setValue(`payments.${index}.value`, numericValue);
      setAvailableMoney(remainingMoney - numericValue);
      trigger(`payments.${index}.value`);
    }
  };

  const handleOnChangeDocument: any = (index: number, info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        showMessage("error", tShared("fileTooLarge", { maxMb: 30 }));
        return;
      }
      setValue(`payments.${index}.evidence`, rawFile);
      trigger(`payments.${index}.evidence`);
    }
  };

  const handleOnDeleteDocument = (index: number) => {
    setValue(`payments.${index}.evidence`, undefined);
    trigger(`payments.${index}.evidence`);
  };

  const onSubmit = async (data: { payments: PaymentForm[] }) => {
    setIsSubmitting(true);
    try {
      const dataArray = data.payments.map((payment, index) => ({
        id_client: payment.client?.value || "",
        ammount: payment.value,
        key_file: `${payment.evidence?.name.split(".")[0]}_${selectedRows ? selectedRows[0]?.id : ""}_${index + 1}`
      }));

      const renamedFiles = data.payments.map((payment, index) => {
        if (!payment.evidence) return;
        return renameFile(
          payment.evidence,
          `${payment.evidence?.name.split(".")[0]}_${selectedRows ? selectedRows[0]?.id : ""}_${index + 1}`
        );
      });

      await splitPayment({
        payment_id: (selectedRows && selectedRows[0]?.id) || 0,
        userId,
        data: dataArray,
        files: renamedFiles.filter((file) => file !== undefined) as File[]
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
      className="modalActionsSplitPayment"
      width="50%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <Title level={4}>{t("title")}</Title>

      <Flex justify="space-between">
        <Title style={{ fontWeight: 500 }} level={5}>
          {t("payment", {
            id: selectedRows && selectedRows.length > 0 ? String(selectedRows[0].id) : ""
          })}
        </Title>
        <Flex vertical align="flex-end">
          <strong className="modalActionsSplitPayment__availAmount">
            {formatMoney(availableMoney)}
          </strong>
          <p className="modalActionsSplitPayment__totalAmount">
            {formatMoney(selectedRows && selectedRows[0]?.current_value)}
          </p>
        </Flex>
      </Flex>

      <div className="modalActionsSplitPayment__payments">
        {fields.map((field, index) => (
          <Flex style={{ paddingBottom: "10px" }} key={field.id} vertical gap={"1rem"}>
            <Title style={{ fontWeight: 500 }} level={5}>
              {t("paymentPart", {
                id: String((selectedRows && selectedRows[0]?.id) ?? ""),
                index: index + 1
              })}
            </Title>
            <Flex gap={"1rem"}>
              <Controller
                name={`payments.${index}.client`}
                control={control}
                rules={{ required: t("customerRequired") }}
                render={({ field }) => (
                  <GeneralSelect
                    errors={errors?.payments?.[index]?.client}
                    field={field}
                    title={tCommon("fields.customer")}
                    placeholder={t("customerPlaceholder")}
                    options={clients}
                    showSearch
                    customStyleContainer={{ width: "100%" }}
                    customStyleTitle={{ marginBottom: "4px" }}
                  />
                )}
              />

              <InputFormMoney
                titleInput={tCommon("fields.value")}
                nameInput={`payments.${index}.value`}
                control={control}
                error={errors?.payments?.[index]?.value}
                placeholder={tCommon("fields.value")}
                customStyle={{ width: "100%" }}
                validationRules={{
                  required: t("valueRequired"),
                  min: { value: 1, message: t("valueMin") }
                }}
                changeInterceptor={(numericValue) => handleValueChange(index, numericValue)}
              />
            </Flex>

            <div className="modalActionsSplitPayment__file">
              <Flex vertical>
                <p>{tShared("evidence")}</p>
                <em>{tShared("required")}</em>
              </Flex>

              <Controller
                name={`payments.${index}.evidence`}
                control={control}
                rules={{ required: t("evidenceRequired") }}
                render={() => (
                  <>
                    <DocumentButton
                      key={watch(`payments.${index}.evidence`)?.name}
                      title={watch(`payments.${index}.evidence`)?.name}
                      handleOnChange={(info) => handleOnChangeDocument(index, info)}
                      handleOnDelete={() => handleOnDeleteDocument(index)}
                      fileName={watch(`payments.${index}.evidence`)?.name}
                      fileSize={watch(`payments.${index}.evidence`)?.size}
                    />
                  </>
                )}
              />
            </div>
          </Flex>
        ))}
      </div>

      <button
        className="modalActionsSplitPayment__addPayment"
        onClick={() => append({ client: null, value: 0, evidence: undefined })}
        disabled={
          availableMoney === null ||
          availableMoney === undefined ||
          !!(availableMoney && availableMoney <= 0)
        } // Disable the button if there's no more money left
      >
        <Plus />
        {t("addPayment")}
      </button>

      <div className="modalActionsSplitPayment__footer">
        <SecondaryButton onClick={() => onClose(true)} bordered={false}>
          {tCommon("actions.cancel")}
        </SecondaryButton>

        <PrincipalButton
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          loading={isSubmitting}
        >
          {t("title")}
        </PrincipalButton>
      </div>
    </Modal>
  );
};

export default ModalActionsSplitPayment;
