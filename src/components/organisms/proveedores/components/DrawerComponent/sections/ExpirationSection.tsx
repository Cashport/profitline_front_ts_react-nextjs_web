import React from "react";
import { Button, Flex, DatePicker } from "antd";
import ColumnText from "../../ColumnText/ColumnText";
import { Files } from "phosphor-react";
import dayjs from "dayjs";
import weekday from "dayjs/plugin/weekday";
import localeData from "dayjs/plugin/localeData";
import customParseFormat from "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import "dayjs/locale/es";

// dayjs.extend(weekday);
// dayjs.extend(localeData);
// dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.locale("es");

import { API } from "@/utils/api/api";

interface ExpirationSectionProps {
  subjectId: string;
  documentTypeSubjectId: number;
  mutate: () => void;
  expirationDate: string | null;
}

const ExpirationSection: React.FC<ExpirationSectionProps> = ({
  subjectId,
  documentTypeSubjectId,
  mutate,
  expirationDate
}) => {
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
        title="Vencimiento"
        icon={<Files size={16} color="#7B7B7B" />}
        content={
          <DatePicker
            placeholder="Seleccionar fecha de expiración"
            value={newExpirationDate ? dayjs(newExpirationDate) : null}
            onChange={(date) => setNewExpirationDate(date)}
            style={{ width: "100%" }}
          />
        }
      />
      <Button
        onClick={handleSave}
        loading={loading}
        disabled={
          newExpirationDate?.isSame(dayjs.utc(expirationDate)) || newExpirationDate === null
        }
        style={{ width: "fit-content", alignSelf: "flex-end" }}
      >
        Guardar
      </Button>
    </Flex>
  );
};

export default ExpirationSection;
