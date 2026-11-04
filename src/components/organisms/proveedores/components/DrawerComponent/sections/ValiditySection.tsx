import { Calendar } from "phosphor-react";
import ColumnText from "../../ColumnText/ColumnText";
import { Flex } from "antd";
import { formatDate } from "@/utils/utils";
import { useTranslations } from "use-intl";

export const ValiditySection: React.FC<{ validity: string; date: string | null }> = ({
  validity: _validity,
  date
}) => {
  const t = useTranslations("suppliers.drawer");
  return (
    <Flex vertical gap={8}>
      {/* <ColumnText
      title="Vigencia"
      icon={<Hourglass size={16} color="#7B7B7B" />}
      content={validity ? `Hasta ${formatDate(validity)}` : "-"}
    /> */}
      <ColumnText
        title={t("uploadDate")}
        icon={<Calendar size={14} color="#7B7B7B" />}
        content={date ? `${formatDate(date)}` : "-"}
      />
    </Flex>
  );
};
