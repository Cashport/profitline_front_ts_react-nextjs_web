import { Button, Flex, Popover, Spin, Typography, message } from "antd";
import { CaretRight, X, Plus } from "phosphor-react";
import { useTranslations } from "use-intl";

import { useClientTypes } from "@/hooks/useClientTypes";
import { InputCreateClientType } from "@/components/atoms/inputs/InputCreateClientType/InputCreateClientType";
import { DocumentCards } from "@/components/atoms/DocumentCards/DocumentCards";
import { InputCreateDocument } from "@/components/atoms/inputs/inputCreate/InputCreateDocument";

import "./documentclientbr.scss";

const { Text } = Typography;

interface Props {
  isDisabledEdit: boolean;
}

export const DocumentClientBR = ({ isDisabledEdit }: Props) => {
  const t = useTranslations("components.documentClientBR");
  const { data, loading, removeClient } = useClientTypes();
  const [messageApi, contextHolder] = message.useMessage();

  const handleDeleteClientType = (clientTypeId: number) => {
    removeClient(clientTypeId, messageApi);
  };

  return (
    <div className="contianerdocumentclientbr">
      {contextHolder}
      <Typography.Text className="title">{t("title")}</Typography.Text>
      <Flex vertical className="clientTypes">
        {loading ? (
          <Spin />
        ) : (
          <Flex className="documentclientbr" vertical gap={"0.5rem"}>
            {data?.map((document) => (
              <Flex className="clientTypeCard" vertical key={document.id}>
                <Flex justify="space-between">
                  <Text className="clientTypeCard__title">{document.clientType}</Text>
                  {!isDisabledEdit && (
                    <Button
                      icon={<X size={"16px"} />}
                      className="removebutton"
                      onClick={() => handleDeleteClientType(document.id)}
                    />
                  )}
                </Flex>
                <DocumentCards clientTypeId={document.id} isDisabledEdit={isDisabledEdit} />

                {!isDisabledEdit && (
                  <Popover
                    content={<InputCreateDocument clientTypeId={document.id} />}
                    trigger="click"
                    placement="bottom"
                  >
                    <Button
                      icon={<CaretRight size={"16px"} />}
                      className="addButtonLineSub"
                      type="text"
                    >
                      {t("addDocument")}
                    </Button>
                  </Popover>
                )}
              </Flex>
            ))}
            {!isDisabledEdit && (
              <Popover
                content={<InputCreateClientType isEditAvailable={!isDisabledEdit} />}
                trigger="click"
                placement="bottom"
              >
                <Button icon={<Plus size={"16px"} />} className="addButtonLineSub" type="text">
                  {t("addClientType")}
                </Button>
              </Popover>
            )}
          </Flex>
        )}
      </Flex>
    </div>
  );
};
