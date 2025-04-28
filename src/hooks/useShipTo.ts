import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { MessageInstance } from "antd/es/message/interface";
import { IShipTo, IShipTos, ShipToFormType } from "@/types/shipTo/IShipTo";
import {
  addShipTo,
  deleteShipToByCode,
  getShipToByCode,
  updateShipTo
} from "@/services/shipTo/shipTo";
import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";

export const useShipTos = (clientId: string) => {
  const { ID } = useAppStore((state) => state.selectedProject);

  const { data, isLoading, mutate } = useSWR<IShipTos>(
    `/ship-to/project/${ID}/client/${clientId}`,
    fetcher,
    {}
  );

  //create shipTo
  const createShipTo = async (
    selectedData: ShipToFormType,
    zones: number[],
    selectedStructure: ISelectedBussinessRules,
    billingPeriod: IBillingPeriodForm | undefined,
    messageApi: MessageInstance
  ) => {
    await addShipTo(
      clientId,
      ID,
      selectedData,
      zones,
      selectedStructure,
      billingPeriod,
      messageApi
    );
    mutate();
  };

  const getShipTo = async (shipToCode: string) => {
    const response: IShipTo = await getShipToByCode(shipToCode, ID);
    return response;
  };

  //delete shipTo
  const deleteShipTo = async (shipToCode: string, messageApi: MessageInstance) => {
    await deleteShipToByCode(shipToCode, ID, messageApi);
    mutate();
  };

  //update shipTo
  const editShipTo = async (
    selectedData: ShipToFormType,
    zones: number[],
    selectedStructure: ISelectedBussinessRules,
    billingPeriod: IBillingPeriodForm | undefined,
    messageApi: MessageInstance
  ) => {
    await updateShipTo(
      clientId,
      ID,
      selectedData,
      zones,
      selectedStructure,
      billingPeriod,
      messageApi
    );
    mutate();
  };

  return {
    data: (data?.data as IShipTo[]) || ([] as IShipTo[]),
    isLoading,
    createShipTo,
    getShipTo,
    deleteShipTo,
    editShipTo
  };
};
