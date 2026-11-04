import { Dispatch, SetStateAction, createContext, useEffect, useState } from "react";
import { Button, Modal } from "antd";
import { useTranslations } from "use-intl";

import { ModalBillingPeriod } from "../ModalBillingPeriod/ModalBillingPeriod";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";

import { ModalBusinessRules } from "../ModalBusinessRules/ModalBusinessRules";
import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import { IShipTo, ShipToFormType } from "@/types/shipTo/IShipTo";

import "./modalShipTo.scss";
import { ModalCreateShipTo } from "./ModalCreateShipTo/ModalCreateShipTo";
import { ISelectType } from "@/types/clients/IClients";
import { MessageInstance } from "antd/es/message/interface";

interface Props {
  setIsShipToModalOpen: Dispatch<
    SetStateAction<{
      open: boolean;
      accounting_code: string | undefined;
    }>
  >;
  isShipToModalOpen: {
    open: boolean;
    accounting_code: string | undefined;
  };
  getClientValues: () => {
    billingPeriod: string;
    radicationType: ISelectType;
    conditionPayment: ISelectType;
  };
  clientBillingPeriod: IBillingPeriodForm | undefined;
  messageApi: MessageInstance;
  createShipTo: (
    // eslint-disable-next-line no-unused-vars
    selectedData: ShipToFormType,
    // eslint-disable-next-line no-unused-vars
    zones: number[],
    // eslint-disable-next-line no-unused-vars
    selectedStructure: ISelectedBussinessRules,
    // eslint-disable-next-line no-unused-vars
    billingPeriod: IBillingPeriodForm | undefined,
    // eslint-disable-next-line no-unused-vars
    messageApi: MessageInstance
  ) => void;
  // eslint-disable-next-line no-unused-vars
  getShipTo: (shipToCode: string) => Promise<IShipTo>;
  editShipTo: (
    // eslint-disable-next-line no-unused-vars
    selectedData: ShipToFormType,
    // eslint-disable-next-line no-unused-vars
    zones: number[],
    // eslint-disable-next-line no-unused-vars
    selectedStructure: ISelectedBussinessRules,
    // eslint-disable-next-line no-unused-vars
    billingPeriod: IBillingPeriodForm | undefined,
    // eslint-disable-next-line no-unused-vars
    messageApi: MessageInstance
  ) => void;
}
type ShipToContext = {
  selectedShipToData: ShipToFormType | undefined;
  setSelectedShipToData: Dispatch<SetStateAction<ShipToFormType | undefined>>;
  clientBillingPeriod: IBillingPeriodForm | undefined;
  billingPeriod: IBillingPeriodForm | undefined;
  setBillingPeriod: Dispatch<SetStateAction<IBillingPeriodForm | undefined>>;
};

export const ShipToContext = createContext<ShipToContext>({
  selectedShipToData: undefined,
  setSelectedShipToData: () => {},
  clientBillingPeriod: undefined,
  billingPeriod: undefined,
  setBillingPeriod: () => {}
});

