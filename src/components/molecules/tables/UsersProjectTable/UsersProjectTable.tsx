import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button, Flex, Popconfirm, Spin, Table, Typography } from "antd";
import type { MenuProps, TableProps } from "antd";

import { Eye, Plus, Triangle } from "phosphor-react";

import { useUsers } from "@/hooks/useUsers";
import { FilterUsers } from "@/components/atoms/Filters/FilterUsers/FilterUsers";
import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import {
  deleteUsersById,
  onResendInvitationUser,
  resendInvitationUsers
} from "@/services/users/users";
import { SUCCESS } from "@/utils/constants/globalConstants";

import { IUserSingle } from "@/types/users/IUsers";
import { UserZone, IBusinessRules } from "@/types/users/IUser";
import { ModalRemove } from "../../modals/ModalRemove/ModalRemove";

import "./usersprojecttable.scss";
import { useMessageApi } from "@/context/MessageContext";
import { useDebounce } from "@/hooks/useDeabouce";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { extractSingleParam } from "@/utils/utils";

const { Text } = Typography;

export const UsersProjectTable: React.FC = () => {
  const params = useParams(); // Get project ID from the URL
  const projectId = extractSingleParam(params.id) || "";

  const router = useRouter();

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState();
  const [isOpenModalRemove, setIsOpenModalRemove] = useState<boolean>(false);
  const { showMessage } = useMessageApi();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const onResendInvitation = async (email: string) => {
    const response = await onResendInvitationUser(email);
    if (response.status === SUCCESS) {
      showMessage("success", "La invitacion fue enviada nuevamente.");
    } else {
      showMessage("error", "Oops, hubo un error por favor intenta mas tarde.");
    }
  };

  const handleSeeUserDetail = (userId: number) => {
    router.push(`/proyectos/review/${projectId}/users/${userId}`); // Redirects to user details
  };

  const handleCreateUser = () => {
    router.push(`/proyectos/review/${projectId}/users/new`); // Redirects to create a new user
  };

  const columns: TableProps<IUserSingle>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "USER_NAME",
      key: "USER_NAME",
      sorter: (a, b) => a.USER_NAME?.localeCompare(b.USER_NAME),
      render: (text, { ID }) => (
        <button type="button" className="name" onClick={() => handleSeeUserDetail(ID)}>
          {text}
        </button>
      )
    },
    {
      title: "Correo",
      dataIndex: "EMAIL",
      key: "EMAIL",
      sorter: (a, b) => a?.EMAIL?.localeCompare(b?.EMAIL),
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Telefono",
      key: "PHONE",
      dataIndex: "PHONE",
      sorter: (a, b) => a?.PHONE?.localeCompare(b?.PHONE),
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Rol",
      key: "ROL_NAME",
      dataIndex: "ROL_NAME",
      sorter: (a, b) => a?.ROL_NAME?.localeCompare(b?.ROL_NAME),
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Clientes",
      key: "COUTN_CLIENTS",
      dataIndex: "COUTN_CLIENTS",
      render: (text) => <Text className="cell -clients">{text}</Text>
    },
    {
      title: "Zona",
      key: "USER_ZONES",
      dataIndex: "USER_ZONES",
      width: "120px",
      sorter: (a, b) => {
        const zoneA = a?.USER_ZONES?.[0]?.ZONE_DESCRIPTION || "";
        const zoneB = b?.USER_ZONES?.[0]?.ZONE_DESCRIPTION || "";
        return zoneA?.localeCompare(zoneB);
      },
      render: (arr) =>
        arr ? (
          arr.map((zone: UserZone) => (
            <Text className="cell -zone" key={zone.ZONE_ID}>
              {zone.ZONE_DESCRIPTION}
            </Text>
          ))
        ) : (
          <Text>-</Text>
        )
    },
    {
      title: "Responsabilidad",
      key: "BUSSINES_RULES",
      dataIndex: "BUSSINES_RULES",
      width: "210px",
      sorter: (a, b) => {
        const ruleA = a.BUSSINESS_RULES?.[0]?.CHANNEL_DESCRIPTION || "";
        const ruleB = b.BUSSINESS_RULES?.[0]?.CHANNEL_DESCRIPTION || "";
        return ruleA?.localeCompare(ruleB);
      },
      render: (arr) =>
        arr ? (
          <div className="responsabilityCell">
            {arr.map((channel: IBusinessRules, index: number) => (
              <Text
                className="cell -individualResponsability"
                key={`${index}${channel.CHANNEL_ID}`}
              >
                {channel.CHANNEL_DESCRIPTION}
              </Text>
            ))}
          </div>
        ) : (
          <Text>-</Text>
        )
    },
    {
      title: "Estado",
      key: "status",
      width: "150px",
      dataIndex: "status",
      sorter: (a, b) => (a.ACTIVE === b.ACTIVE ? 0 : a.ACTIVE ? -1 : 1),
      render: (_, { ACTIVE, EMAIL }) => (
        <>
          {ACTIVE ? (
            <Flex align="center" className={ACTIVE ? "statusContainer" : "statusContainerPending"}>
              <div className={ACTIVE ? "statusActive" : "statusPending"} />
              <Text>{ACTIVE ? "Activo" : "Inactivo"}</Text>
            </Flex>
          ) : (
            <Popconfirm
              placement="topRight"
              title={"Invitación pendiente de aprobación"}
              description={"Volver a Enviar invitacion?"}
              okText="Si"
              cancelText="No"
              onConfirm={() => onResendInvitation(EMAIL)}
            >
              <Flex
                align="center"
                className={ACTIVE ? "statusContainer" : "statusContainerPending"}
              >
                <div className={ACTIVE ? "statusActive" : "statusPending"} />
                <Text>{ACTIVE ? "Activo" : "Inactivo"}</Text>
              </Flex>
            </Popconfirm>
          )}
        </>
      )
    },
    {
      title: "",
      key: "seeProject",
      width: "40px",
      dataIndex: "",
      render: (_, { ID }) => (
        <Button
          className="buttonSeeProject"
          onClick={() => handleSeeUserDetail(ID)}
          icon={<Eye size={"1.3rem"} />}
        />
      )
    }
  ];

  const [selectedUsers, setSelectedUsers] = useState({
    zones: [] as any,
    roles: [] as any,
    status: "all" as "all" | "active" | "inactive",
    channel: [] as { id: number; name: string }[],
    line: [] as { id: number; name: string }[],
    subline: [] as { id: number; name: string }[]
  });

  const { data, loading, mutate } = useUsers({
    idProject: projectId,
    page: 1,
    rolesId: selectedUsers.roles,
    zonesId: selectedUsers.zones,
    activeUsers: selectedUsers.status,
    channel: selectedUsers.channel,
    line: selectedUsers.line,
    subline: selectedUsers.subline,
    searchQuery: debouncedSearchQuery
  });

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const deleteUsers = async () => {
    const response = await deleteUsersById(selectedRowKeys as number[], projectId);

    if (response.status === 200) {
      showMessage("success", "Los usuarios seleccionados fueron eliminados correctamente.");
      mutate(`/user/project/${projectId}?page=1`);
    } else {
      showMessage("error", "Oops, hubo un error por favor intenta mas tarde.");
    }
    setSelectedRowKeys([]);
    setIsOpenModalRemove(false);
    return selectedRows;
  };

  const onResendInviteSelectedUsers = async () => {
    const response = await resendInvitationUsers(selectedRowKeys as number[]);

    if (response.status === 200) {
      showMessage("success", "Invitación reenviada correctamente.");
    } else {
      showMessage("error", "Oops, hubo un error por favor intenta mas tarde.");
    }
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button className="buttonOutlined" onClick={onResendInviteSelectedUsers}>
          Reenviar invitación
        </Button>
      )
    },
    {
      key: "2",
      label: (
        <Button className="buttonOutlined" onClick={() => setIsOpenModalRemove(true)}>
          Eliminar
        </Button>
      )
    }
  ];
  return (
    <>
      <main className="mainUsersProjectTable">
        <Flex justify="space-between" align="center" className="mainUsersProjectTable_header">
          <Flex gap={"0.625rem"} align="center">
            <UiSearchInput
              placeholder="Buscar usuarios"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FilterUsers setSelectedUsers={setSelectedUsers} idProject={projectId} />
            <DotsDropdown items={items} />
          </Flex>
          <Button
            type="primary"
            className="buttonNewProject"
            size="large"
            onClick={handleCreateUser}
            icon={<Plus weight="bold" size={18} />}
          >
            Nuevo Usuario
          </Button>
        </Flex>
        {loading ? (
          <Flex style={{ height: "30%" }} align="center" justify="center">
            <Spin size="large" />
          </Flex>
        ) : (
          <Table
            className="usersTable"
            pagination={{
              itemRender: (page, type, originalElement) => {
                if (type === "prev") {
                  return <Triangle size={"0.8rem"} weight="fill" />;
                } else if (type === "next") {
                  return <Triangle size={"0.8rem"} weight="fill" />;
                }
                return originalElement;
              }
            }}
            columns={columns}
            dataSource={data.map((data) => ({ ...data, key: data.ID }))}
            rowSelection={rowSelection}
            rowClassName={(record) =>
              selectedRowKeys.includes(record.ID) ? "selectedRow" : "regularRow"
            }
          />
        )}
        <ModalRemove
          isMassiveAction={true}
          name="usuarios"
          isOpen={isOpenModalRemove}
          onClose={() => setIsOpenModalRemove(false)}
          onRemove={deleteUsers}
        />
      </main>
    </>
  );
};
