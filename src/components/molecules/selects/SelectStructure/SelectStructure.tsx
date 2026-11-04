import { useTranslations } from "use-intl";
import { Dispatch, SetStateAction } from "react";
import { Flex, Spin, Typography } from "antd";
import useSWR from "swr";

import { useAppStore } from "@/lib/store/store";
import { fetcher } from "@/utils/api/api";
import { IChanel, ISelectedBussinessRules } from "@/types/bre/IBRE";

import "./selectstructure.scss";
import { SelectChips } from "../SelectChips/SelectChips";
import { GenericResponse } from "@/types/global/IGlobal";
interface Props {
  selectedBusinessRules: ISelectedBussinessRules;
  disabled: boolean;
  setSelectedBusinessRules: Dispatch<SetStateAction<ISelectedBussinessRules>>;
}
export const SelectStructure = ({
  disabled,
  selectedBusinessRules,
  setSelectedBusinessRules
}: Props) => {
  const t = useTranslations("shared.selects");
  const { ID } = useAppStore((state) => state.selectedProject);
  const { data: response, isLoading } = useSWR<GenericResponse<IChanel[]>>(
    `/bussines-rule/project/${ID}`,
    fetcher,
    {}
  );

  return (
    <div className="selectstructure">
      <Typography.Text className="title">{t("structure")}</Typography.Text>
      <Flex className="structure" gap={"1rem"}>
        {isLoading ? (
          <Spin />
        ) : (
          <>
            {response &&
              typeof response.data !== "string" &&
              response.data?.map(({ CHANNEL_ID, CHANNEL_NAME, CHANNEL_LINES }) => {
                return (
                  <SelectChips
                    key={CHANNEL_ID}
                    lines={CHANNEL_LINES}
                    channelId={CHANNEL_ID}
                    selectedBusinessRules={selectedBusinessRules}
                    setSelectedBusinessRules={setSelectedBusinessRules}
                    channelName={CHANNEL_NAME}
                    disabled={disabled}
                  />
                );
              })}
          </>
        )}
      </Flex>
    </div>
  );
};
