import { Button, Flex, Popover, Typography } from "antd";
import { Plus } from "phosphor-react";
import { useTranslations } from "use-intl";

import { InputCreateZone } from "@/components/atoms/inputs/InputCreateZone/InputCreateZone";

import "./selectzonebr.scss";

export const SelectDocumentsByClientBR = () => {
  const t = useTranslations("shared.selects.documentsByClient");
  return (
    <div className="selectzonebr">
      <Typography.Text className="title">{t("title")}</Typography.Text>
      <Flex vertical className="zones">
        <Popover content={<InputCreateZone isEditAvailable />} trigger="click" placement="bottom">
          <Button icon={<Plus size={"16px"} />} className="addButton" type="text">
            {t("addCustomer")}
          </Button>
        </Popover>
      </Flex>
    </div>
  );
};
