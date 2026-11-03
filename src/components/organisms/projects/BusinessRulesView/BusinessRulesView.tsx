import { useState } from "react";
import { Button, Flex, Typography } from "antd";
import { Pencil } from "phosphor-react";
import { useTranslations } from "use-intl";

import { SelectHoldingBR } from "@/components/molecules/selects/SelectHoldingBR/SelectHoldingBR";
import { SelectStructureBR } from "@/components/molecules/selects/SelectStructureBR/SelectStructureBR";
import { SelectZoneBR } from "@/components/molecules/selects/SelectZoneBR/SelectZoneBR";
import { DocumentClientBR } from "@/components/atoms/DocumentClientBR/DocumentClientBR";

const { Title } = Typography;

export const BusinessRulesView = () => {
  const t = useTranslations("projects.businessRules");
  const [isDisabledRules, setIsDisabledRules] = useState(true);

  return (
    <Flex vertical>
      <Flex justify="space-between">
        <Title level={5}>{t("title")}</Title>
        <Button
          size="large"
          onClick={() => setIsDisabledRules(!isDisabledRules)}
          className="buttonOutlined"
          style={{ display: "flex" }}
          icon={<Pencil size={"1.45rem"} />}
        >
          {isDisabledRules ? t("editRules") : t("viewRules")}
        </Button>
      </Flex>
      <Flex style={{ paddingTop: "1rem" }} gap="2rem">
        <Flex style={{ width: "27%" }} vertical>
          <SelectZoneBR isDisabledEdit={isDisabledRules} />
          {/* -------------comment for future use, this is block cause we haven't definition---------------------- */}
          <DocumentClientBR isDisabledEdit={isDisabledRules} />
        </Flex>
        <Flex style={{ width: "38%" }}>
          <SelectStructureBR isDisabledEdit={isDisabledRules} />
        </Flex>
        <Flex style={{ width: "27%" }}>
          <SelectHoldingBR isDisabledEdit={isDisabledRules} />
        </Flex>
      </Flex>
    </Flex>
  );
};
