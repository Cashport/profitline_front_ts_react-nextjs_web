import { useTranslations } from "use-intl";
import { Dispatch, SetStateAction, useCallback } from "react";
import { Checkbox, Flex, Tag, Typography } from "antd";

import { ISelectedBussinessRules, Line } from "@/types/bre/IBRE";

import "./selectchips.scss";

const { Text } = Typography;

interface Props {
  channelId: number;
  channelName: string;
  setSelectedBusinessRules: Dispatch<SetStateAction<ISelectedBussinessRules>>;
  selectedBusinessRules: ISelectedBussinessRules;
  lines: Line[];
  disabled: boolean;
}

export const SelectChips = ({
  channelName,
  lines,
  channelId,
  selectedBusinessRules,
  setSelectedBusinessRules = () => {},
  disabled
}: Props) => {
  const t = useTranslations("shared.selects");
  const {
    channels: selectedChannelsId,
    lines: selectedLinesId,
    sublines: selectedSublinesId
  } = selectedBusinessRules;

  const onChannelSelected = (channelId: number) => {
    return selectedChannelsId?.some((id) => id === channelId);
  };

  const onLineSelected = (lineId: number) => {
    return selectedLinesId?.some((id) => id === lineId);
  };

  const onSublineSelected = (sublineId: number) => {
    return selectedSublinesId?.some((id) => id === sublineId);
  };

  const handleChannelChange = useCallback(() => {
    setSelectedBusinessRules((prev) => {
      const isChannelSelected = prev.channels.includes(channelId);

      const updatedChannels = isChannelSelected
        ? prev.channels.filter((id) => id !== channelId)
        : [...prev.channels, channelId];

      let updatedLines = [...prev.lines];
      let updatedSublines = [...prev.sublines];

      lines?.forEach((line) => {
        if (isChannelSelected) {
          updatedLines = updatedLines.filter((id) => id !== line.id);
          updatedSublines = line.sublines
            ? updatedSublines.filter((id) => !line.sublines.some((subline) => subline.id === id))
            : [];
        } else {
          if (!updatedLines.includes(line.id)) {
            updatedLines.push(line.id);
          }
          line.sublines?.forEach((subline) => {
            if (!updatedSublines.includes(subline.id)) {
              updatedSublines.push(subline.id);
            }
          });
        }
      });

      return { ...prev, channels: updatedChannels, lines: updatedLines, sublines: updatedSublines };
    });
  }, [channelId, lines, setSelectedBusinessRules]);

  const handleLineChange = useCallback(
    (lineId: number) => {
      setSelectedBusinessRules((prev) => {
        const isLineSelected = prev.lines.includes(lineId);

        // Find the line and its sublines
        const line = lines.find((line) => line.id === lineId);
        const sublines = line && line.sublines ? line.sublines.map((subline) => subline.id) : [];

        const updatedLines = isLineSelected
          ? prev.lines.filter((id) => id !== lineId)
          : [...prev.lines, lineId];

        const updatedChannels = isLineSelected
          ? prev.channels
          : prev.channels.includes(channelId)
            ? prev.channels
            : [...prev.channels, channelId];

        const updatedSublines = isLineSelected
          ? prev.sublines?.filter((id) => !sublines.includes(id))
          : [...prev.sublines, ...sublines];

        return {
          ...prev,
          channels: updatedChannels,
          lines: updatedLines,
          sublines: updatedSublines
        };
      });
    },
    [setSelectedBusinessRules, lines, channelId]
  );

  const handleSublineChange = useCallback(
    (sublineId: number) => {
      setSelectedBusinessRules((prev) => {
        const isSublineSelected = prev.sublines?.includes(sublineId);

        // Find the line and channel that this subline belongs to
        let parentLineId = null;
        for (const line of lines) {
          if (line.sublines.some((subline) => subline.id === sublineId)) {
            parentLineId = line.id;
            break;
          }
        }

        const updatedSublines = isSublineSelected
          ? prev.sublines.filter((id) => id !== sublineId)
          : [...prev.sublines, sublineId];

        const updatedLines = isSublineSelected
          ? prev.lines
          : prev.lines.includes(parentLineId || 0)
            ? prev.lines
            : [...prev.lines, parentLineId || 0];

        const updatedChannels = isSublineSelected
          ? prev.channels
          : prev.channels.includes(channelId)
            ? prev.channels
            : [...prev.channels, channelId];

        return {
          ...prev,
          channels: updatedChannels,
          lines: updatedLines,
          sublines: updatedSublines
        };
      });
    },
    [setSelectedBusinessRules, lines, channelId]
  );

  return (
    <Flex className="selectchips" vertical>
      <Flex component="header" justify="space-between" className="headerselectchips">
        <Text className="titleChannel">{channelName}</Text>

        <Checkbox
          checked={onChannelSelected(channelId)}
          onChange={handleChannelChange}
          disabled={disabled}
        />
      </Flex>
      <Flex component="main" className="mainTags">
        {lines?.length > 0 ? (
          lines.map((line) => (
            <Flex key={line.id} vertical className="line">
              <Flex justify="space-between">
                <Text className="titleLine">{line.description}</Text>
                <Checkbox
                  checked={onLineSelected(line.id)}
                  onChange={() => handleLineChange(line.id)}
                  disabled={disabled}
                />
              </Flex>
              <Flex className="sublines">
                {line.sublines?.length > 0 ? (
                  <>
                    {line.sublines.map((subline) => {
                      return (
                        <Tag key={subline.id} className="tag">
                          {subline.description}
                          <Checkbox
                            checked={onSublineSelected(subline.id)}
                            onChange={() => handleSublineChange(subline.id)}
                            disabled={disabled}
                          />
                        </Tag>
                      );
                    })}
                  </>
                ) : (
                  <Text>{t("noSublines")}</Text>
                )}
              </Flex>
            </Flex>
          ))
        ) : (
          <Text>{t("noLines")}</Text>
        )}
      </Flex>
    </Flex>
  );
};
