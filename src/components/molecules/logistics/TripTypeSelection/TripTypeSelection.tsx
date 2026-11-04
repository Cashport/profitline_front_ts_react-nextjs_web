import { FunctionComponent } from "react";
import TripTypes from "../../../atoms/logistics/TripTypes/TripTypes";
import { Flex } from "antd";
import { useTranslations } from "use-intl";

export type TripTypeSelectionType = {};

const TripTypeSelection: FunctionComponent<TripTypeSelectionType> = () => {
  const t = useTranslations("shared.tripTypes");
  return (
    <Flex gap="middle">
      <TripTypes truck="/images/logistics/truck.svg" carga={t("cargo")} />
      <TripTypes
        truck="/images/logistics/izaje.svg"
        carga={t("lifting")}
        propWidth="32.5px"
        propTextDecoration="unset"
        propMinWidth="36px"
      />
      <TripTypes
        truck="/images/logistics/users.svg"
        carga={t("personnel")}
        propWidth="27px"
        propTextDecoration="none"
        propMinWidth="69px"
      />
    </Flex>
  );
};

export default TripTypeSelection;
