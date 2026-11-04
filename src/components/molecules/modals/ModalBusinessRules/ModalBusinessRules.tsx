import { Dispatch, SetStateAction } from "react";
import { Button } from "antd";
import { useTranslations } from "use-intl";

import "./modalbusinessrules.scss";
import { SelectStructure } from "../../selects/SelectStructure/SelectStructure";
import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import { CaretLeft } from "phosphor-react";
import { SelectZone } from "../../selects/SelectZone/SelectZone";
interface Props {
  setCurrentView: Dispatch<SetStateAction<"main" | "businessRules">>;
  zones: number[];
  setZones: Dispatch<SetStateAction<number[]>>;
  selectedStructure: ISelectedBussinessRules;
  setSelectedStructure: Dispatch<SetStateAction<ISelectedBussinessRules>>;
}

export const ModalBusinessRules = ({
  setCurrentView,
  zones,
  setZones,
  selectedStructure,
  setSelectedStructure
}: Props) => {
  const t = useTranslations("modals.businessRules");
  return (
    <div className="modalBusinessRules">
      <Button
        className="modalTitle"
        icon={<CaretLeft size={"1.45rem"} />}
        onClick={() => setCurrentView("main")}
      >
        {t("title")}
      </Button>
      <SelectZone zones={zones} setZones={setZones} />
      <SelectStructure
        selectedBusinessRules={selectedStructure}
        setSelectedBusinessRules={setSelectedStructure}
        disabled={false}
      />
    </div>
  );
};
