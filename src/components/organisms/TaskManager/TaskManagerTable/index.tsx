import React, { ReactNode, Dispatch, SetStateAction } from "react";
import { Table, Flex, Dropdown, MenuProps, Button } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslations } from "use-intl";
import { Tag } from "@/components/atoms/Tag/Tag";
import { Circle, DotsThree, Users } from "phosphor-react";
import { Invoice } from "@phosphor-icons/react";
import {
  MailOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  FileDoneOutlined,
  UnlockOutlined
} from "@ant-design/icons";

import { useAppStore } from "@/lib/store/store";

import { useModalDetail } from "@/context/ModalContext";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import { ITask } from "@/types/tasks/ITasks";

import "./taskManagerTable.scss";

const TaskTable: React.FC<{
  data: ITask[];
  modalAction: (() => void)[];
  setSelectedRows: Dispatch<SetStateAction<ITask[] | undefined>>;
}> = ({ data, modalAction, setSelectedRows }) => {
  const t = useTranslations("taskManager.legacyTable");
  const tCommon = useTranslations("common");
  const formatMoney = useAppStore((state) => state.formatMoney);
  const height = useScreenHeight();
  const { openModal } = useModalDetail();

  const handleOpenBalanceLegalization = () => {
    openModal("balanceLegalization", {
      // selectedAdjustments: selectedRows
    });
  };

  const onSelectChange = (_newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    columnWidth: 30,
    onChange: onSelectChange
  };

  const getMenuItems = (row: ITask): MenuProps["items"] => {
    const baseItems: MenuProps["items"] = [
      {
        key: "Enviar correo",
        icon: <MailOutlined size={12} />,
        label: t("actions.sendEmail"),
        onClick: modalAction[0]
      },
      {
        key: "Llamar",
        icon: <PhoneOutlined size={12} />,
        label: t("actions.call"),
        onClick: modalAction[1]
      },
      {
        key: "WhatsApp",
        icon: <WhatsAppOutlined size={12} />,
        label: "WhatsApp"
      },
      {
        key: "Agendar visita",
        icon: <Users size={12} />,
        label: t("actions.scheduleVisit")
      },
      {
        key: "Conciliar",
        icon: <CalendarOutlined size={12} />,
        label: t("actions.reconcile")
      },
      {
        key: "Aplicar pago",
        icon: <CreditCardOutlined size={12} />,
        label: t("actions.applyPayment")
      },
      {
        key: "Radicar",
        icon: <FileTextOutlined size={12} />,
        label: t("actions.submitInvoice")
      },
      {
        key: "Reportar pago",
        icon: <FileDoneOutlined size={12} />,
        label: t("actions.reportPayment")
      }
    ];

    // task_type viene del backend: se compara con el valor original.
    if (row.task_type === "Saldo") {
      return [
        ...baseItems,
        {
          key: "Legalizar saldo",
          icon: <Invoice size={12} />,
          label: t("actions.settleDeduction"),
          onClick: handleOpenBalanceLegalization
        }
      ];
    }

    if (row.task_type === "Desbloqueo") {
      baseItems.push({
        key: "Desbloquear pedido",
        icon: <UnlockOutlined size={12} />,
        label: t("actions.releaseOrder"),
        onClick: () => {
          // openModal("novelty", { noveltyId: row.incident_id });
        }
      });
    }

    return baseItems;
  };

  const customDropdown = (menu: ReactNode) => (
    <div className="dropdownTaskManagerTable">{menu}</div>
  );

  const columns: ColumnsType<ITask> = [
    {
      title: tCommon("fields.customer"),
      dataIndex: "client_name",
      key: "client_name",
      render: (_value, row) => {
        const url = `/clients/detail/${row.client_uuid}/project/${row.id_project}`;
        return (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1677ff", textDecoration: "underline", cursor: "pointer" }}
          >
            {row.client_name}
          </a>
        );
      }
    },
    {
      title: tCommon("fields.date"),
      dataIndex: "created_at",
      key: "created_at",
      render: (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString("es-CO", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric"
        });
      }
    },
    { title: t("taskType"), dataIndex: "task_type", key: "task_type", width: 130 },
    {
      title: tCommon("fields.description"),
      dataIndex: "description",
      key: "description"
    },
    {
      title: tCommon("fields.status"),
      dataIndex: "status",
      key: "status",
      render: (status: ITask["status"]) => (
        <Flex>
          <Tag
            icon={<Circle color={status.color} weight="fill" size={6} />}
            content={status.name}
            style={{ backgroundColor: status.backgroundColor, textWrap: "nowrap" }}
            color={status.color}
            withBorder={false}
          />
        </Flex>
      )
    },
    { title: t("assignee"), dataIndex: "user_name", key: "user_name" },
    {
      title: t("receivables"),
      dataIndex: "total_portfolio",
      key: "total_portfolio",
      align: "right",
      render: (value) => (
        <p className="fontMonoSpace" style={{ whiteSpace: "nowrap" }}>
          {formatMoney(value)}
        </p>
      ),
      sorter: (a, b) => a.total_portfolio - b.total_portfolio,
      showSorterTooltip: false
    },
    {
      title: t("order"),
      dataIndex: "order_amount",
      key: "order_amount",
      align: "right",
      render: (value) => (
        <p className="fontMonoSpace" style={{ whiteSpace: "nowrap" }}>
          {formatMoney(value)}
        </p>
      ),
      sorter: (a, b) => a.order_amount - b.order_amount,
      showSorterTooltip: false
    },
    {
      title: "",
      key: "action",
      fixed: "right",
      width: 70,
      render: (_, row) => {
        return (
          <Dropdown
            dropdownRender={customDropdown}
            menu={{ items: getMenuItems(row) }}
            trigger={["click"]}
          >
            <Button className="dotsBtn">
              <DotsThree size={20} />
            </Button>
          </Dropdown>
        );
      }
    }
  ];

  return (
    <Table
      className="taskManagerTable"
      columns={columns}
      dataSource={data?.map((task) => ({ ...task, key: task.id }))}
      rowSelection={rowSelection}
      pagination={false}
      scroll={{ y: height - 270, x: 100 }}
    />
  );
};

export default TaskTable;
