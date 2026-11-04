import { Button } from "antd";
import { ControllerRenderProps, FieldError, UseFormSetValue } from "react-hook-form";
import { Minus, Plus } from "phosphor-react";

import styles from "./inputExpirationNoticeDays.module.scss";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import { ICommunicationForm } from "@/types/communications/ICommunications";

type InputExpirationNoticeDaysProps = {
  nameInput: string;
  field?: ControllerRenderProps<ICommunicationForm, "trigger.settings.noticeDaysEvent">;
  error?: FieldError | undefined;
  setValue: UseFormSetValue<any>;
  event_days_before?: number | null;
  disabled?: boolean;
};

export const InputExpirationNoticeDays = ({
  nameInput,
  field,
  error,
  setValue,
  event_days_before,
  disabled
}: InputExpirationNoticeDaysProps) => {
  const t = useTranslations("components.expirationNoticeDays");
  const [noticeDays, setNoticeDays] = useState<{ days: number }>({
    days: 0
  });

  useEffect(() => {
    setNoticeDays({ days: event_days_before || 0 });
  }, []);

  useEffect(() => {
    if (disabled) return;
    setValue(nameInput, `${noticeDays.days}`, { shouldValidate: true });
  }, [disabled, noticeDays, setValue, nameInput]);

  const handleDecrementNotice = () => {
    if (disabled) return;
    setNoticeDays((prev) => {
      const newDays = { ...prev, days: prev.days - 1 };
      return newDays;
    });
  };

  const handleIncrementNotice = () => {
    if (disabled) return;
    setNoticeDays((prev) => {
      const newDays = { ...prev, days: prev.days + 1 };
      return newDays;
    });
  };
  return (
    <div className={styles.noticeDaysContainer}>
      <div className={styles.noticeDays}>
        <p className={styles.noticeDays__title}>{t("title")}</p>
        <Button
          disabled={disabled}
          className={styles.buttonMinus}
          onClick={() => handleDecrementNotice()}
        >
          <Minus size={14} weight="light" />
        </Button>

        <input
          readOnly
          className={styles.input}
          value={t("days", { count: noticeDays.days })}
          onChange={field?.onChange}
          onBlur={field?.onBlur}
          ref={field?.ref}
          disabled={disabled}
        />
        <Button
          disabled={disabled}
          className={styles.buttonPlus}
          onClick={() => handleIncrementNotice()}
        >
          <Plus size={14} weight="light" />
        </Button>
      </div>
      <p className={styles.noticeDaysContainer__error}>
        {error ? (error.message ? ` ${error.message}` : t("required")) : ""}
      </p>
    </div>
  );
};