export const ModalShipTo = ({
  setIsShipToModalOpen,
  isShipToModalOpen,
  getClientValues,
  clientBillingPeriod,
  messageApi,
  createShipTo,
  getShipTo,
  editShipTo
}: Props) => {
  const t = useTranslations("modals.shipTo");
  const tCommon = useTranslations("common");
  const [currentView, setCurrentView] = useState<"main" | "businessRules">("main");
  const [selectedShipToData, setSelectedShipToData] = useState<ShipToFormType | undefined>();
  const [isBillingPeriodOpen, setIsBillingPeriodOpen] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<IBillingPeriodForm | undefined>();
  const [zones, setZones] = useState([] as number[]);
  const [selectedStructure, setSelectedStructure] = useState<ISelectedBussinessRules>(
    initDatSelectedBusinessRules
  );

  const handleSubmitShipTo = () => {
    // If we are editing
    if (isShipToModalOpen.accounting_code && selectedShipToData) {
      editShipTo(selectedShipToData, zones, selectedStructure, billingPeriod, messageApi);

      setCurrentView("main");
      setIsShipToModalOpen({ open: false, accounting_code: undefined });
      return;
    }
    if (selectedShipToData && !isShipToModalOpen.accounting_code) {
      createShipTo(selectedShipToData, zones, selectedStructure, billingPeriod, messageApi);
    }
    setCurrentView("main");
    setIsShipToModalOpen({ open: false, accounting_code: undefined });
  };

  useEffect(() => {
    const fetchShipTo = async () => {
      if (!isShipToModalOpen.accounting_code) {
        setBillingPeriod(undefined);
        setZones([]);
        setSelectedShipToData(undefined);
        setSelectedStructure(initDatSelectedBusinessRules);
        return;
      }
      const response = await getShipTo(isShipToModalOpen.accounting_code);
      setSelectedShipToData({
        shipTo: {
          code: response.accounting_code,
          dependency_client: Boolean(response.dependecy_client),
          address: response.full_address,
          address_id: response.address_id,
          billing_period: undefined,
          condition_payment: {
            value: response.condition_payment,
            label: response.condition_day.toString()
          },
          radication_type: { value: response.radication_type, label: response.radication_name },
          location_id: response.location_id,
          city_name: response.city
        }
      });
      setBillingPeriod(response.billing_period_config);
      setZones(response.zones?.map((zone) => zone.id) || []);
      setSelectedStructure({
        channels: response.channels?.map((channel) => channel.id) || [],
        lines: response.lines_info?.map((line) => line.id) || [],
        sublines: response.sub_lines?.map((subline) => subline.id) || []
      });
    };

    fetchShipTo();
  }, [isShipToModalOpen]);

  const businessRulesViewModal = {
    content: (
      <ModalBusinessRules
        setCurrentView={setCurrentView}
        zones={zones}
        setZones={setZones}
        selectedStructure={selectedStructure}
        setSelectedStructure={setSelectedStructure}
      />
    ),
    footer: (
      <div className="footer">
        <Button className="cancelButton" onClick={() => setCurrentView("main")}>
          {tCommon("actions.cancel")}
        </Button>
        <Button
          onClick={handleSubmitShipTo}
          disabled={selectedStructure.channels?.length === 0 || zones?.length === 0}
          className="acceptButton"
        >
          {isShipToModalOpen.accounting_code ? t("update") : t("create")}
        </Button>
      </div>
    )
  };

  return (
    <>
      <ShipToContext.Provider
        value={{
          selectedShipToData,
          setSelectedShipToData,
          clientBillingPeriod,
          billingPeriod,
          setBillingPeriod
        }}
      >
        <Modal
          zIndex={2}
          width={"40%"}
          destroyOnClose
          open={isShipToModalOpen.open}
          className="modalcreateshipto"
          okButtonProps={{
            className: "buttonOk"
          }}
          cancelButtonProps={{
            className: "buttonCancel"
          }}
          footer={currentView === "businessRules" ? businessRulesViewModal.footer : null}
          onCancel={() => {
            setIsShipToModalOpen({ open: false, accounting_code: undefined });
          }}
        >
          {currentView === "main" && (
            <ModalCreateShipTo
              setIsShipToModalOpen={setIsShipToModalOpen}
              isShipToModalOpen={isShipToModalOpen}
              setCurrentView={setCurrentView}
              setIsBillingPeriodOpen={setIsBillingPeriodOpen}
              getClientValues={getClientValues}
            />
          )}
          {currentView === "businessRules" && businessRulesViewModal.content}
        </Modal>
        <ModalBillingPeriod
          isOpen={isBillingPeriodOpen}
          billingPeriod={billingPeriod}
          setIsBillingPeriodOpen={setIsBillingPeriodOpen}
          setBillingPeriod={setBillingPeriod}
        />
      </ShipToContext.Provider>
    </>
  );
};

const initDatSelectedBusinessRules: ISelectedBussinessRules = {
  channels: [],
  lines: [],
  sublines: []
};
