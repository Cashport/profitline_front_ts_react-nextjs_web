import { Dispatch, SetStateAction, useState } from "react";
import { Button, Flex, Popconfirm, Spin, Table, Typography, message } from "antd";
import type { MenuProps, TableProps } from "antd";

import { Eye, Plus, Triangle } from "phosphor-react";

import { useUsers } from "@/hooks/useUsers";
import { FilterUsers } from "@/components/atoms/FilterUsers/FilterUsers";
import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import { onResendInvitationUser } from "@/services/users/users";
import { SUCCESS } from "@/utils/constants/globalConstants";

import "./usersprojecttable.scss";
import { IUserSingle } from "@/types/users/IUsers";
import { UserZone, IBusinessRules } from "@/types/users/IUser";

const { Text, Link } = Typography;

interface Props {
  idProject: string;
  setIsCreateUser: Dispatch<SetStateAction<boolean>>;
  setIsViewDetails: Dispatch<SetStateAction<{ active: boolean; id: number }>>;
}

export const UsersProjectTable = ({ idProject, setIsCreateUser, setIsViewDetails }: Props) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState();
  const [messageApi, contextHolder] = message.useMessage();

  const onResendInvitation = async (email: string) => {
    const response = await onResendInvitationUser(email);
    if (response.status === SUCCESS) {
      messageApi.open({
        type: "success",
        content: "La invitacion fue enviada nuevamente."
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops, hubo un error por favor intenta mas tarde."
      });
    }
  };
  const columns: TableProps<IUserSingle>["columns"] = [
    {
      title: "Name",
      dataIndex: "USER_NAME",
      key: "USER_NAME",
      render: (text) => <Link underline>{text}</Link>
    },
    {
      title: "Correo",
      dataIndex: "EMAIL",
      key: "EMAIL",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Telefono",
      key: "PHONE",
      dataIndex: "PHONE",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Rol",
      key: "ROL_NAME",
      dataIndex: "ROL_NAME",
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
      width: "280px",
      render: (arr) =>
        arr ? (
          arr.map((channel: IBusinessRules) => (
            <Text className="cell" key={channel.CHANNEL_ID}>
              {channel.CHANNEL_DESCRIPTION}
            </Text>
          ))
        ) : (
          <Text>-</Text>
        )
    },

    {
      title: "Estado",
      key: "status",
      width: "150px",
      dataIndex: "status",
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
          onClick={() => setIsViewDetails({ active: true, id: ID })}
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

  const { data, loading } = useUsers({
    idProject,
    page: 1,
    rolesId: selectedUsers.roles,
    zonesId: selectedUsers.zones,
    activeUsers: selectedUsers.status,
    channel: selectedUsers.channel,
    line: selectedUsers.line,
    subline: selectedUsers.subline
  });

  const onCreateUser = () => {
    setIsViewDetails({ active: false, id: 0 });
    setIsCreateUser(true);
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  const deleteUsers = () => {
    return selectedRows;
  };

  const changeUsersState = () => {};

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button className="buttonOutlined" onClick={deleteUsers}>
          Reenviar invitación
        </Button>
      )
    },
    {
      key: "2",
      label: (
        <Button className="buttonOutlined" onClick={changeUsersState}>
          Cambiar estado
        </Button>
      )
    }
  ];
  return (
    <>
      {contextHolder}
      <main className="mainUsersProjectTable">
        <Flex justify="space-between" className="mainUsersProjectTable_header">
          <Flex gap={"1.75rem"}>
            <FilterUsers setSelectedUsers={setSelectedUsers} idProject={idProject} />
            <DotsDropdown items={items} />
          </Flex>
          <Button
            type="primary"
            className="buttonNewProject"
            size="large"
            onClick={onCreateUser}
            icon={<Plus weight="bold" size={15} />}
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
            rowClassName={(record) => (selectedRowKeys.includes(record.ID) ? "selectedRow" : "")}
          />
        )}
      </main>
    </>
  );
};
