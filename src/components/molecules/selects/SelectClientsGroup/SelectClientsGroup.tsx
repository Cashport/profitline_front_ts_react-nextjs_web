import { useTranslations } from "use-intl";
import { Dispatch, SetStateAction } from "react";
import { Checkbox, Flex, Spin, Typography } from "antd";
import { useClientsGroupsSimplified } from "@/hooks/useClientsGroupsSimplified";

import "./selectClientsGroup.scss";

interface Props {
  disabled?: boolean;
  assignedGroups: number[];
  setAssignedGroups: Dispatch<SetStateAction<number[]>>;
}

export const SelectClientsGroup = ({ disabled, assignedGroups, setAssignedGroups }: Props) => {
  const t = useTranslations("shared.selects");
  const { data, loading: isLoading } = useClientsGroupsSimplified();

  return (
    <div className="selectClientsGroup">
      <Typography.Text className="title">{t("customerGroups")}</Typography.Text>
      <Flex vertical className="cardGroups">
        {isLoading ? (
          <Spin />
        ) : (
          <>
            {data?.map((group) => {
              return (
                <Flex key={group.id} justify="space-between" className="cardGroups__group">
                  <Typography.Text>{group.group_name}</Typography.Text>
                  <Checkbox
                    checked={assignedGroups?.includes(group.id)}
                    disabled={disabled}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setAssignedGroups([...assignedGroups, group.id]);
                      } else {
                        setAssignedGroups(assignedGroups?.filter((id) => id !== group.id));
                      }
                    }}
                    className="checboxzone"
                  />
                </Flex>
              );
            })}
          </>
        )}
      </Flex>
    </div>
  );
};
