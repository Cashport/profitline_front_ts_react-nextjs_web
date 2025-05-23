"use client";
import { useState } from "react";
import { Flex, Spin } from "antd";
import { useParams } from "next/navigation";
import UiSearchInput from "@/components/ui/search-input";
import UiFilterDropdown from "@/components/ui/ui-filter-dropdown";
import Container from "@/components/atoms/Container/Container";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import TaskTable from "../TaskManagerTable";
import data from "../TaskManagerTable/data-mocked";
import SendEmailModal from "@/components/molecules/modals/SendEmailModal";
import MakeCallModal from "@/components/molecules/modals/MakeCallModal";

const TaskManagerView = () => {
  const params = useParams();

  const [search, setSearch] = useState("");
  const isLoading = false;
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [modalSendEmailVisible, setModalSendEmailVisible] = useState(false);
  const [modalMakeCallVisible, setModalMakeCallVisible] = useState(false);

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys);
    }
  };
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleMenuClick = ({ key }: { key: string }) => {
    setSelectedAction(key);
    setModalVisible(true);
  };
  const openSendEmailModal = () => {
    setModalSendEmailVisible(true);
  };
  const openMakeCalllModal = () => {
    setModalMakeCallVisible(true);
  };
  return (
    <>
      {isLoading ? (
        <Flex justify="center" align="center" style={{ height: "3rem" }}>
          <Spin />
        </Flex>
      ) : (
        <Container style={{ overflowY: "auto" }}>
          <Flex gap={"2rem"} vertical>
            <Flex gap={"0.5rem"}>
              <UiSearchInput
                className="search"
                placeholder="Buscar tarea"
                onChange={(event) => {
                  setTimeout(() => {
                    setSearch(event.target.value);
                  }, 1000);
                }}
              />
              <UiFilterDropdown />
              <GenerateActionButton onClick={() => {}} disabled={selectedRowKeys.length === 0} />
            </Flex>
            <TaskTable data={data} modalAction={[openSendEmailModal, openMakeCalllModal]} />
          </Flex>
          <SendEmailModal
            visible={modalSendEmailVisible}
            onClose={() => setModalSendEmailVisible(false)}
            onSend={() => {}}
          />
          <MakeCallModal
            visible={modalMakeCallVisible}
            onClose={() => setModalMakeCallVisible(false)}
            onSend={() => {}}
          />
        </Container>
      )}
    </>
  );
};

export default TaskManagerView;
