import { useTranslations } from "use-intl";
import { Table, TableProps, Typography } from "antd";

const { Text } = Typography;
import "./groupTable.scss";
import { IClient } from "@/types/clientsGroups/IClientsGroups";

interface PropsGroupTable {
  dataClients: IClient[] | undefined;
}
export const GroupTable = ({ dataClients }: PropsGroupTable) => {
  const t = useTranslations("shared.groupTable.columns");
  const columns: TableProps<IClient>["columns"] = [
    {
      title: t("name"),
      dataIndex: "client_name",
      key: "client_name",
      render: (text) => <p>{text}</p>,
      sorter: (a, b) => b.client_name.localeCompare(a.client_name),
      showSorterTooltip: false
    },
    {
      title: t("taxId"),
      dataIndex: "id",
      key: "id",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => b.id.localeCompare(a.id),
      showSorterTooltip: false
    },
    {
      title: t("receivables"),
      key: "total_portfolio",
      dataIndex: "total_portfolio",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => a.total_portfolio - b.total_portfolio,
      showSorterTooltip: false
    },
    {
      title: t("shipTo"),
      key: "shipto_count",
      dataIndex: "shipto_count",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => b.shipto_count - a.shipto_count,
      showSorterTooltip: false
    },
    {
      title: t("groups"),
      key: "groups_count",
      dataIndex: "groups_count",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => b.groups_count - a.groups_count,
      showSorterTooltip: false
    },
    {
      title: t("holding"),
      key: "holding_name",
      dataIndex: "holding_name",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => b.holding_name?.localeCompare(a.holding_name),
      showSorterTooltip: false
    },
    {
      title: t("status"),
      key: "status_name",
      dataIndex: "status_name",
      width: "150px",
      render: (status) => <Text>{status}</Text>,
      sorter: (a, b) => b.status_name.localeCompare(a.status_name),
      showSorterTooltip: false
    }
  ];

  return (
    <div className="detailsClientsGroupTable">
      <Table
        columns={columns}
        dataSource={dataClients?.map((client) => ({
          key: client.id,
          ...client
        }))}
        pagination={false}
      />
    </div>
  );
};
