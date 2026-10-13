import { useState } from "react";
import { Button, Flex, Spin } from "antd";
import { ArrowsClockwise, CaretLeft, Pencil } from "phosphor-react";
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";

import "./selectedGroupView.scss";
import { GroupTable } from "@/components/molecules/tables/GroupTable/GroupTable";
import { groupInfo } from "../ClientsGroupsProjectView/ClientsGroupsProjectView";
import { ModalClientsGroup } from "@/components/molecules/modals/ModalClientsGroup/ModalClientsGroup";
import { useClientGroup } from "@/hooks/useClientGroup";
import { useClientsGroups } from "@/hooks/useClientsGroups";

interface PropsSelectedGroupView {
  onClickBack: () => void;
  showGroupDetails: {
    groupId: number;
    showDetails: boolean;
  };
}
export const SelectedGroupView = ({ onClickBack, showGroupDetails }: PropsSelectedGroupView) => {
  const [isOpenModalStatus, setIsOpenModalStatus] = useState({ status: false, remove: false });
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [groupInfoForEdit, setGroupInfoForEdit] = useState<groupInfo>({} as groupInfo);
  const { data, loading, updateClientsGroup } = useClientGroup(showGroupDetails.groupId);
  const { changeGroupsState, deleteSelectedGroups } = useClientsGroups({});

  const handleEditGroup = () => {
    data &&
      setGroupInfoForEdit({
        groupId: data?.data.id,
        groupName: data?.data.group_name,
        clientsIds: data?.data.clients.map((client) => client.id)
      });

    setIsOpenModal(true);
  };

  const onRemoveGroup = async () => {
    deleteSelectedGroups([showGroupDetails.groupId]);
    setIsOpenModalStatus({ status: false, remove: false });
  };

  const onActiveGroup = async () => {
    changeGroupsState([showGroupDetails.groupId], 1);
    setIsOpenModalStatus({ status: false, remove: false });
  };

  const onInactiveGroup = async () => {
    changeGroupsState([showGroupDetails.groupId], 0);
    setIsOpenModalStatus({ status: false, remove: false });
  };
  const onClickChangeState = () => {
    setIsOpenModalStatus({ status: true, remove: false });
  };

  return (
    <>
      <Flex component={"header"} className="headerSelectedGroupView">
        <Button
          type="text"
          size="large"
          onClick={onClickBack}
          className="buttonGoBack"
          icon={<CaretLeft size={"1.45rem"} />}
        >
          {data?.data.group_name ? data?.data.group_name : "Loading..."}
        </Button>

        <Flex gap="1.5rem">
          <Button
            size="large"
            htmlType="button"
            className="buttonOutlined"
            onClick={onClickChangeState}
            icon={<ArrowsClockwise size={"1.45rem"} />}
            loading={loading}
          >
            Cambiar Estado
          </Button>
          <Button
            size="large"
            onClick={handleEditGroup}
            className="buttonOutlined"
            icon={<Pencil size={"1.45rem"} />}
            loading={loading}
          >
            Editar Grupo
          </Button>
        </Flex>
      </Flex>

      {loading ? (
        <Flex style={{ height: "30%" }} align="center" justify="center">
          <Spin size="large" />
        </Flex>
      ) : (
        <GroupTable dataClients={data?.data.clients} />
      )}

      <ModalClientsGroup
        isOpen={isOpenModal}
        isEditGroup={true}
        setIsOpenModal={setIsOpenModal}
        selectedGroupInfo={groupInfoForEdit}
        updateClientsGroup={updateClientsGroup}
      />

      <ModalChangeStatus
        isActiveStatus={data?.data.active === 1 ? true : false}
        isOpen={isOpenModalStatus.status}
        onActive={onActiveGroup}
        onDesactivate={onInactiveGroup}
        onRemove={() => setIsOpenModalStatus({ remove: true, status: false })}
        onClose={() => setIsOpenModalStatus({ status: false, remove: false })}
      />
      <ModalRemove
        name="usuario"
        isOpen={isOpenModalStatus.remove}
        onClose={() => setIsOpenModalStatus({ status: false, remove: false })}
        onRemove={onRemoveGroup}
      />
    </>
  );
};
