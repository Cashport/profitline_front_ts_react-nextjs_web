"use client";

import { Table } from "antd";
import { discountsColumns } from "../../constants/column";
import TablePaginator from "@/components/atoms/tablePaginator/TablePaginator";
import { DiscountBasicsState } from "../../hooks/useDiscount";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { DiscountBasics } from "@/types/discount/DiscountBasics";

export interface IDiscountTable {
  data: DiscountBasicsState[] | undefined;
  res: GenericResponsePage<DiscountBasics[]> | undefined;
  page: number;
  handleSelectToDelete: (id: number, addToDelete: boolean) => void;
  handleChangeStatus: (id: number, mewStatus: boolean) => void;
  handleChangePage: (page: number) => void;
  loading: boolean;
}

export default function DiscountRulesTable({
  data,
  res,
  page,
  handleSelectToDelete,
  handleChangeStatus,
  handleChangePage,
  loading
}: Readonly<IDiscountTable>) {
  return (
    <Table
      scroll={{ y: "61dvh", x: undefined }}
      columns={discountsColumns({
        handleSelect: handleSelectToDelete,
        handleChangeStatus
      })}
      dataSource={data}
      loading={loading}
      pagination={{
        pageSize: 25,
        showSizeChanger: false,
        total: res?.pagination.totalPages || 0,
        onChange: handleChangePage,
        itemRender: TablePaginator,
        current: page
      }}
      rowKey={"id"}
    />
  );
}
