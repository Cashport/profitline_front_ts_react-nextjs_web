import { Dispatch, SetStateAction, useState } from "react";
import { Button, Flex, Table, TableProps, Typography } from "antd";
import { Eye, Triangle } from "phosphor-react";
import { IContact } from "@/types/contacts/IContacts";
import useScreenHeight from "@/components/hooks/useScreenHeight";

import "./contacts-tab-table.scss";
const { Text } = Typography;

interface PropsContactsTable {
  dataAllContacts: IContact[];
  setSelectedRows: Dispatch<SetStateAction<IContact[] | undefined>>;
  setShowContactModal: Dispatch<
    SetStateAction<{
      isOpen: boolean;
      contactId: number;
    }>
  >;
}

const ContactsTable = ({
  dataAllContacts: data,
  setSelectedRows,
  setShowContactModal
}: PropsContactsTable) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [page, setPage] = useState(1);
  const height = useScreenHeight();

  const openContactDetail = (contactId: number) => {
    setShowContactModal({ isOpen: true, contactId });
  };

  const onSelectChange = (newSelectedRowKeys: React.Key[], newSelectedRow: any) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRow);
  };

  const rowSelection = {
    columnWidth: 40,
    selectedRowKeys,
    onChange: onSelectChange
  };

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  const columns: TableProps<IContact>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "contact_name",
      key: "contact_name",
      render: (contact_name) => <Text className="cell">{contact_name}</Text>,
      sorter: (a, b) => a.contact_name.localeCompare(b.contact_name),
      showSorterTooltip: false
    },
    {
      title: "Apellido",
      dataIndex: "contact_lastname",
      key: "contact_lastname",
      render: (text) => <Text className="cell">{text}</Text>,
      sorter: (a, b) => a.contact_lastname.localeCompare(b.contact_lastname),
      showSorterTooltip: false
    },
    {
      title: "Cargo",
      key: "name_position",
      dataIndex: "name_position",
      render: (text) => <Text className="cell">{text}</Text>,
      sorter: (a, b) => a.name_position.localeCompare(b.name_position),
      showSorterTooltip: false,
      width: 140
    },
    {
      title: "Rol",
      key: "contact_position",
      dataIndex: "contact_position",
      render: (text) => <Text className="cell">{text}</Text>,
      sorter: (a, b) => a.contact_position.localeCompare(b.contact_position),
      showSorterTooltip: false,
      width: 140
    },
    {
      title: "Teléfono",
      key: "contact_phone",
      dataIndex: "contact_phone",
      render: (phone, row) => (
        <Text className="cell">{`(${row.country_calling_code}) ${phone}`}</Text>
      ),
      sorter: (a, b) => parseInt(b.contact_phone) - parseInt(a.contact_phone),
      showSorterTooltip: false
    },
    {
      title: "Email",
      key: "contact_email",
      dataIndex: "contact_email",
      render: (amount) => <Text className="cell">{amount}</Text>,
      sorter: (a, b) => a.contact_email.localeCompare(b.contact_email),
      showSorterTooltip: false
    },
    {
      title: "",
      render: (_, record) => (
        <Button
          className="eyeButton"
          onClick={() => openContactDetail(record.id)}
          icon={<Eye size={"1.2rem"} />}
        />
      ),
      width: 60
    }
  ];

  return (
    <>
      <Table
        className="contactsTable"
        columns={columns}
        dataSource={data?.map((data) => ({ ...data, key: data.id }))}
        rowSelection={rowSelection}
        rowClassName={(record) => (selectedRowKeys.includes(record.id) ? "selectedRow" : "")}
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

export default ContactsTable;
