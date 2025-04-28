import { Dispatch, SetStateAction, useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { Flex, message, Spin, Table, TableProps, Typography } from "antd";
import { Triangle } from "phosphor-react";
import { FilterClients } from "@/components/atoms/Filters/FilterClients/FilterClients";
import { IClient } from "@/types/clients/IClients";
import { useClientsTable } from "@/hooks/useClients";
import UiSearchInput from "@/components/ui/search-input/search-input";
import { useDebounce } from "@/hooks/useDeabouce";

import "./clientsTableModal.scss";

const { Text, Link } = Typography;

interface Props {
  setClientsKeys: Dispatch<SetStateAction<React.Key[]>>;
  selectedClientsKeys?: string[];
}

export const ClientsTableModal = ({ setClientsKeys, selectedClientsKeys }: Props) => {
  const [allSelectedKeys, setAllSelectedKeys] = useState<React.Key[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [page, setPage] = useState(1);
  const [messageApi, contextHolder] = message.useMessage();
  const [filterClients, setFilterClients] = useState({
    city: [] as number[],
    holding: [] as number[],
    risk: [] as number[],
    payment_condition: [] as number[],
    radication_type: [] as number[],
    status: [] as number[]
  });

  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const { id: idProject } = useParams<{ id: string }>();

  const { data, isLoading, error } = useClientsTable({
    idProject,
    page: page,
    city: filterClients.city,
    holding: filterClients.holding,
    risk: filterClients.risk,
    payment_condition: filterClients.payment_condition,
    radication_type: filterClients.radication_type,
    status: filterClients.status,
    messageApi,
    searchQuery: debouncedSearchQuery
  });

  useEffect(() => {
    if (typeof error === "string") {
      messageApi.open({ type: "error", content: error });
    } else if (error?.message) {
      messageApi.open({ type: "error", content: error.message });
    }
  }, [error]);

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  useEffect(() => {
    return () => {
      setPage(1);
      setSelectedRowKeys([]);
      setAllSelectedKeys([]);
      setSearchQuery("");
      setFilterClients({
        city: [] as number[],
        holding: [] as number[],
        risk: [] as number[],
        payment_condition: [] as number[],
        radication_type: [] as number[],
        status: [] as number[]
      });
    };
  }, []);

  // eslint-disable-next-line no-unused-vars
  const initializeStates = useMemo(() => {
    if (selectedClientsKeys && selectedClientsKeys.length > 0) {
      setSelectedRowKeys(selectedClientsKeys);
      setAllSelectedKeys(selectedClientsKeys);
    }
  }, [selectedClientsKeys]);

  useEffect(() => {
    setClientsKeys(allSelectedKeys);
  }, [allSelectedKeys]);

  useEffect(() => {
    const availableKeys = data?.data?.map((client) => client.nit) as React.Key[];
    const selectedKeys = allSelectedKeys.filter((key) => availableKeys?.includes(key));

    if (!isLoading && !error && availableKeys && selectedKeys) {
      setSelectedRowKeys(selectedKeys);
    }
  }, [page, data]);

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys((prevSelectedRowKeys) => {
      if (prevSelectedRowKeys) {
        // adds the new selected rows to the previous selected rows
        // but first filters the ones that are already in the selected rows
        const filteredSelectedKeys = newSelectedRowKeys.filter(
          (newSelectedKey) =>
            !prevSelectedRowKeys.some((prevSelectedKey) => prevSelectedKey === newSelectedKey)
        );

        // filters the unselected keys
        if (newSelectedRowKeys.length != prevSelectedRowKeys.length) {
          //
          const unCheckedRows = prevSelectedRowKeys?.filter(
            (prevSelectedKey) => !newSelectedRowKeys.includes(prevSelectedKey)
          );
          if (unCheckedRows.length > 0) {
            const filteredPrevSelectedKeys = prevSelectedRowKeys.filter(
              (prevSelectedKey) => !unCheckedRows.includes(prevSelectedKey)
            );

            const filteredAllSelectedKeys = allSelectedKeys.filter(
              (allSelectedKey) => !unCheckedRows.includes(allSelectedKey)
            );
            setAllSelectedKeys(filteredAllSelectedKeys);
            return filteredPrevSelectedKeys;
          }
        }

        setAllSelectedKeys([...allSelectedKeys, ...filteredSelectedKeys]);
        return [...prevSelectedRowKeys, ...filteredSelectedKeys];
      } else {
        return newSelectedRowKeys;
      }
    });
  };

  const rowSelection = {
    columnWidth: 40,
    selectedRowKeys,
    onChange: onSelectChange
  };

  const columns: TableProps<IClient>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "client_name",
      key: "client_name",
      render: (text) => <Link underline>{text}</Link>
    },
    {
      title: "NIT",
      dataIndex: "nit",
      key: "nit",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Ship To",
      key: "shipTo",
      dataIndex: "shipTo",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Holding",
      key: "holding_name",
      dataIndex: "holding_name",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Cartera",
      key: "budget",
      dataIndex: "budget",
      render: (text) => <Text>{text}</Text>
    },
    {
      title: "Grupos",
      key: "groups",
      dataIndex: "groups",
      render: (text) => <Text>{text}</Text>
    }
  ];

  return (
    <main className="clientsTableModal">
      {contextHolder}
      <Flex justify="flex-start" gap={"0.5rem"} className="clientsTableModal_header">
        <UiSearchInput
          placeholder="Buscar clientes"
          onChange={(e) => {
            setPage(1);
            setSearchQuery(e.target.value);
          }}
        />
        <Flex>
          <FilterClients setFilterClients={setFilterClients} />
        </Flex>
      </Flex>

      {isLoading ? (
        <Flex style={{ height: "30%" }} align="center" justify="center">
          <Spin size="large" />
        </Flex>
      ) : (
        <Table
          columns={columns}
          dataSource={data?.data?.map((client) => ({
            ...client,
            key: client.nit
          }))}
          pagination={{
            current: page,
            pageSize: 50,
            showSizeChanger: false,
            onChange: onChangePage,
            total: data?.pagination?.totalRows,
            position: ["none", "bottomRight"],
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
          rowSelection={rowSelection}
        />
      )}
    </main>
  );
};
