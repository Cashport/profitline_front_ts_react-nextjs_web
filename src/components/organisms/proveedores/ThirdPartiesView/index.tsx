"use client";
import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Tabs, Table, Space, Flex } from "antd";
import type { ColumnsType } from "antd/es/table";
import { Circle, DotsThreeVertical, Eye } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";
import { TabsEnum } from "@/lib/slices/providersViewSlice";
import { fetcher } from "@/utils/api/api";

import Container from "@/components/atoms/Container/Container";
import UiSearchInput from "@/components/ui/search-input";
import { FilterClients } from "@/components/atoms/Filters/FilterClients/FilterClients";
import { Tag } from "@/components/atoms/Tag/Tag";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import IconButton from "@/components/atoms/IconButton/IconButton";
import { ModalGenerateAction } from "../components/ModalGenerateAction";

import { IThirdPartiesData } from "../interfaces/ThirdPartiesData";
import { GenericResponsePage } from "@/types/global/IGlobal";

const formatDate = (isoString: string): string => {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Los meses comienzan desde 0
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const ThirdPartiesView: React.FC = () => {
  // const { activeTab, setActiveTab } = useProviderViewContext();
  const { activeTab, setActiveTab } = useAppStore();
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const router = useRouter();

  // Debounce search input
  const debounceSearch = useCallback((value: string) => {
    const timer = setTimeout(() => {
      setDebouncedSearch(value);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceSearch(e.target.value);
  };

  const closeModal = () => {
    setModalOpen(false);
  };
  const openModal = () => {
    setModalOpen(true);
  };

  const { data, error, isLoading } = useSWR<GenericResponsePage<IThirdPartiesData[]>>(
    `/subject/${activeTab}?page=${currentPage}&limit=${pageSize}${debouncedSearch ? `&search=${debouncedSearch}` : ""}`,
    fetcher
  );

  const handleTabChange = (key: TabsEnum) => {
    setActiveTab(key);
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  const handlePaginationChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: ColumnsType<IThirdPartiesData> = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
      width: "30%"
    },
    {
      title: "Tipo",
      dataIndex: "subtypeName",
      key: "subtypeName",
      width: "20%"
    },
    {
      title: "Fecha creación",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (createdAt) => formatDate(createdAt),
      width: "20%"
    },
    {
      title: "Estado",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        return (
          <Flex>
            <Tag
              icon={<Circle color={status.color} weight="fill" size={6} />}
              style={{
                border: "none",
                whiteSpace: "nowrap",
                backgroundColor: status.backgroundColor || " #F7F7F7",
                color: status.color,
                fontSize: 14,
                fontWeight: 400,
                padding: "4px 12px",
                paddingTop: "5px"
              }}
              content={status.name}
            />
          </Flex>
        );
      },
      width: "20%"
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_, record) => (
        <Space>
          <IconButton
            style={{ backgroundColor: "#F7F7F7" }}
            icon={<DotsThreeVertical size={20} />}
          />
          <IconButton
            style={{ backgroundColor: "#F7F7F7" }}
            icon={<Eye size={20} />}
            onClick={() => router.push(`/proveedores/${record.id}`)}
          />
        </Space>
      )
    }
  ];

  return (
    <Container style={{ gap: "1.5rem", overflowY: "auto" }}>
      <Tabs
        defaultActiveKey={activeTab}
        onChange={(key: string) => handleTabChange(key as TabsEnum)}
        size="large"
        style={{
          fontSize: 16,
          fontWeight: 700
        }}
      >
        <Tabs.TabPane tab="Clientes" key={TabsEnum.Clients} />
        <Tabs.TabPane tab="Proveedores" key={TabsEnum.Providers} />
      </Tabs>
      <Flex gap={8}>
        <UiSearchInput
          placeholder={`Buscar ${activeTab === TabsEnum.Clients ? "clientes" : "proveedores"}`}
          onChange={handleSearch}
        />
        <FilterClients setFilterClients={() => {}} />
        <GenerateActionButton onClick={openModal} />
      </Flex>
      <Table
        columns={columns}
        dataSource={data?.data}
        loading={isLoading}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data?.pagination?.totalRows || 0,
          onChange: handlePaginationChange,
          showSizeChanger: false
        }}
      />
      <ModalGenerateAction isOpen={isModalOpen} onClose={closeModal} />
    </Container>
  );
};

export default ThirdPartiesView;
