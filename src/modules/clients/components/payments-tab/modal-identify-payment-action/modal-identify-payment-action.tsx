import { FC, useEffect, useState } from "react";
import { Checkbox, Flex, Modal } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft } from "phosphor-react";

import { useMessageApi } from "@/context/MessageContext";
import { useAppStore } from "@/lib/store/store";
import {
  getAccountsByProject,
  getPaymentTypes,
  identifyPayment
} from "@/services/clientsPayments/clientsPayments";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import GeneralSelect from "@/components/ui/general-select";
import { InputFormMoney } from "@/components/atoms/inputs/InputFormMoney/InputFormMoney";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { DocumentButton } from "@/components/atoms/DocumentButton/DocumentButton";
import ModalNotIdentifiedPayment from "../modal-not-identified-payment";
import ModalIdentifiedPayments from "../modal-identified-payments";

import {
  IFormIdentifyPaymentModal,
  IIdentifiedPayment
} from "@/types/clientPayments/IClientPayments";

import "./modal-identify-payment-action.scss";

interface ModalIdentifyPaymentProps {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean, mutatePaymentsData?: boolean) => void;
}

interface infoObject {
  file: File;
  fileList: File[];
}

interface ISelect {
  value: string | number;
  label: string;
}

const ModalIdentifyPayment: FC<ModalIdentifyPaymentProps> = ({ isOpen, onClose }) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [accounts, setAccounts] = useState<ISelect[]>([]);
  const [paymentTypes, setPaymentTypes] = useState<ISelect[]>([]);
  const [identifiedPayments, setIdentifiedPayments] = useState<IIdentifiedPayment[]>();
  const [viewInfo, setViewInfo] = useState<{
    current: "form" | "identified" | "not_identified";
    paymentInfo: IFormIdentifyPaymentModal | undefined;
  }>({ current: "form", paymentInfo: undefined });
  const [key, setKey] = useState<number>(0); // Key to force remount

  const { showMessage } = useMessageApi();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<IFormIdentifyPaymentModal>();

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!projectId) {
        setAccounts([]);
        return;
      }

      try {
        const res = await getAccountsByProject(projectId);
        const formattedAccounts = res.map((account) => ({
          value: account.id,
          label: `${account.bank_name} ${account.account_number}`
        }));
        setAccounts(formattedAccounts);
      } catch (error) {
        console.error("Failed to fetch accounts", error);
        setAccounts([]);
      }
    };
    fetchAccounts();

    const fetchPaymentTypes = async () => {
      try {
        const res = await getPaymentTypes();
        const formattedPaymentTypes = res.map((paymentType) => ({
          value: paymentType.id,
          label: paymentType.name
        }));
        setPaymentTypes(formattedPaymentTypes);
      } catch (error) {
        console.error("Failed to fetch payment types", error);
        setPaymentTypes([]);
      }
    };
    fetchPaymentTypes();
  }, [projectId]);

  useEffect(() => {
    if (!isOpen) {
      reset();
      setKey((prevKey) => prevKey + 1); // Increment key to force remount
    }
  }, [isOpen]);

  const onSubmit = async (data: IFormIdentifyPaymentModal) => {
    setIsSubmitting(true);
    try {
      const res = await identifyPayment({
        accountId: data.account?.value as string,
        paymentDate: data.date?.format("YYYY-MM-DD"),
        amount: data.amount
      });

      // Open identified payments modal or not Identify modal
      if (res === 0) {
        showMessage("info", "No se identificó ningún pago");
        setViewInfo({ current: "not_identified", paymentInfo: data });
      } else {
        if (res && Array.isArray(res.data)) {
          setIdentifiedPayments(res.data);
        }
        setViewInfo({ current: "identified", paymentInfo: data });
      }
    } catch (error) {
      showMessage("error", "Error al identificar pago");
    } finally {
      setIsSubmitting(false);
    }
  };

  const evidence = watch("evidence");

  const handleOnDeleteDocument = () => {
    setValue("evidence", undefined); // Remove the file from "evidence"
    trigger("evidence"); // Trigger validation for "evidence"
  };

  const handleOnChangeDocument: any = (info: infoObject) => {
    const { file: rawFile } = info;
    if (rawFile) {
      const fileSizeInMB = rawFile.size / (1024 * 1024);
      if (fileSizeInMB > 30) {
        showMessage(
          "error",
          "El archivo es demasiado grande. Por favor, sube un archivo de menos de 30 MB."
        );
        return;
      }
      setValue("evidence", rawFile);
      trigger("evidence");
    }
  };

  return (
    <Modal
      className="identifyPaymentModal"
      width="60%"
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
      key={key} // Force remount
    >
      {viewInfo.current === "form" && (
        <>
          <button className="identifyPaymentModal__goBackBtn" onClick={() => onClose(true)}>
            <CaretLeft size="1.25rem" />
            Identificar pago
          </button>

          <p className="identifyPaymentModal__subTitle">
            Ingresa la información para crear identificar el pago
          </p>

          <div className="identifyPaymentModal__inputsContainer">
            <Controller
              name="account"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <GeneralSelect
                  field={field}
                  title="Cuenta"
                  placeholder="Seleccionar cuenta"
                  options={accounts}
                />
              )}
            />

            <InputDateForm
              titleInput="Fecha"
              hiddenIcon
              nameInput="date"
              placeholder="Seleccionar fecha"
              control={control}
              error={errors.date}
              validationRules={{
                required: "Fecha es obligatoria",
                validate: {
                  notFutureDate: (value) => {
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0); // Set time to midnight to compare only dates
                    return selectedDate <= today || "La fecha no puede ser futura";
                  }
                }
              }}
            />

            <InputFormMoney
              titleInput="Monto"
              nameInput={`amount`}
              control={control}
              error={errors?.amount}
              placeholder="Ingresar monto"
              customStyle={{ width: "100%" }}
              validationRules={{
                required: "Valor es obligatorio",
                min: { value: 1, message: "El valor debe ser mayor a 0" }
              }}
            />

            <InputForm
              validationRules={{ required: false }}
              titleInput="Referencia"
              control={control}
              nameInput="reference"
              placeholder="Ingresar No. de referencia"
              error={errors.reference}
            />

            <Controller
              name="payment_type"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <GeneralSelect
                  field={field}
                  title="Tipo de pago"
                  placeholder="Seleccionar tipo"
                  options={paymentTypes}
                />
              )}
            />

            <Controller
              name="is_advance_payment"
              control={control}
              render={({ field }) => (
                <Checkbox className="identifyPaymentModal__checkbox" {...field}>
                  Marcar pago como anticipo
                </Checkbox>
              )}
            />
          </div>

          <p className="identifyPaymentModal__subTitle">Adjunta la evidencia</p>

          <div className="identifyPaymentModal__file">
            <Flex vertical>
              <p>Evidencia</p>
              <em>*Obligatorio</em>
            </Flex>
            <Controller
              name="evidence"
              control={control}
              rules={{ required: "Evidencia es obligatoria" }}
              render={() => (
                <DocumentButton
                  key={evidence?.name || "default-key"}
                  title={evidence?.name}
                  handleOnChange={handleOnChangeDocument}
                  handleOnDelete={handleOnDeleteDocument}
                  fileName={evidence?.name}
                  fileSize={evidence?.size}
                />
              )}
            />
          </div>

          <div className="identifyPaymentModal__footer">
            <SecondaryButton onClick={() => onClose(true)}>Cancelar</SecondaryButton>

            <PrincipalButton onClick={handleSubmit(onSubmit)} disabled={!isValid || isSubmitting}>
              {isSubmitting ? "...enviando" : "Buscar"}
            </PrincipalButton>
          </div>
        </>
      )}

      {viewInfo.current === "not_identified" && (
        <ModalNotIdentifiedPayment setViewInfo={setViewInfo} onClose={onClose} />
      )}

      {viewInfo.current === "identified" && (
        <ModalIdentifiedPayments
          setViewInfo={setViewInfo}
          identifiedPayments={identifiedPayments}
          paymentInfo={viewInfo.paymentInfo}
          onClose={onClose}
        />
      )}
    </Modal>
  );
};

export default ModalIdentifyPayment;
