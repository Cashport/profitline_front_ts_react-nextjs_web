"use client";
import { useState } from "react";
import { Flex, Spin } from "antd";

import { useTasks } from "@/hooks/useTasks";
import { useDebounce } from "@/hooks/useSearch";

import UiSearchInput from "@/components/ui/search-input";
import Container from "@/components/atoms/Container/Container";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import TaskTable from "../TaskManagerTable";
import SendEmailModal from "@/components/molecules/modals/SendEmailModal";
import MakeCallModal from "@/components/molecules/modals/MakeCallModal";
import FiltersTasks, {
  ISelectFilterTasks
} from "@/components/atoms/Filters/FiltersTasks/FiltersTasks";

import { ITask } from "@/types/tasks/ITasks";

const TaskManagerView = () => {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 1000);
  const isLoading = false;
  const [selectedRows, setSelectedRows] = useState<ITask[] | undefined>(undefined);
  const [modalSendEmailVisible, setModalSendEmailVisible] = useState(false);
  const [modalMakeCallVisible, setModalMakeCallVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<ISelectFilterTasks>({
    statuses: [],
    taskTypes: []
  });

  const { data } = useTasks(selectedFilters, debouncedSearch);


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
                onChange={(event) => setSearch(event.target.value)}
              />
              <FiltersTasks setSelectedFilters={setSelectedFilters} />
              <GenerateActionButton onClick={() => {}} disabled={!selectedRows || selectedRows.length === 0} />
            </Flex>
            <TaskTable data={data} modalAction={[openSendEmailModal, openMakeCalllModal]} setSelectedRows={setSelectedRows} />
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
