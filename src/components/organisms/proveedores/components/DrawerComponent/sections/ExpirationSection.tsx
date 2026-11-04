import React from "react";
import { Button, Flex } from "antd";
import ColumnText from "../../ColumnText/ColumnText";
import { Files } from "phosphor-react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { useTranslations } from "use-intl";

dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

import { API } from "@/utils/api/api";
import { InputDate } from "@/components/atoms/inputs/InputDate/InputDate";

interface ExpirationSectionProps {
  subjectId: string;
  documentTypeSubjectId: number;
  mutate: () => void;
  mutateSupplierInfo: () => void;
  expirationDate: string | null;
}

const ExpirationSection: React.FC<ExpirationSectionProps> = ({
  subjectId,
  documentTypeSubjectId,
  mutate,
  mutateSupplierInfo,
  expirationDate
}) => {
  const t = useTranslations("suppliers.drawer");
  const tCommon = useTranslations("common");
  const [loading, setLoading] = React.useState(false);
  const [newExpirationDate, setNewExpirationDate] = React.useState<dayjs.Dayjs | null>(null);
  const handleSave = async () => {
    try {
      setLoading(true);
      const dateToSend = newExpirationDate ? dayjs(newExpirationDate).toISOString() : null;
      await API.put(`/subject/${subjectId}/documentTypeSubjectId/${documentTypeSubjectId}`, {
        expirationDate: dateToSend
      });
      mutate();
      mutateSupplierInfo();
    } catch (error) {
      console.error("Error updating expiration date:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (expirationDate) {
      setNewExpirationDate(dayjs.utc(expirationDate));
    } else {
      setNewExpirationDate(null);
    }
  }, [expirationDate]);

  return (
    <Flex vertical gap={16} style={{ width: "100%" }}>
      <ColumnText
        title={t("expiration")}
        icon={<Files size={16} color="#7B7B7B" />}
        content={
          <InputDate
            titleInput={t("expiration")}
            value={newExpirationDate ? dayjs(newExpirationDate) : undefined}
            onChange={(date) => setNewExpirationDate(date)}
            hiddenTitle
            customStyleContainer={{ width: "100%" }}
            placeholder={t("expirationPlaceholder")}
          />
        }
      />
      <Button
        onClick={handleSave}
        loading={loading}
        disabled={newExpirationDate?.isSame(dayjs.utc(expirationDate))}
        style={{ width: "fit-content", alignSelf: "flex-end" }}
      >
        {tCommon("actions.save")}
      </Button>
    </Flex>
  );
};

export default ExpirationSection;
