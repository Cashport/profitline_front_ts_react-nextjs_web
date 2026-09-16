import type { ColumnsType } from "antd/es/table";
import {
  DateCell,
  TextCell,
  headerCell
} from "@/modules/marketAdmin/components/market-admin-bonus-and-discounts/discountsTableConfig";
import {
  IManagerBonificationGroup,
  IManagerBonificationItem
} from "@/types/marketAdmin/IMarketAdmin";

// Solo AVAILABLE está confirmado por backend; cualquier otro valor cae en un pill neutro.
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  AVAILABLE: {
    label: "Disponible",
    className: "bg-green-50 text-green-700 border border-green-200"
  }
};

const StatusPill = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? {
    label: status,
    className: "bg-[#F0F0F0] text-[#666666] border border-[#DDDDDD]"
  };
  return (
    <span className={`px-2 py-1 text-[11px] font-semibold rounded-lg w-fit ${cfg.className}`}>
      {cfg.label}
    </span>
  );
};

// Un grupo puede tener varios subgrupos (fijos o "elige hasta N"), cada uno con
// sus productos. El encabezado de subgrupo solo se muestra cuando hay más de uno.
const ItemsCell = ({ items }: { items: IManagerBonificationItem[] }) => {
  const visibles = items.filter((i) => !i.is_deleted);
  const showHeader = visibles.length > 1;

  return (
    <div className="flex flex-col gap-2">
      {visibles.map((item) => (
        <div key={item.group_item_id} className="flex flex-col gap-1">
          {showHeader && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#666666]">
                Subgrupo {item.subgroup_number}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F0F0F0] text-[#666666]">
                {item.fixed ? "Fijo" : `Elige hasta ${item.max_selection_qty}`}
              </span>
            </div>
          )}
          {item.products.map((p) => (
            <div key={p.group_item_product_id} className="flex items-center gap-2">
              <span className="text-sm text-[#141414] truncate">
                <span className="text-[#999999]">{p.sku}</span> — {p.description}
              </span>
              <span className="text-xs font-semibold text-[#666666] shrink-0">×{p.qty}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

const NumberCell = ({ value, bold }: { value: number; bold?: boolean }) => (
  <span className={`text-sm text-[#141414] ${bold ? "font-semibold" : ""}`}>{value}</span>
);

export const bonificadosColumns: ColumnsType<IManagerBonificationGroup> = [
  {
    title: "Productos",
    dataIndex: "items",
    key: "items",
    onHeaderCell: headerCell,
    render: (items: IManagerBonificationItem[]) => <ItemsCell items={items} />
  },
  {
    title: "Asignadas",
    dataIndex: "assigned_qty",
    key: "assigned_qty",
    width: 100,
    onHeaderCell: headerCell,
    render: (v: number) => <NumberCell value={v} />
  },
  {
    title: "Disponibles",
    dataIndex: "available_qty",
    key: "available_qty",
    width: 110,
    onHeaderCell: headerCell,
    render: (v: number) => <NumberCell value={v} bold />
  },
  {
    title: "Consumidas",
    dataIndex: "consumed_qty",
    key: "consumed_qty",
    width: 110,
    onHeaderCell: headerCell,
    render: (v: number) => <NumberCell value={v} />
  },
  {
    title: "Estado",
    dataIndex: "status",
    key: "status",
    width: 120,
    onHeaderCell: headerCell,
    render: (status: string) => <StatusPill status={status} />
  },
  {
    title: "Vence",
    dataIndex: "expiration_date",
    key: "expiration_date",
    width: 120,
    onHeaderCell: headerCell,
    render: (v: string | null) => <DateCell value={v} />
  },
  {
    title: "Creado",
    dataIndex: "created_at",
    key: "created_at",
    width: 120,
    onHeaderCell: headerCell,
    render: (v: string) => <DateCell value={v} />
  },
  {
    title: "Nota",
    dataIndex: "description",
    key: "description",
    onHeaderCell: headerCell,
    render: (v: string | null) =>
      v ? <span className="text-sm text-[#999999] truncate">{v}</span> : <TextCell value={null} />
  }
];
