import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import { Button, Dropdown, Flex, Table, TableProps, Typography } from "antd";
import { Eye, Triangle } from "phosphor-react";

import { formatDate } from "@/utils/utils";

import useScreenHeight from "@/components/hooks/useScreenHeight";

import { IHistoryRow } from "@/types/clientHistory/IClientHistory";

import "./history-tab-table.scss";
import { DotsThreeVertical, FileText, FileXls } from "@phosphor-icons/react";

const { Text } = Typography;

interface PropsHistoryTable {
  dataAllRecords?: IHistoryRow[];
  setSelectedRows: Dispatch<SetStateAction<IHistoryRow[] | undefined>>;
  // eslint-disable-next-line no-unused-vars
  handleOpenDetail: (row: IHistoryRow, url: string | null) => void;
}

const HistoryTable = ({
  dataAllRecords: data,
  setSelectedRows,
  handleOpenDetail
}: PropsHistoryTable) => {
  const [page, setPage] = useState(1);
  const height = useScreenHeight();

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  const onSelectChange = (_newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    columnWidth: 40,
    onChange: onSelectChange
  };

  const columns: TableProps<IHistoryRow>["columns"] = [
    {
      title: "Fecha",
      dataIndex: "created_at",
      key: "created_at",
      render: (created_at) => <Text className="cell">{formatDate(created_at)}</Text>,
      sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      showSorterTooltip: false,
      width: 120
    },
    {
      title: "Evento",
      dataIndex: "event",
      key: "event",
      render: (text) => <Text className="cell">{text}</Text>,
      sorter: (a, b) => a.event.localeCompare(b.event),
      showSorterTooltip: false
    },
    {
      title: "Descripción",
      key: "description",
      dataIndex: "description",
      render: (description) => <span className="cell">{description}</span>,
      sorter: (a, b) => a.description.localeCompare(b.description),
      showSorterTooltip: false
    },
    {
      title: "Usuario",
      key: "user_name",
      dataIndex: "user_name",
      render: (text) => <Text className="cell">{text}</Text>,
      sorter: (a, b) => a.user_name.localeCompare(b.user_name),
      showSorterTooltip: false
    },
    {
      width: 76,
      render: (_, row) => {
        const items = [
          {
            key: "1",
            label: (
              <Button
                icon={<FileXls size={20} />}
                className="buttonNoBorder"
                onClick={() => {
                  handleOpenDetail(row, row.payment_identification_excel_url);
                }}
              >
                Descargar plano
              </Button>
            )
          },
          {
            key: "2",
            label: (
              <Button
                icon={<FileText size={20} />}
                className="buttonNoBorder"
                onClick={() => {
                  handleOpenDetail(row, row.payment_identification_url);
                }}
              >
                Ver pdf
              </Button>
            )
          }
        ];

        const customDropdown = (menu: ReactNode) => (
          <div className="dropdownApplicationTable">{menu}</div>
        );

        return (
          <Dropdown
            dropdownRender={customDropdown}
            menu={{ items }}
            placement="bottomLeft"
            trigger={["click"]}
          >
            <Button className="dotsBtn">
              <DotsThreeVertical size={16} />
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  return (
    <>
      <Table
        className="historyTable"
        columns={columns}
        dataSource={data?.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        virtual
        scroll={{ y: height - 420, x: 100 }}
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
    </>
  );
};

export default HistoryTable;
