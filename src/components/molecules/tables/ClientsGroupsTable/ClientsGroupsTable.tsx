import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Flex, Popconfirm, Table, TableProps, Typography, Spin, MenuProps } from "antd";

import { Eye, Plus, Triangle } from "phosphor-react";
import { ModalClientsGroup } from "@/components/molecules/modals/ModalClientsGroup/ModalClientsGroup";
import { useClientsGroups } from "@/hooks/useClientsGroups";
import { IClientsGroup } from "@/types/clientsGroups/IClientsGroups";

import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";

import "./ClientsGroupsTable.scss";
import { ModalChangeStatus } from "../../modals/ModalChangeStatus/ModalChangeStatus";
import { useDebounce } from "@/hooks/useDeabouce";
import { getAppZoom } from "@/utils/utils";
import UiSearchInput from "@/components/ui/search-input/search-input";
import GenericCascaderFilter, {
  FilterOption
} from "@/components/atoms/Filters/GeneralFilter/GeneralFilter";

const { Text, Link } = Typography;

interface PropsClientsGroupsTable {
  setShowGroupDetails: Dispatch<
    SetStateAction<{
      groupId: number;
      showDetails: boolean;
    }>
  >;
}

export const ClientsGroupsTable = ({ setShowGroupDetails }: PropsClientsGroupsTable) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalStatus, setIsOpenModalStatus] = useState(false);
  const [height, setHeight] = useState<number>(window.innerHeight / getAppZoom());
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    clients: [] as string[],
    subscribers: [] as string[],
    status: "all" as "all" | "active" | "inactive"
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight / getAppZoom());
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const onCreateClientsGroup = () => {
    setIsOpenModal(true);
  };

  const { data, loading, deleteSelectedGroups, changeGroupsState, addGroup } = useClientsGroups({
    page,
    clients: filters.clients,
    subscribers: filters.subscribers,
    activeUsers: filters.status,
    searchQuery: debouncedSearchQuery
  });

  function handleSeeGroupDetails(groupId: number) {
    setShowGroupDetails({ groupId, showDetails: true });
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    columnWidth: 40,
    selectedRowKeys,
    onChange: onSelectChange
  };

  const handleOpenChangeGroupsState = () => {
    setIsOpenModalStatus(true);
  };

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  const deleteGroups = () => {
    deleteSelectedGroups(selectedRows.map((group: IClientsGroup) => group.id));
  };

  const handleChangeGroupsState = (selectedStatusState: boolean) => {
    const groups_id = selectedRows.map((group: IClientsGroup) => group.id);
    const status = selectedStatusState ? 1 : 0;

    changeGroupsState(groups_id, status);
    setIsOpenModalStatus(false);
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button className="buttonOutlined" onClick={handleOpenChangeGroupsState}>
          Cambiar de estado
        </Button>
      )
    },
    {
      key: "2",
      label: (
        <Button className="buttonOutlined" onClick={deleteGroups}>
          Eliminar
        </Button>
      )
    }
  ];

  const columns: TableProps<IClientsGroup>["columns"] = [
    {
      title: "Nombre Grupo",
      dataIndex: "group_name",
      key: "group_name",
      sorter: (a, b) => a.group_name.localeCompare(b.group_name),
      render: (text, row) => (
        <Link onClick={() => handleSeeGroupDetails(row.id)} underline>
          {text}
        </Link>
      )
    },
    {
      title: "Clientes",
      dataIndex: "clients_count",
      key: "clients_count",
      sorter: (a, b) => (a.clients_count || 0) - (b.clients_count || 0),
      render: (clients, row) => <Text>{row?.clients_count}</Text>
    },
    {
      title: "Suscritos",
      key: "subscribers",
      dataIndex: "subscribers",
      sorter: (a, b) => (a.subscribers || 0) - (b.subscribers || 0),
      render: (text) => <Text>{text ? text : 0}</Text>
    },
    {
      title: "Ship To",
      key: "shipto_count",
      dataIndex: "shipto_count",
      sorter: (a, b) => (a.shipto_count || 0) - (b.shipto_count || 0),
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Estado",
      key: "active",
      dataIndex: "active",
      sorter: (a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1),
      render: (_, { active }) => (
        <>
          {active ? (
            <Flex align="center" className={active ? "statusContainer" : "statusContainerPending"}>
              <div className={active ? "statusActive" : "statusPending"} />
              <Text>{active ? "Activo" : "Inactivo"}</Text>
            </Flex>
          ) : (
            <Popconfirm
              placement="topRight"
              title={"Invitación pendiente de aprobación"}
              description={"Volver a Enviar invitacion?"}
              okText="Si"
              cancelText="No"
            >
              <Flex
                align="center"
                className={active ? "statusContainer" : "statusContainerPending"}
              >
                <div className={active ? "statusActive" : "statusPending"} />
                <Text>{active ? "Activo" : "Inactivo"}</Text>
              </Flex>
            </Popconfirm>
          )}
        </>
      )
    },
    {
      title: "",
      key: "seeProject",
      width: 110,
      dataIndex: "",
      render: (_, row) => (
        <Button onClick={() => handleSeeGroupDetails(row.id)} icon={<Eye size={"1.3rem"} />} />
      )
    }
  ];

  const getFilters = async (): Promise<FilterOption[]> => {
    return [{ id: "status", name: "Estado" }];
  };

  const apiCallbacks = {
    status: async () => {
      return [
        { id: "active", name: "Activo" },
        { id: "inactive", name: "Inactivo" }
      ];
    }
  };
  const handleFilterChange = (filteredData: { [key: string]: string[] }) => {
    setFilters({
      clients: filteredData.clients || [],
      subscribers: filteredData.subscribers || [],
      status:
        ((filteredData.status && filteredData.status[0]) as "all" | "active" | "inactive") || "all"
    });
  };

  return (
    <main className="mainClientsGroupsTable">
      <Flex justify="space-between" align="center" className="mainClientsGroupsTable_header">
        <Flex gap={"1.75rem"}>
          <UiSearchInput
            placeholder="Buscar grupos de clientes"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <GenericCascaderFilter
            getFilters={getFilters}
            apiCallbacks={apiCallbacks}
            onFilterChange={handleFilterChange}
          />
          <DotsDropdown items={items} />
        </Flex>
        <Button
          type="primary"
          className="buttonNewProject"
          size="large"
          onClick={onCreateClientsGroup}
          icon={<Plus weight="bold" size={18} />}
        >
          Crear Grupo de Clientes
        </Button>
      </Flex>

      {loading ? (
        <Flex style={{ height: "30%" }} align="center" justify="center">
          <Spin size="large" />
        </Flex>
      ) : (
        <div className="container-table-of-ant-client-group">
          <Table
            columns={columns}
            dataSource={data?.data.map((data) => ({ ...data, key: data.id }))}
            rowSelection={rowSelection}
            rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
            virtual
            scroll={{ y: height - 400, x: 100 }}
            pagination={{
              current: page,
              pageSize: 25,
              showSizeChanger: false,
              position: ["none", "bottomRight"],
              total: data?.pagination?.totalRows,
              onChange: onChangePage,
              itemRender: (page, type, originalElement) => {
                if (type === "prev") {
                  return <Triangle size={".75rem"} weight="fill" className="prev" />;
                } else if (type === "next") {
                  return <Triangle size={".75rem"} weight="fill" className="next" />;
                } else if (type === "page") {
                  return <Flex className="pagination">{page}</Flex>;
                }
                return originalElement;
              }
            }}
          />
        </div>
      )}
      <ModalClientsGroup
        isOpen={isOpenModal}
        setIsOpenModal={setIsOpenModal}
        createGroup={addGroup}
      />
      <ModalChangeStatus
        isActiveStatus={true}
        isOpen={isOpenModalStatus}
        onClose={() => setIsOpenModalStatus(false)}
        customOnOk={handleChangeGroupsState}
      />
    </main>
  );
};
