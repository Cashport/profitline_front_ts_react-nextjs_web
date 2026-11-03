import { useEffect, useState } from "react";
import { Button, Flex, Modal, Typography } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { InputDate } from "@/components/atoms/inputs/InputDate/InputDate";

import "./modal-download-billing-excel.scss";

const { Title } = Typography;

const API_DATE_FORMAT = "YYYY-MM-DD";
const DISPLAY_DATE_FORMAT = "DD/MM/YYYY";

type PresetKey = "today" | "last7" | "thisMonth" | "lastMonth";

// `key` es también la clave del texto en commerce.billingExcelModal.presets.
const PRESETS: { key: PresetKey; getRange: () => [Dayjs, Dayjs] }[] = [
  {
    key: "today",
    getRange: () => [dayjs().startOf("day"), dayjs().startOf("day")]
  },
  {
    key: "last7",
    getRange: () => [dayjs().subtract(6, "day").startOf("day"), dayjs().startOf("day")]
  },
  {
    key: "thisMonth",
    getRange: () => [dayjs().startOf("month"), dayjs().startOf("day")]
  },
  {
    key: "lastMonth",
    getRange: () => [
      dayjs().subtract(1, "month").startOf("month"),
      dayjs().subtract(1, "month").endOf("month").startOf("day")
    ]
  }
];

const DEFAULT_PRESET: PresetKey = "thisMonth";

const getRangeSummaryValues = (start: Dayjs, end: Dayjs) => ({
  start: start.format(DISPLAY_DATE_FORMAT),
  end: end.format(DISPLAY_DATE_FORMAT),
  days: end.startOf("day").diff(start.startOf("day"), "day") + 1
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (startDate: string, endDate: string) => void;
  isLoading?: boolean;
}

export const ModalDownloadBillingExcel = ({ isOpen, onClose, onDownload, isLoading }: Props) => {
  const t = useTranslations("commerce.billingExcelModal");
  const tCommon = useTranslations("common");
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);

  const handleSelectPreset = (key: PresetKey) => {
    const preset = PRESETS.find((item) => item.key === key);
    if (!preset) return;
    const [start, end] = preset.getRange();
    setActivePreset(key);
    setStartDate(start);
    setEndDate(end);
  };

  // Se recalcula en cada apertura para que "Este mes" siempre llegue hasta hoy
  useEffect(() => {
    if (isOpen) handleSelectPreset(DEFAULT_PRESET);
  }, [isOpen]);

  const handleStartDateChange = (date: Dayjs | null) => {
    setStartDate(date);
    setActivePreset(null);
  };

  const handleEndDateChange = (date: Dayjs | null) => {
    setEndDate(date);
    setActivePreset(null);
  };

  const handleClose = () => {
    if (isLoading) return;
    onClose();
  };

  const handleDownload = () => {
    if (!startDate || !endDate) return;
    onDownload(startDate.format(API_DATE_FORMAT), endDate.format(API_DATE_FORMAT));
  };

  return (
    <Modal
      className="modalDownloadBillingExcel"
      width={560}
      open={isOpen}
      title={
        <Title className="modalDownloadBillingExcel__title" level={4}>
          {t("title")}
        </Title>
      }
      footer={null}
      onCancel={handleClose}
    >
      <p className="modalDownloadBillingExcel__description">{t("description")}</p>

      <Flex wrap gap="0.375rem">
        {PRESETS.map((preset) => (
          <Button
            key={preset.key}
            type={activePreset === preset.key ? "primary" : "default"}
            onClick={() => handleSelectPreset(preset.key)}
            disabled={isLoading}
          >
            {t(`presets.${preset.key}`)}
          </Button>
        ))}
      </Flex>

      <div className="modalDownloadBillingExcel__dates">
        <InputDate
          titleInput={tCommon("fields.startDate")}
          placeholder={tCommon("placeholders.selectDate")}
          value={startDate ?? undefined}
          onChange={handleStartDateChange}
          maxDate={endDate ?? undefined}
          format={DISPLAY_DATE_FORMAT}
          allowClear={false}
          disabled={isLoading}
        />
        <InputDate
          titleInput={tCommon("fields.endDate")}
          placeholder={tCommon("placeholders.selectDate")}
          value={endDate ?? undefined}
          onChange={handleEndDateChange}
          minDate={startDate ?? undefined}
          format={DISPLAY_DATE_FORMAT}
          allowClear={false}
          disabled={isLoading}
        />
      </div>

      {startDate && endDate && (
        <p className="modalDownloadBillingExcel__summary">
          {t("rangeSummary", getRangeSummaryValues(startDate, endDate))}
        </p>
      )}

      <FooterButtons
        titleConfirm={tCommon("actions.download")}
        onClose={handleClose}
        handleOk={handleDownload}
        isConfirmDisabled={!startDate || !endDate}
        isConfirmLoading={isLoading}
      />
    </Modal>
  );
};
