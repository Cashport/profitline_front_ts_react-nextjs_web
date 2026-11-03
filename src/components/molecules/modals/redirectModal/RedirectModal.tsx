import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { Typography, Modal, Flex } from "antd";
import { getTranslator } from "@/i18n/translator";
const { Text } = Typography;

export default function redirectModal() {
  const t = getTranslator("modals");
  Modal.warning({
    title: t("redirect.title"),
    content: <Text>{t("redirect.content")}</Text>,
    footer: [
      <Flex gap={"1rem"} justify="end" wrap="wrap" key="1">
        <PrincipalButton onClick={() => Modal.destroyAll()}>{t("redirect.gotIt")}</PrincipalButton>
      </Flex>
    ]
  });
}
