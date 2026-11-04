import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Modal, Typography } from "antd";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";

import "./modal-filter-select-dates.scss";
const { Title } = Typography;

export interface IFormFilterDates {
  start_date: Date;
  end_date: Date;
}

interface Props {
  isOpen: boolean;
  // eslint-disable-next-line no-unused-vars
  onClose: (cancelClicked?: boolean) => void;
  // eslint-disable-next-line no-unused-vars
  selectDates?: (data: IFormFilterDates) => void;
}

const ModalFilterSelectDates = ({ isOpen, onClose, selectDates }: Props) => {
  const t = useTranslations("banks.filters");
  const tCommon = useTranslations("common");
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    reset
  } = useForm<IFormFilterDates>();

  useEffect(() => {
    return () => {
      reset();
    };
  }, [isOpen]);

  const onSubmit = (data: IFormFilterDates) => {
    if (selectDates) {
      selectDates(data);
      onClose();
    }
  };

  return (
    <Modal
      className="modalFilterSelectDates"
      width={686}
      footer={null}
      open={isOpen}
      closable={false}
      destroyOnClose
    >
      <Title level={4}>{t("selectDates")}</Title>

      <div className="modalFilterSelectDates__dates">
        <InputDateForm
          titleInput={t("from")}
          nameInput="start_date"
          control={control}
          error={errors.start_date}
        />

        <InputDateForm
          titleInput={t("to")}
          nameInput="end_date"
          control={control}
          error={errors.end_date}
        />
      </div>

      <FooterButtons
        onClose={() => onClose()}
        handleOk={handleSubmit(onSubmit)}
        isConfirmDisabled={!isValid}
        titleConfirm={tCommon("actions.filter")}
      />
    </Modal>
  );
};

export default ModalFilterSelectDates;
