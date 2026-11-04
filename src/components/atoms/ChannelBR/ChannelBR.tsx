import { Dispatch, SetStateAction, useState } from "react";
import { Button, Flex, Popover, Tag, Typography, message } from "antd";
import { CaretDoubleRight, X } from "phosphor-react";
import { useTranslations } from "use-intl";

import { InputCreateLine } from "../inputs/InputCreateLine/InputCreateLine";
import { InputCreateSubline } from "../inputs/InputCreateSubline/InputCreateSubline";

import { ModalRemoveLine } from "@/components/molecules/modals/ModalRemoveLine/ModalRemoveLine";

import { IChanel } from "@/types/bre/IBRE";

import "./channelbr.scss";
import { useStructureBR } from "@/hooks/useBusinessRules";
import { ModalRemoveSubline } from "@/components/molecules/modals/ModalRemoveSubline/ModalRemoveSubline";

const { Text } = Typography;

interface Props {
  isDisabledEdit: boolean;
  channel: IChanel;
  setModalRemove: Dispatch<
    SetStateAction<{
      active: boolean;
      idChannel: number;
    }>
  >;
}
const initModalRemoveLine = { active: false, idChannel: 0, idLine: 0 };
const initModalRemoveSubline = { active: false, idLine: 0, idSubline: 0, nameSubline: "" };

export const ChannelBR = ({ isDisabledEdit, channel, setModalRemove }: Props) => {
  const t = useTranslations("components.channelBR");
  const [messageApi, contextHolder] = message.useMessage();

  const { removeLine, removeSubline } = useStructureBR();
  const [modalRemoveLine, setModalRemoveLine] = useState(initModalRemoveLine);
  const [modalRemoveSubline, setModalRemoveSubline] = useState(initModalRemoveSubline);
  const [isLoadingRemove, setIsLoadingRemove] = useState(false);

  const filterRemoveLine = channel?.CHANNEL_LINES?.filter(
    (line) => line.id === modalRemoveLine.idLine
  )?.[0] ?? { id: 0, name: "", sublines: [] };

  const removeLineAction = async () => {
    setIsLoadingRemove(true);
    removeLine(modalRemoveLine.idChannel, modalRemoveLine.idLine, messageApi);
    setIsLoadingRemove(false);
    setModalRemoveLine(initModalRemoveLine);
  };
  const removeSublineAction = async () => {
    setIsLoadingRemove(true);
    removeSubline(modalRemoveSubline.idLine, modalRemoveSubline.idSubline, messageApi);
    setIsLoadingRemove(false);
    setModalRemoveSubline(initModalRemoveSubline);
  };

  return (
    <>
      <Flex className="channelbr" vertical>
        {contextHolder}
        {/* ---------------------------------start channel------------------------------- */}
        <Flex justify="space-between">
          <Text className="titleLineBR">{channel.CHANNEL_NAME}</Text>
          {!isDisabledEdit && (
            <Button
              icon={<X size={"16px"} />}
              className="removebutton"
              onClick={() => setModalRemove({ active: true, idChannel: channel.CHANNEL_ID })}
            />
          )}
        </Flex>
        {/* ---------------------------------end channel------------------------------- */}
        {channel.CHANNEL_LINES?.map((line) => (
          <Flex key={line.id} className="lineBR" vertical>
            <Flex justify="space-between">
              {/* ---------------------------------start line------------------------------- */}
              <Text className="subtitleLineBR">{line.description}</Text>
              {!isDisabledEdit && (
                <Button
                  onClick={() =>
                    setModalRemoveLine({
                      active: true,
                      idChannel: channel.CHANNEL_ID,
                      idLine: line.id
                    })
                  }
                  icon={<X size={"16px"} />}
                  className="removebutton"
                />
              )}
            </Flex>
            {/* ---------------------------------end line------------------------------- */}
            {/* ---------------------------------start sublines------------------------------- */}
            <Flex className="mainSublinesBR">
              {line?.sublines?.map((subline) => (
                <Tag
                  key={subline.id}
                  closeIcon={
                    !isDisabledEdit && (
                      <Button
                        icon={<X size={"16px"} />}
                        onClick={() =>
                          setModalRemoveSubline({
                            active: true,
                            idLine: line.id,
                            idSubline: subline.id,
                            nameSubline: subline.description
                          })
                        }
                        className="removebutton"
                      />
                    )
                  }
                  className="tagSubLineBR"
                >
                  <p>{subline.description}</p>
                </Tag>
              ))}
            </Flex>
            {/* ---------------------------------end sublines------------------------------- */}
            {!isDisabledEdit && (
              <Popover
                content={<InputCreateSubline idLine={`${line.id}`} isEditAvailable />}
                trigger="click"
                placement="bottom"
              >
                <Button
                  icon={<CaretDoubleRight size={"16px"} />}
                  className="addButtonLineSub"
                  type="text"
                >
                  {t("addSubline")}
                </Button>
              </Popover>
            )}
          </Flex>
        ))}
        {!isDisabledEdit && (
          <Popover
            content={<InputCreateLine idChannel={`${channel.CHANNEL_ID}`} isEditAvailable />}
            trigger="click"
            placement="bottom"
          >
            <Button
              icon={<CaretDoubleRight size={"16px"} />}
              className="addButtonLineSub"
              type="text"
            >
              {t("addLine")}
            </Button>
          </Popover>
        )}
      </Flex>
      {/* -----------------Modals----------------- */}
      <ModalRemoveLine
        isOpen={modalRemoveLine.active}
        isLoading={isLoadingRemove}
        lineData={filterRemoveLine}
        onClose={() => setModalRemoveLine(initModalRemoveLine)}
        onRemove={removeLineAction}
      />
      <ModalRemoveSubline
        isOpen={modalRemoveSubline.active}
        isLoading={isLoadingRemove}
        sublineDescription={modalRemoveSubline.nameSubline}
        onClose={() => setModalRemoveSubline(initModalRemoveSubline)}
        onRemove={removeSublineAction}
      />
    </>
  );
};
