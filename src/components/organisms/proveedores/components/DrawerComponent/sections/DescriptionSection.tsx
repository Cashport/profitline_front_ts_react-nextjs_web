import React from "react";
import { TextAlignLeft, User } from "phosphor-react";
import ColumnText from "../../ColumnText/ColumnText";
import { Flex } from "antd";

const DescriptionSection: React.FC<{ description: string; uploadedBy: string }> = ({
  description,
  uploadedBy
}) => (
  <Flex vertical gap={8}>
    <ColumnText
      title="Descripción"
      icon={<TextAlignLeft size={14} color="#7B7B7B" />}
      content={description || "-"}
    />
    <ColumnText
      title="Cargado por"
      icon={<User size={14} color="#7B7B7B" />}
      content={uploadedBy || "-"}
    />
  </Flex>
);

export default DescriptionSection;
