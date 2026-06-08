import React, { useMemo, useState } from "react";
import { Checkbox, Dropdown, Empty, Input, Spin } from "antd";
import dayjs from "dayjs";
import { CaretDown, MagnifyingGlass } from "@phosphor-icons/react";

import { useAppStore } from "@/lib/store/store";

import { IApplicationInvoice } from "@/types/invoices/IInvoices";

import "./selectInvoices.scss";

interface SelectInvoicesProps {
  invoices: IApplicationInvoice[];
  loading: boolean;
  value: number[];
  // eslint-disable-next-line no-unused-vars
  onChange: (ids: number[]) => void;
  error?: boolean;
}

const SOON_THRESHOLD = 2;

const getDaysDiff = (date: string) =>
  dayjs(date).startOf("day").diff(dayjs().startOf("day"), "day");

const SelectInvoices: React.FC<SelectInvoicesProps> = ({
  invoices,
  loading,
  value,
  onChange,
  error
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const formatMoney = useAppStore((state) => state.formatMoney);

  const sortedInvoices = useMemo(() => {
    return [...invoices].sort((a, b) => {
      const diffA = getDaysDiff(a.expiration_date);
      const diffB = getDaysDiff(b.expiration_date);
      const overdueA = diffA < 0;
      const overdueB = diffB < 0;

      // Overdue invoices first
      if (overdueA !== overdueB) return overdueA ? -1 : 1;
      // Within overdue: most overdue first (smallest diff)
      if (overdueA && diffA !== diffB) return diffA - diffB;
      // Then by amount descending
      return b.current_value - a.current_value;
    });
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return sortedInvoices;
    return sortedInvoices.filter(
      (invoice) =>
        invoice.id_erp?.toLowerCase().includes(query) || String(invoice.id).includes(query)
    );
  }, [sortedInvoices, search]);

  const allSelected =
    filteredInvoices.length > 0 && filteredInvoices.every((invoice) => value.includes(invoice.id));

  const toggleAll = () => {
    const filteredIds = filteredInvoices.map((invoice) => invoice.id);
    if (allSelected) {
      onChange(value.filter((id) => !filteredIds.includes(id)));
    } else {
      onChange(Array.from(new Set([...value, ...filteredIds])));
    }
  };

  const toggleOne = (id: number) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const renderBadge = (expirationDate: string) => {
    const diff = getDaysDiff(expirationDate);
    if (diff < 0) {
      return (
        <span className="selectInvoices__badge selectInvoices__badge--overdue">
          Vencida hace {Math.abs(diff)}d
        </span>
      );
    }
    if (diff < SOON_THRESHOLD) {
      return (
        <span className="selectInvoices__badge selectInvoices__badge--soon">Vence en {diff}d</span>
      );
    }
    return <span className="selectInvoices__badge">Vence en {diff}d</span>;
  };

  const panel = (
    <div className="selectInvoices__panel">
      {loading ? (
        <div className="selectInvoices__loading">
          <Spin />
        </div>
      ) : invoices.length === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin facturas" />
      ) : (
        <>
          <div className="selectInvoices__search">
            <Input
              allowClear
              size="middle"
              prefix={<MagnifyingGlass size={16} />}
              placeholder="Buscar por ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="selectInvoices__all" onClick={toggleAll}>
            <Checkbox
              checked={allSelected}
              onClick={(e) => e.stopPropagation()}
              onChange={toggleAll}
            />
            <span>Seleccionar todas</span>
          </div>
          {filteredInvoices.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sin resultados" />
          ) : (
            <div className="selectInvoices__list">
              {filteredInvoices.map((invoice) => {
                const selected = value.includes(invoice.id);
                return (
                  <div
                    key={invoice.id}
                    className={`selectInvoices__row${
                      selected ? " selectInvoices__row--selected" : ""
                    }`}
                    onClick={() => toggleOne(invoice.id)}
                  >
                    <div className="selectInvoices__row-left">
                      <Checkbox
                        checked={selected}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => toggleOne(invoice.id)}
                      />
                      <div className="selectInvoices__row-info">
                        <span className="selectInvoices__row-title">{invoice.id_erp}</span>
                        <span className="selectInvoices__row-date">
                          {dayjs(invoice.create_at).format("DD/MM/YY")}
                        </span>
                      </div>
                    </div>
                    <div className="selectInvoices__row-right">
                      <span className="selectInvoices__row-value">
                        {formatMoney(invoice.current_value)}
                      </span>
                      {renderBadge(invoice.expiration_date)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="selectInvoices">
      <p className="selectInvoices__title">Facturas a cancelar</p>
      <Dropdown
        open={open}
        onOpenChange={setOpen}
        trigger={["click"]}
        dropdownRender={() => panel}
        placement="bottomLeft"
      >
        <button
          type="button"
          className={`selectInvoices__trigger${error ? " selectInvoices__trigger--error" : ""}`}
        >
          <span className={value.length ? "" : "selectInvoices__placeholder"}>
            {value.length ? `${value.length} factura(s) seleccionada(s)` : "Selecciona facturas"}
          </span>
          <CaretDown size={16} />
        </button>
      </Dropdown>
    </div>
  );
};

export default SelectInvoices;
