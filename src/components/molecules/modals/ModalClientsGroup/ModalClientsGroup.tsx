import { Dispatch, SetStateAction, useState } from "react";
import { Flex, message, Modal, Typography } from "antd";
import { useForm } from "react-hook-form";
import { useTranslations } from "use-intl";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { groupInfo } from "@/components/organisms/projects/ClientsGroupsProjectView/ClientsGroupsProjectView";
import { ClientsTableModal } from "../../tables/ClientsTableModal/ClientsTableModal";

import "./modalClientsGroup.scss";

const { Text } = Typography;

interface CreateGroupProps {
  isOpen: boolean;
  isEditGroup?: boolean;
  setIsOpenModal: Dispatch<SetStateAction<boolean>>;
  selectedGroupInfo?: groupInfo;
  // eslint-disable-next-line no-unused-vars
  updateClientsGroup?: (clients: string[]) => Promise<void>;
  // eslint-disable-next-line no-unused-vars
  createGroup?: (group: { name: string; clients: React.Key[] }) => Promise<void>;
}

export type NameType = {
  name: string;
};

export const ModalClientsGroup = ({
  isOpen,
  setIsOpenModal,
  isEditGroup,
  selectedGroupInfo,
  updateClientsGroup,
  createGroup
}: CreateGroupProps) => {
  const t = useTranslations("modals.clientsGroup");
  const tCommon = useTranslations("common");
  const [groupName, setGroupName] = useState("");
  const [clientsKeys, setClientsKeys] = useState<React.Key[]>([]);
  const [messageApi, contextHolder] = message.useMessage();
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<NameType>({
    defaultValues: { name: "" }
  });

  const onSubmitName = (data: NameType) => {
    setGroupName(data.name);
  };

  const onCancel = () => {
    setIsOpenModal(false);
    setGroupName("");
  };

  const onCreateGroup = () => {
    if (clientsKeys.length <= 0) {
      messageApi.open({ type: "warning", content: t("selectCustomersWarning") });
      return;
    }
    if (clientsKeys.length > 0) {
      try {
        const group = {
          name: groupName,
          clients: clientsKeys
        };
        if (createGroup) createGroup(group);
      } catch (error) {
        console.warn(error);
      }
    }

    setIsOpenModal(false);
    setGroupName("");
    setClientsKeys([]);
  };

  const onUpdateGroup = () => {
    if (!updateClientsGroup) return;
    updateClientsGroup(clientsKeys.map((client) => client.toString()));

    setIsOpenModal(false);
    setGroupName("");
    setClientsKeys([]);
  };

  return (
    <>
      {groupName === "" && !isEditGroup ? (
        <Modal
          title={t("newTitle")}
          open={isOpen}
          onCancel={onCancel}
          okButtonProps={{
            className: "buttonOk"
          }}
          cancelButtonProps={{
            className: "buttonCancel"
          }}
          okText={tCommon("actions.continue")}
          cancelText={tCommon("actions.cancel")}
          className="modalCreateClientsGroup"
          onOk={() => {
            handleSubmit(onSubmitName)();
          }}
        >
          {contextHolder}
          <Flex vertical>
            <Text>{t("enterName")}</Text>
            <form className="inputcreatezone">
              <InputForm
                titleInput={t("groupName")}
                control={control}
                nameInput="name"
                error={errors.name}
                customStyle={{
                  width: "96%",
                  backgroundColor: "transparent !important",
                  border: "1px solid white",
                  borderRadius: ".8rem"
                }}
                placeholder={tCommon("fields.name")}
              />
            </form>
          </Flex>
        </Modal>
      ) : (
        <Modal
          width={900}
          title={isEditGroup ? selectedGroupInfo?.groupName : groupName}
          open={isOpen}
          onCancel={onCancel}
          okButtonProps={{
            className: "buttonOk"
          }}
          cancelButtonProps={{
            className: "buttonCancel"
          }}
          okText={isEditGroup ? t("update") : t("create")}
          cancelText={tCommon("actions.cancel")}
          className="modalCreateClientsGroup"
          onOk={() => {
            isEditGroup ? onUpdateGroup() : onCreateGroup();
          }}
        >
          <Flex vertical>
            <Text>{isEditGroup ? t("selectToEdit") : t("selectToAdd")}</Text>
            <ClientsTableModal
              setClientsKeys={setClientsKeys}
              selectedClientsKeys={selectedGroupInfo?.clientsIds}
            />
          </Flex>
        </Modal>
      )}
    </>
  );
};
