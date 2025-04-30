import { Calendar, Hourglass } from "phosphor-react";
import ColumnText from "../../ColumnText/ColumnText";
import { Flex } from "antd";
import { formatDate } from "@/utils/utils";

export const ValiditySection: React.FC<{ validity: string; date: string | null }> = ({
  validity,
  date
}) => (
  <Flex vertical gap={8}>
    {/* <ColumnText
      title="Vigencia"
      icon={<Hourglass size={16} color="#7B7B7B" />}
      content={validity ? `Hasta ${formatDate(validity)}` : "-"}
    /> */}
    <ColumnText
      title="Fecha cargue"
      icon={<Calendar size={14} color="#7B7B7B" />}
      content={date ? `${formatDate(date)}` : "-"}
    />
  </Flex>
);
