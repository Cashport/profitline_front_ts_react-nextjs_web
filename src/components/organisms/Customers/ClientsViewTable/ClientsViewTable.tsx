"use client";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import Link from "next/link";
import { Spin, TableProps, Button, Col, Flex, Row, Table, Typography } from "antd";
import {
  CalendarBlank,
  CalendarX,
  DotsThree,
  Eye,
  Money,
  Calendar,
  Receipt,
  XCircle,
  MagnifyingGlassMinus
} from "phosphor-react";
import CardsClients from "../../../molecules/modals/CardsClients/CardsClients";

import { IClientsPortfolio } from "@/types/clients/IViewClientsTable";

import { useDebounce } from "@/hooks/useDeabouce";
import {
  FilterPortfolio,
  SelectedFilters
} from "@/components/atoms/Filters/FilterPortfolio/FilterPortfolio";
import OptimizedSearchComponent from "@/components/atoms/inputs/OptimizedSearchComponent/OptimizedSearchComponent";
import { fetcher } from "@/utils/api/api";
import { useInfiniteQuery } from "react-query";
import { useAppStore } from "@/lib/store/store";

import "./ClientsViewTable.scss";

const { Text } = Typography;

export const ClientsViewTable = () => {
  const formatMoney = useAppStore((state) => state.formatMoney);
  const PAGINATION_LIMIT = 25;
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [filters, setFilters] = useState<SelectedFilters>({
    holding: [],
    clientGroup: [],
    zones: [],
    lines: [],
    sublines: [],
    channels: [],
    radicado: false,
    novedad: false
  });
  const [flattenedData, setFlattenedData] = useState<IClientsPortfolio[]>([]);
  const [grandTotal, setGrandTotal] = useState<any>({});
  const [noResults, setNoResults] = useState<boolean>(false);
  const { ID } = useAppStore((state) => state.selectedProject);

  const [loadingOpenPortfolio, setLoadingOpenPortfolio] = useState({
    isLoading: false,
    loadingId: ""
  });

  const fetchPortfolios = async ({ pageParam = 1 }) => {
    const queryParams = [
      `page=${pageParam}`,
      `limit=${PAGINATION_LIMIT}`,
      filters.holding.length > 0 && `holding=${filters.holding.join(",")}`,
      debouncedSearchQuery &&
        `searchQuery=${encodeURIComponent(debouncedSearchQuery.toLowerCase().trim())}`,
      filters.clientGroup.length > 0 && `client_group=${filters.clientGroup.join(",")}`,
      filters.zones.length > 0 && `zones=${filters.zones.join(",")}`,
      filters.lines.length > 0 && `lines=${filters.lines.join(",")}`,
      filters.sublines.length > 0 && `sublines=${filters.sublines.join(",")}`,
      filters.channels.length > 0 && `channels=${filters.channels.join(",")}`,
      filters.radicado && `radicado=${filters.radicado}`,
      filters.novedad && `novedad=${filters.novedad}`
    ]
      .filter(Boolean)
      .join("&");

    const pathKey = `/portfolio/client/project/${ID}?${queryParams}`;

    return fetcher(pathKey);
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status } = useInfiniteQuery(
    ["portfolios", debouncedSearchQuery, filters, ID],
    fetchPortfolios,
    {
      getNextPageParam: (lastPage, pages) => {
        if (
          lastPage.message === "no rows" ||
          lastPage?.data?.clientsPortfolio?.length < PAGINATION_LIMIT
        )
          return undefined;
        return pages.length + 1;
      }
    }
  );

  const { ref, inView } = useInView({
    threshold: 0
  });

  useEffect(() => {
    if (inView && hasNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, fetchNextPage]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const columns: TableProps<IClientsPortfolio>["columns"] = [
    {
      title: "Nombre",
      dataIndex: "client_name",
      key: "client_name",
      render: (_, row: IClientsPortfolio) => (
        <Link href={`/clientes/detail/${row.client_uuid}/project/${row.project_id}`}>
          <Text className="text">{row.client_name}</Text>
        </Link>
      ),
      width: "20%",
      sorter: (a, b) => a.client_name.localeCompare(b.client_name),
      showSorterTooltip: false
    },
    {
      align: "right",
      title: "Cartera",
      dataIndex: "total_portfolio",
      key: "total_portfolio",
      render: (text) => (
        <p className="fontMonoSpace">{formatMoney(text, { hideDecimals: true })}</p>
      ),
      width: "10%",
      sorter: (a, b) => a.total_portfolio - b.total_portfolio,
      showSorterTooltip: false
    },
    {
      align: "right",
      title: "Vencida",
      dataIndex: "past_due_ammount",
      key: "past_due_ammount",
      render: (text) => (
        <p className="fontMonoSpace">{formatMoney(text, { hideDecimals: true })}</p>
      ),
      width: "10%",
      sorter: (a, b) => a.past_due_ammount - b.past_due_ammount
    },
    {
      align: "right",
      title: "Presupuesto",
      key: "budget_ammount",
      dataIndex: "budget_ammount",
      render: (text) => (
        <p className="fontMonoSpace">{formatMoney(text, { hideDecimals: true })}</p>
      ),
      width: "10%",
      sorter: (a, b) => a.budget_ammount - b.budget_ammount,
      showSorterTooltip: false
    },
    {
      align: "right",
      title: "R. Aplicado",
      key: "applied_payments_ammount",
      dataIndex: "applied_payments_ammount",
      render: (text) => (
        <p className="fontMonoSpace">{formatMoney(text, { hideDecimals: true })}</p>
      ),
      sorter: (a, b) => a.applied_payments_ammount - b.applied_payments_ammount,
      showSorterTooltip: false
    },
    {
      align: "center",
      width: 103,
      title: "Ejecutado",
      key: "executed_percentage",
      dataIndex: "executed_percentage",
      render: (text) => <p className="fontMonoSpace">{text} %</p>
    },
    {
      align: "right",
      title: "PNA",
      key: "unapplied_payments_ammount",
      dataIndex: "unapplied_payments_ammount",
      render: (text) => (
        <p className="fontMonoSpace">{formatMoney(text, { hideDecimals: true })}</p>
      ),
      sorter: (a, b) => a.unapplied_payments_ammount - b.unapplied_payments_ammount,
      showSorterTooltip: false
    },
    {
      align: "right",
      title: "Saldos",
      key: "total_balances",
      dataIndex: "total_balances",
      render: (text) => (
        <p className="fontMonoSpace">{formatMoney(text, { hideDecimals: true })}</p>
      ),
      sorter: (a, b) => a.total_balances - b.total_balances,
      showSorterTooltip: false
    },
    {
      title: "Holding",
      key: "holding_name",
      dataIndex: "holding_name",
      render: (text) => <Text className="text">{text}</Text>,
      sorter: (a, b) => a.holding_name?.localeCompare(b.holding_name),
      showSorterTooltip: false
    },
    {
      title: "",
      key: "buttonSee",
      width: 64,
      dataIndex: "",
      render: (_, row: IClientsPortfolio) => (
        <Link href={`/clientes/detail/${row.client_id}/project/${row.project_id}`}>
          <Button
            key={row.client_id}
            onClick={() => {
              setLoadingOpenPortfolio({ isLoading: true, loadingId: row.client_id });
            }}
            className="buttonSeeProject"
            icon={
              loadingOpenPortfolio.loadingId === row.client_id && loadingOpenPortfolio.isLoading ? (
                <Spin />
              ) : (
                <Eye size={"1.3rem"} />
              )
            }
          />
        </Link>
      )
    }
  ];

  useEffect(() => {
    setFlattenedData(
      data?.pages
        .flatMap((page) => page?.data?.clientsPortfolio || [])
        .filter(
          (client, index, self) => self.findIndex((other) => other.id === client.id) === index
        ) || []
    );
    setGrandTotal(data?.pages[0]?.data?.grandTotal || {});
    setNoResults(data?.pages[0]?.message === "no rows");
  }, [data]);

  return (
    <main className="mainClientsTable">
      <div style={{ marginBottom: "10px" }}>
        <Flex justify="space-between" className="mainClientsTable_header">
          <Flex gap={"10px"}>
            <OptimizedSearchComponent onSearch={handleSearch} />
            <FilterPortfolio setSelectedFilters={setFilters} />
            <Button size="large" icon={<DotsThree size={"1.5rem"} />} />
          </Flex>
        </Flex>
        <Row gutter={8}>
          <Col span={21} className="cards">
            <Row gutter={8}>
              <Col span={4}>
                <CardsClients
                  title={"Total cartera"}
                  total={grandTotal?.total_wallet || 0}
                  icon={<Money />}
                  loading={status === "loading"}
                />
              </Col>
              <Col span={4}>
                <CardsClients
                  title={"C. vencida"}
                  total={grandTotal?.total_past_due || 0}
                  icon={<CalendarX />}
                  loading={status === "loading"}
                />
              </Col>
              <Col span={4}>
                <CardsClients
                  title={"Presupuesto"}
                  total={grandTotal?.total_budget || 0}
                  icon={<CalendarBlank />}
                  loading={status === "loading"}
                />
              </Col>
              <Col span={4}>
                <CardsClients
                  title={"R. aplicado"}
                  total={grandTotal?.applied_payments_ammount || 0}
                  icon={<Receipt />}
                  loading={status === "loading"}
                />
              </Col>
              <Col span={4}>
                <CardsClients
                  title={"Pagos no ap."}
                  total={grandTotal?.unapplied_payments_ammount || 0}
                  icon={<XCircle />}
                  loading={status === "loading"}
                />
              </Col>
              <Col span={4}>
                <CardsClients
                  title={"Pagos no id."}
                  total={grandTotal?.unidentified_payment_ammount || 0}
                  icon={<MagnifyingGlassMinus />}
                  loading={status === "loading"}
                />
              </Col>
            </Row>
          </Col>
          <Col span={3}>
            <CardsClients
              title={"DSO"}
              total={grandTotal?.dso || 0}
              icon={<Calendar />}
              notAMoneyValue
              loading={status === "loading"}
            />
          </Col>
        </Row>
      </div>
      <Table
        loading={status === "loading"}
        scroll={{ x: 1350 }}
        columns={columns as TableProps<any>["columns"]}
        dataSource={flattenedData.map((data) => ({ ...data, key: data?.client_id }))}
        pagination={false}
        sticky={
          {
            offsetHeader: -20,
            offsetScroll: 0
          } as any
        }
        locale={{
          emptyText: noResults ? "No se encontraron resultados" : "No hay datos disponibles"
        }}
      />
      {(hasNextPage || isFetchingNextPage) && !noResults && (
        <div ref={ref} style={{ textAlign: "center", padding: "20px" }}>
          {isFetchingNextPage ? <Spin /> : "Load More"}
        </div>
      )}
      {!hasNextPage && status !== "loading" && flattenedData.length <= 0 && !noResults && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <Text>No hay más datos para cargar</Text>
        </div>
      )}
    </main>
  );
};
