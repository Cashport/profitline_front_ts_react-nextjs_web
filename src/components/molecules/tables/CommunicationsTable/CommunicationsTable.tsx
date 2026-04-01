import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Button, Flex, Table, TableProps, Typography, Spin, MenuProps } from "antd";
import { Eye, Plus, Triangle } from "phosphor-react";

import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import UiSearchInput from "@/components/ui/search-input";
import UiFilterDropdown from "@/components/ui/ui-filter-dropdown";

import "./communicationsTable.scss";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { getAllCommunications } from "@/services/communications/communications";
import { useAppStore } from "@/lib/store/store";
import { ICommunication } from "@/types/communications/ICommunications";

const { Text, Link } = Typography;

interface PropsCommunicationsTable {
  // eslint-disable-next-line no-unused-vars
  showCommunicationDetails: (communicationId: number) => void;
  onCreateCommunication: () => void;
}

export const CommunicationsTable = ({
  showCommunicationDetails,
  onCreateCommunication
}: PropsCommunicationsTable) => {
  const pathname = usePathname();
  const [communications, setCommunications] = useState<ICommunication[]>([]);
  // #UNUSED REACT STATE
  const [_search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const loading = false;

  useEffect(() => {
    const fetchCommunications = async () => {
      const response = await getAllCommunications(projectId);
      setCommunications(response);
    };
    fetchCommunications();
  }, [projectId, pathname]);

  function handleSeeCommunicationDetails(communicationId: number) {
    showCommunicationDetails(communicationId);
  }

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    columnWidth: 20,
    selectedRowKeys,
    onChange: onSelectChange
  };

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  const handleDeleteCommunications = () => {
    console.info(
      "deleteComms with id: ",
      selectedRows.map((row: any) => row.id)
    );
  };

  const columns: TableProps<ICommunication>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      render: (text, row) => (
        <Link onClick={() => handleSeeCommunicationDetails(row.id)} underline>
          {text}
        </Link>
      ),
      sorter: (a, b) => b.name.localeCompare(a.name),
      showSorterTooltip: false
    },
    {
      title: "Motivo",
      dataIndex: "description",
      key: "description",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => b.description.localeCompare(a.description),
      showSorterTooltip: false
    },
    {
      title: "Via",
      key: "via",
      dataIndex: "via",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => b.via.localeCompare(a.via),
      showSorterTooltip: false
    },
    {
      title: "Frecuencia",
      key: "JSON_frecuency",
      dataIndex: "JSON_frecuency",
      render: (_, row) => {
        const frequency = row?.JSON_frecuency?.repeat?.frequency;
        const interval = row?.JSON_frecuency?.repeat?.interval;
        const day = row?.JSON_frecuency?.repeat?.day;
        if (frequency?.toLowerCase() === "semanal") {
          return <Text>{`${day}, cada ${interval > 1 ? `${interval} semanas` : "semana"}`}</Text>;
        } else if (frequency?.toLowerCase() === "mensual") {
          return <Text>{`El día ${day}, cada ${interval > 1 ? `${interval} meses` : "mes"}`}</Text>;
        }
      },
      showSorterTooltip: false
    },
    {
      title: "Cantidad clientes",
      key: "clients",
      dataIndex: "clients",
      render: (text) => <Text>{text}</Text>,
      showSorterTooltip: false
    },
    {
      title: "",
      key: "seeProject",
      width: 50,
      dataIndex: "",
      render: (_, row) => (
        <Button
          className="buttonEye"
          onClick={() => handleSeeCommunicationDetails(row.id)}
          icon={<Eye size={"1.3rem"} />}
        />
      )
    }
  ];

  const items: MenuProps["items"] = [
    {
      key: "discount-option-1",
      label: (
        <Button className="buttonOutlined" onClick={handleDeleteCommunications}>
          Eliminar
        </Button>
      )
    }
  ];

  return (
    <main className="mainCommunicationsTable">
      <Flex justify="space-between">
        <Flex gap={"0.625rem"}>
          <UiSearchInput
            className="search"
            placeholder="Buscar"
            onChange={(event) => {
              setTimeout(() => {
                setSearch(event.target.value);
              }, 1000);
            }}
          />
          <UiFilterDropdown />
          <DotsDropdown items={items} />
        </Flex>
        <PrincipalButton onClick={onCreateCommunication}>
          Crear Comunicación
          <Plus weight="bold" size={15} />
        </PrincipalButton>
      </Flex>

      {loading ? (
        <Flex style={{ height: "30%" }} align="center" justify="center">
          <Spin size="large" />
        </Flex>
      ) : (
        <Table
          className="communicationsTable"
          columns={columns}
          dataSource={communications?.map((data) => ({ ...data, key: data.id }))}
          rowSelection={rowSelection}
          pagination={{
            current: page,
            showSizeChanger: false,
            position: ["none", "bottomRight"],
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
      )}
    </main>
  );
};
