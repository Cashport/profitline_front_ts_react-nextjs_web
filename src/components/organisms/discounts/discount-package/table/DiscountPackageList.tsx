"use client";
import { Table } from "antd";
import TablePaginator from "@/components/atoms/tablePaginator/TablePaginator";
import { discountPackagesColumns } from "../../constants/column";
import { DiscountPackageState } from "../../hooks/useDiscount";
import { GenericResponsePage } from "@/types/global/IGlobal";
import { DiscountPackage } from "@/types/discount/DiscountPackage";

export interface IDiscountPackageTable {
  data: DiscountPackageState[] | undefined;
  res: GenericResponsePage<DiscountPackage[]> | undefined;
  page: number;
  handleSelectToDelete: (id: number, addToDelete: boolean) => void;
  handleChangeStatus: (id: number, status: boolean) => void;
  handleChangePage: (page: number) => void;
  loading: boolean;
}

export default function DiscountPackages({
  data,
  res,
  page,
  handleSelectToDelete,
  handleChangeStatus,
  handleChangePage,
  loading
}: Readonly<IDiscountPackageTable>) {
  return (
    <Table
      scroll={{ y: "61dvh", x: undefined }}
      columns={discountPackagesColumns({
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
