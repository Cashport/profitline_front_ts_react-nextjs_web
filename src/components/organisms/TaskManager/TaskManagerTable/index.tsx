import React, { ReactNode } from "react";
import { Table, Flex, Dropdown, MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Tag } from "@/components/atoms/Tag/Tag";
import {
  MailOutlined,
  PhoneOutlined,
  WhatsAppOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  FileTextOutlined,
  FileDoneOutlined
} from "@ant-design/icons";
import { Circle, DotsThree, Users } from "phosphor-react";
import IconButton from "@/components/atoms/IconButton/IconButton";
import { useAppStore } from "@/lib/store/store";
import { ITask } from "@/types/tasks/ITasks";

import "./taskManagerTable.scss";

const TaskTable: React.FC<{ data: ITask[]; modalAction: (() => void)[] }> = ({
  data,
  modalAction
}) => {
  const formatMoney = useAppStore((state) => state.formatMoney);

  const menuItems: MenuProps["items"] = [
    {
      key: "Enviar correo",
      icon: <MailOutlined size={12} />,
      label: "Enviar correo",
      onClick: modalAction[0]
    },
    {
      key: "Llamar",
      icon: <PhoneOutlined size={12} />,
      label: "Llamar",
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
      label: "Agendar visita"
    },
    {
      key: "Conciliar",
      icon: <CalendarOutlined size={12} />,
      label: "Conciliar"
    },
    {
      key: "Aplicar pago",
      icon: <CreditCardOutlined size={12} />,
      label: "Aplicar pago"
    },
    {
      key: "Radicar",
      icon: <FileTextOutlined size={12} />,
      label: "Radicar"
    },
    {
      key: "Reportar pago",
      icon: <FileDoneOutlined size={12} />,
      label: "Reportar pago"
    }
  ];

  const customDropdown = (menu: ReactNode) => (
    <div className="dropdownTaskManagerTable">{menu}</div>
  );

  const columns: ColumnsType<ITask> = [
    { title: "Cliente", dataIndex: "client_name", key: "client_name", fixed: "left", width: 180 },
    { title: "Tipo de tarea", dataIndex: "task_type", key: "task_type", width: 150 },
    {
      title: "Descripción",
      dataIndex: "description",
      key: "description",
      width: 300,
      ellipsis: true
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: ITask["status"]) => (
        <Flex>
          <Tag
            icon={<Circle color={status.color} weight="fill" size={6} />}
            content={status.name}
            style={{ backgroundColor: status.backgroundColor }}
            color={status.color}
            withBorder={false}
          />
        </Flex>
      )
    },
    { title: "Responsable", dataIndex: "user_name", key: "user_name", width: 120 },
    {
      title: "Cartera",
      dataIndex: "total_portfolio",
      key: "total_portfolio",
      render: (value) => `${formatMoney(value)}`
    },
    { title: "Impacto", dataIndex: "amount", key: "amount", width: 150 },
    {
      title: "Acción",
      key: "action",
      fixed: "right",
      width: 100,
      render: () => (
        <Dropdown dropdownRender={customDropdown} menu={{ items: menuItems }} trigger={["click"]}>
          <IconButton icon={<DotsThree size={20} />} />
        </Dropdown>
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={data}
      pagination={false}
      scroll={{ x: "max-content", y: "calc(100vh - 300px)" }}
      bordered
    />
  );
};

export default TaskTable;
