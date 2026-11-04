import type { ColumnsType } from "antd/es/table";
import { useTranslations } from "use-intl";
import ApprovalStatusPill from "@/components/ui/approval-status-pill";
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
// labelKey: clave en marketAdmin.clientDetail.bonuses.status
const STATUS_CONFIG: Record<string, { labelKey: "available"; className: string }> = {
  AVAILABLE: {
    labelKey: "available",
    className: "bg-green-50 text-green-700 border border-green-200"
  }
};

const StatusPill = ({ status }: { status: string }) => {
  const t = useTranslations("marketAdmin.clientDetail.bonuses.status");
  const known = STATUS_CONFIG[status];
  const className = known?.className ?? "bg-[#F0F0F0] text-[#666666] border border-[#DDDDDD]";
  return (
    <span className={`px-2 py-1 text-[13px] font-semibold rounded-lg w-fit ${className}`}>
      {known ? t(known.labelKey) : status}
    </span>
  );
};

// Un grupo puede tener varios subgrupos (fijos o "elige hasta N"), cada uno con
// sus productos. El encabezado de subgrupo solo se muestra cuando hay más de uno.
const ItemsCell = ({ items }: { items: IManagerBonificationItem[] }) => {
  const t = useTranslations("marketAdmin.clientDetail.bonuses");
  const visibles = items.filter((i) => !i.is_deleted);
  const showHeader = visibles.length > 1;

  return (
    <div className="flex flex-col gap-2">
      {visibles.map((item) => (
        <div key={item.group_item_id} className="flex flex-col gap-1">
          {showHeader && (
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] font-semibold text-[#666666]">
                {t("subgroup", { number: item.subgroup_number })}
              </span>
              <span className="text-[13px] font-semibold px-1.5 py-0.5 rounded-full bg-[#F0F0F0] text-[#666666]">
                {item.fixed ? t("fixed") : t("pickUpTo", { qty: item.max_selection_qty })}
              </span>
            </div>
          )}
          {item.products.map((p) => (
            <div key={p.group_item_product_id} className="flex items-center gap-2">
              <span className="text-sm text-[#141414] truncate">
                <span className="text-[#999999]">{p.sku}</span> — {p.description}
              </span>
              <span className="text-[13px] font-semibold text-[#666666] shrink-0">×{p.qty}</span>
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

export const useBonificadosColumns = (): ColumnsType<IManagerBonificationGroup> => {
  const t = useTranslations("marketAdmin.clientDetail.bonuses.columns");
  const tCommon = useTranslations("common.fields");
  return [
    {
      title: t("products"),
      dataIndex: "items",
      key: "items",
      onHeaderCell: headerCell,
      render: (items: IManagerBonificationItem[]) => <ItemsCell items={items} />
    },
    {
      title: t("assigned"),
      dataIndex: "assigned_qty",
      key: "assigned_qty",
      width: 100,
      onHeaderCell: headerCell,
      render: (v: number) => <NumberCell value={v} />
    },
    {
      title: t("available"),
      dataIndex: "available_qty",
      key: "available_qty",
      width: 110,
      onHeaderCell: headerCell,
      render: (v: number) => <NumberCell value={v} bold />
    },
    {
      title: t("consumed"),
      dataIndex: "consumed_qty",
      key: "consumed_qty",
      width: 110,
      onHeaderCell: headerCell,
      render: (v: number) => <NumberCell value={v} />
    },
    {
      title: tCommon("status"),
      dataIndex: "status",
      key: "status",
      width: 120,
      onHeaderCell: headerCell,
      render: (status: string) => <StatusPill status={status} />
    },
    {
      title: t("approval"),
      dataIndex: "approval_entity_status_id",
      key: "approval_entity_status_id",
      width: 140,
      onHeaderCell: headerCell,
      render: (statusId: number | null) => <ApprovalStatusPill statusId={statusId} />
    },
    {
      title: t("expires"),
      dataIndex: "expiration_date",
      key: "expiration_date",
      width: 120,
      onHeaderCell: headerCell,
      render: (v: string | null) => <DateCell value={v} />
    },
    {
      title: t("created"),
      dataIndex: "created_at",
      key: "created_at",
      width: 120,
      onHeaderCell: headerCell,
      render: (v: string) => <DateCell value={v} />
    },
    {
      title: t("note"),
      dataIndex: "description",
      key: "description",
      onHeaderCell: headerCell,
      render: (v: string | null) =>
        v ? <span className="text-sm text-[#999999] truncate">{v}</span> : <TextCell value={null} />
    }
  ];
};
