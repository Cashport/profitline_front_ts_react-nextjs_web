import { Modal } from "antd";
import "./modalPeriodicity.scss";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import { Controller, useForm } from "react-hook-form";
import GeneralSelect from "@/components/ui/general-select";
import { SelectDay } from "@/components/atoms/SelectDay/SelectDay";
import { IPeriodicityModalForm } from "@/types/communications/ICommunications";
import dayjs from "dayjs";
import { Dispatch, SetStateAction, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedPeriodicity: IPeriodicityModalForm | undefined;
  setSelectedPeriodicity: Dispatch<SetStateAction<IPeriodicityModalForm | undefined>>;
  isEditAvailable?: boolean;
  showCommunicationDetails: {
    communicationId: number;
    active: boolean;
  };
  resetOnParentClose?: boolean;
}
export const ModalPeriodicity = ({
  isOpen,
  onClose,
  selectedPeriodicity,
  setSelectedPeriodicity,
  isEditAvailable,
  showCommunicationDetails,
  resetOnParentClose = false
}: Props) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<IPeriodicityModalForm>({
    defaultValues: { days: [] },
    values: selectedPeriodicity
      ? {
          init_date: selectedPeriodicity.init_date,
          frequency_number: selectedPeriodicity.frequency_number,
          frequency: selectedPeriodicity.frequency,
          days: selectedPeriodicity.days,
          end_date: selectedPeriodicity.end_date
        }
      : ({} as IPeriodicityModalForm)
  });

  useEffect(() => {
    if (resetOnParentClose && !isOpen) {
      reset({
        init_date: undefined,
        frequency_number: undefined,
        frequency: undefined,
        days: [],
        end_date: undefined
      });
    }
  }, [isOpen, reset, resetOnParentClose]);

  const watchInitDate = watch("init_date");
  const watchFrequency = watch("frequency");
  const watchDays = watch("days");
  const watchFrequencyNumber = watch("frequency_number");

  const handleOnSave = (data: IPeriodicityModalForm) => {
    setSelectedPeriodicity(data);
    onClose();
  };

  return (
    <Modal
      className="modalPeriodicity"
      open={isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <h2 className="modalPeriodicity__title"> Establecer periodicidad</h2>
      <div className="modalPeriodicity__inputs">
        <p className="modalPeriodicity__inputs__name">Inicio</p>
        <InputDateForm
          titleInput=""
          hiddenIcon
          nameInput="init_date"
          placeholder="Seleccionar fecha"
          control={control}
          error={errors.init_date}
          minDate={dayjs(new Date().toUTCString())}
          validationRules={{ required: true }}
          disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
        />
        <p className="modalPeriodicity__inputs__name">Repetir cada</p>
        <div className="modalPeriodicity__inputs__repeat">
          <Controller
            name="frequency_number"
            control={control}
            rules={{
              required: true,
              pattern: {
                message: "valor invalido",
                value: /^(3[0-1]|[12][0-9]|[1-9]|0[1-9])$/
              }
            }}
            defaultValue={selectedPeriodicity?.frequency_number}
            render={({ field }) => (
              <div className="inputNumberContainer">
                <input
                  type="number"
                  className="inputNumberContainer__input"
                  name={field.name}
                  onChange={field.onChange}
                  value={field.value}
                  defaultValue={undefined}
                  readOnly={!isEditAvailable && !!showCommunicationDetails.communicationId}
                />
                {errors.frequency_number && (
                  <p className="error">{errors.frequency_number.message}</p>
                )}
              </div>
            )}
          />
          <Controller
            name="frequency"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <GeneralSelect
                errors={errors.frequency}
                field={field}
                placeholder="Semanal"
                options={repeatOptions}
                errorSmall
                customStyleContainer={{ width: "100%" }}
                readOnly={!isEditAvailable && !!showCommunicationDetails.communicationId}
              />
            )}
          />
        </div>
        <div className="modalPeriodicity__inputs__days">
          <Controller
            name="days"
            control={control}
            rules={{ required: watchFrequency?.value !== "Mensual" }}
            render={({ field }) => (
              <SelectDay
                {...field}
                onChange={(options) => field.onChange(options)}
                disabled={watchFrequency?.value === "Mensual"}
                readonly={!isEditAvailable && !!showCommunicationDetails.communicationId}
                value={field.value}
              />
            )}
          />
        </div>
        <p className="modalPeriodicity__inputs__name">Fin</p>
        <InputDateForm
          disabled={
            (!isEditAvailable && !!showCommunicationDetails.communicationId) || !watchInitDate
          }
          titleInput=""
          hiddenTitle
          hiddenIcon
          nameInput="end_date"
          placeholder="Seleccionar fecha"
          control={control}
          error={errors.end_date}
          minDate={dayjs(watchInitDate, "YYYY-MM-DD", true).add(1, "day")}
          validationRules={{
            validate: (value) => {
              const initDate = dayjs(watchInitDate, "YYYY-MM-DD", true);
              const inputDate = dayjs(value, "YYYY-MM-DD", true);
              if (inputDate.diff(initDate, "days") <= 0) {
                return "La fecha debe ser mínimo un día más que la fecha inicial";
              }
              return true;
            }
          }}
        />
      </div>
      <p className="modalPeriodicity__inputs__name">
        Se produce {watchFrequency?.value}{" "}
        {watchDays.length > 0
          ? `cada ${watchDays?.map((day) => `${day.value} `)}`
          : `${watchFrequencyNumber ? watchFrequencyNumber : "n"} veces `}
        iniciando el
        {watchInitDate ? ` ${dayjs(watchInitDate, "YYYY-MM-DD").format("DD/MM/YYYY")}` : "..."}
      </p>
      {!isEditAvailable && !!showCommunicationDetails.communicationId ? null : (
        <div className="modalPeriodicity__footer">
          <SecondaryButton onClick={() => onClose()}>Cancelar</SecondaryButton>
          <PrincipalButton disabled={!isValid} onClick={handleSubmit(handleOnSave)}>
            Guardar
          </PrincipalButton>
        </div>
      )}
    </Modal>
  );
};

const repeatOptions = [
  { value: "Semanal", label: "Semanal" },
  { value: "Mensual", label: "Mensual" }
];
