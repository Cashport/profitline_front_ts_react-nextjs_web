import { useTranslations } from "use-intl";
import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Button,
  Dropdown,
  Flex,
  Table,
  TableProps,
  Typography,
  Spin,
  MenuProps,
  message
} from "antd";
import { DotsThreeVertical, Eye, Plus, Triangle } from "phosphor-react";

import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import UiSearchInput from "@/components/ui/search-input";
import UiFilterDropdown from "@/components/ui/ui-filter-dropdown";

import "./communicationsTable.scss";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import {
  getAllCommunications,
  sendIndividualCommunication
} from "@/services/communications/communications";
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
  const t = useTranslations("shared.tables.communications");
  const tCommon = useTranslations("common");
  const pathname = usePathname();
  const [communications, setCommunications] = useState<ICommunication[]>([]);
  const [page, setPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [selectedRows, setSelectedRows] = useState<any>([]);
  const [sendingId, setSendingId] = useState<number | null>(null);
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

  const handleSendNow = async (communicationId: number) => {
    setSendingId(communicationId);
    try {
      await sendIndividualCommunication(projectId, communicationId);
      message.success(t("sentSuccess"));
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("sendError"));
    } finally {
      setSendingId(null);
    }
  };

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
      title: tCommon("fields.name"),
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
      title: tCommon("fields.reason"),
      dataIndex: "description",
      key: "description",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => b.description.localeCompare(a.description),
      showSorterTooltip: false
    },
    {
      title: t("columns.via"),
      key: "via",
      dataIndex: "via",
      render: (text) => <Text>{text}</Text>,
      sorter: (a, b) => b.via.localeCompare(a.via),
      showSorterTooltip: false
    },
    {
      title: t("columns.frequency"),
      key: "JSON_frecuency",
      dataIndex: "JSON_frecuency",
      render: (_, row) => {
        const frequency = row?.JSON_frecuency?.repeat?.frequency;
        const interval = row?.JSON_frecuency?.repeat?.interval;
        const day = row?.JSON_frecuency?.repeat?.day;
        if (frequency?.toLowerCase() === "semanal") {
          return <Text>{t("weeklyFrequency", { day, interval: Number(interval) || 1 })}</Text>;
        } else if (frequency?.toLowerCase() === "mensual") {
          return <Text>{t("monthlyFrequency", { day, interval: Number(interval) || 1 })}</Text>;
        }
      },
      showSorterTooltip: false
    },
    {
      title: t("columns.customerCount"),
      key: "clients",
      dataIndex: "clients",
      render: (text) => <Text>{text}</Text>,
      showSorterTooltip: false
    },
    {
      title: "",
      key: "seeProject",
      width: 90,
      dataIndex: "",
      render: (_, row) => {
        const rowItems: MenuProps["items"] = [
          {
            key: "send-now",
            label: (
              <Button
                className="buttonNoBorder"
                loading={sendingId === row.id}
                disabled={sendingId === row.id}
                onClick={() => handleSendNow(row.id)}
              >
                {t("sendNow")}
              </Button>
            )
          }
        ];

        const customDropdown = (menu: ReactNode) => (
          <div className="dropdownCommunicationsTable">{menu}</div>
        );

        return (
          <Flex gap={8} align="center">
            <Dropdown
              dropdownRender={customDropdown}
              menu={{ items: rowItems }}
              placement="bottomRight"
              trigger={["click"]}
            >
              <Button className="dotsBtn">
                <DotsThreeVertical size={"1.3rem"} />
              </Button>
            </Dropdown>
            <Button
              className="buttonEye"
              onClick={() => handleSeeCommunicationDetails(row.id)}
              icon={<Eye size={"1.3rem"} />}
            />
          </Flex>
        );
      }
    }
  ];

  const items: MenuProps["items"] = [
    {
      key: "discount-option-1",
      label: (
        <Button className="buttonOutlined" onClick={handleDeleteCommunications}>
          {tCommon("actions.delete")}
        </Button>
      )
    }
  ];

  return (
    <main className="mainCommunicationsTable">
      <Flex justify="space-between" align="center">
        <Flex gap={"0.625rem"} align="center">
          <UiSearchInput className="search" placeholder={tCommon("placeholders.search")} />
          <UiFilterDropdown />
          <DotsDropdown items={items} />
        </Flex>
        {/* PrincipalButton toma el 100% del alto: el contenedor lo deja en --control-h. */}
        <div style={{ height: "var(--control-h)" }}>
          <PrincipalButton onClick={onCreateCommunication} customStyles={{ fontSize: 14 }}>
            {t("create")}
            <Plus weight="bold" size={18} />
          </PrincipalButton>
        </div>
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
