import React from "react";
import { TextAlignLeft, User } from "phosphor-react";
import ColumnText from "../../ColumnText/ColumnText";
import { Flex } from "antd";
import { useTranslations } from "use-intl";

const DescriptionSection: React.FC<{ description: string; uploadedBy: string }> = ({
  description,
  uploadedBy
}) => {
  const t = useTranslations("suppliers.drawer");
  const tCommon = useTranslations("common");
  return (
    <Flex vertical gap={8}>
      <ColumnText
        title={tCommon("fields.description")}
        icon={<TextAlignLeft size={14} color="#7B7B7B" />}
        content={description || "-"}
      />
      <ColumnText
        title={t("uploadedBy")}
        icon={<User size={14} color="#7B7B7B" />}
        content={uploadedBy || "-"}
      />
    </Flex>
  );
};

export default DescriptionSection;
