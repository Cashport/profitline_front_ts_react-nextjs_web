import { useMemo } from "react";
import { Button, Checkbox, Input, Progress, Radio, Segmented, Select } from "antd";
import { CaretLeft } from "phosphor-react";

import { cn, formatNumber } from "@/utils/utils";
import {
  BULK_ACTIONS,
  MOCK_NEW_STATUSES,
  MOCK_NOVELTY_TYPES,
  MOCK_PAYMENTS
} from "./bulk-search-mock-data";
import { computePaymentCoverage, formatMillions } from "./bulk-search-utils";
import { BulkPaymentOrder, IBulkActionConfig, IBulkSearchRow } from "./types";

interface Props {
  foundRows: IBulkSearchRow[];
  /** Encontradas cuyo estado está marcado en "Aplicar a". */
  scopedRows: IBulkSearchRow[];
  config: IBulkActionConfig;
  onConfigChange: (patch: Partial<IBulkActionConfig>) => void;
  onBack: () => void;
  /** Recibe cuántas facturas procesa la acción. */
  onRun: (count: number) => void;
}

const PAYMENT_ORDERS: { label: string; value: BulkPaymentOrder }[] = [
  { label: "Más antiguas primero", value: "antiguedad" },
  { label: "Menor valor primero", value: "menor" }
];

const toOptions = (values: string[]) => values.map((value) => ({ value, label: value }));

const BulkSearchActionStep = ({
  foundRows,
  scopedRows,
  config,
  onConfigChange,
  onBack,
  onRun
}: Props) => {
  // Estados de las encontradas en el orden en que aparecen, con su color y cuántas hay
  const statuses = useMemo(() => {
    const byStatus = new Map<string, { color?: string; count: number }>();
    foundRows.forEach((row) => {
      if (!row.status) return;
      const item = byStatus.get(row.status);
      if (item) item.count++;
      else byStatus.set(row.status, { color: row.statusColor, count: 1 });
    });
    return Array.from(byStatus, ([name, item]) => ({ name, ...item }));
  }, [foundRows]);

  const scopedAmount = useMemo(
    () => scopedRows.reduce((acc, row) => acc + (row.amount ?? 0), 0),
    [scopedRows]
  );

  const payment = MOCK_PAYMENTS.find((item) => item.id === config.paymentId) ?? MOCK_PAYMENTS[0];
  const coverage = useMemo(
    () =>
      config.action === "pago"
        ? computePaymentCoverage(scopedRows, payment.amount, config.order)
        : null,
    [config.action, config.order, scopedRows, payment.amount]
  );

  const action = BULK_ACTIONS.find((item) => item.key === config.action) ?? BULK_ACTIONS[0];
  // Un pago sólo alcanza para parte de las facturas
  const applyCount = coverage ? coverage.covered + (coverage.partial ? 1 : 0) : scopedRows.length;
  const isInvalid = !scopedRows.length || (coverage !== null && !coverage.pending);

  const coverageText = coverage?.pending
    ? `Cubre ${formatNumber(coverage.covered)} de ${formatNumber(coverage.pending)} facturas pendientes${
        coverage.partial ? " + 1 parcial" : ""
      }${coverage.left > 0 ? ` · sobran ${formatMillions(coverage.left)}` : ""}`
    : "No hay facturas pendientes en el alcance";

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-auto px-[22px] py-4">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
            <span className="text-[13px] font-semibold">Aplicar a</span>
            <span className="text-xs text-muted-foreground">
              {formatNumber(scopedRows.length)} facturas · {formatMillions(scopedAmount)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {statuses.map(({ name, color, count }) => (
              <Checkbox
                key={name}
                checked={!!config.scope[name]}
                onChange={(event) =>
                  onConfigChange({ scope: { ...config.scope, [name]: event.target.checked } })
                }
                className={cn(
                  "!flex h-[30px] !items-center whitespace-nowrap rounded-md border bg-white !px-2.5 !text-xs font-medium",
                  config.scope[name] ? "border-foreground" : "border-[#e3e3e3]"
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                  {name}
                  <span className="text-[#8a8a8a]">{formatNumber(count)}</span>
                </span>
              </Checkbox>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] items-start gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-[13px] font-semibold">Acción</span>
            <Radio.Group
              value={config.action}
              onChange={(event) => onConfigChange({ action: event.target.value })}
              className="!flex flex-col gap-1.5"
            >
              {BULK_ACTIONS.map((item) => (
                <Radio
                  key={item.key}
                  value={item.key}
                  className={cn(
                    "!me-0 !flex !items-center rounded-lg border !px-3 !py-2.5",
                    item.key === config.action
                      ? "border-foreground bg-[#fafafa]"
                      : "border-[#ececec] bg-white"
                  )}
                >
                  <span className="block text-[13px] font-medium text-foreground">
                    {item.label}
                  </span>
                  <span className="block text-[11px] text-[#8a8a8a]">{item.description}</span>
                </Radio>
              ))}
            </Radio.Group>
          </div>

          <div className="flex flex-col gap-3 rounded-lg bg-[#f7f7f7] p-3.5">
            {config.action === "estado" && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">Nuevo estado</span>
                <Select
                  value={config.newStatus}
                  onChange={(value) => onConfigChange({ newStatus: value })}
                  options={toOptions(MOCK_NEW_STATUSES)}
                  style={{ width: "100%" }}
                />
              </div>
            )}

            {config.action === "pago" && (
              <>
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-muted-foreground">Pago a aplicar</span>
                  <Radio.Group
                    value={config.paymentId}
                    onChange={(event) => onConfigChange({ paymentId: event.target.value })}
                    className="!flex flex-col gap-1.5"
                  >
                    {MOCK_PAYMENTS.map((item) => (
                      <Radio
                        key={item.id}
                        value={item.id}
                        className={cn(
                          "!me-0 !flex !items-center rounded-md border bg-white !px-2.5 !py-2 [&>span:last-child]:flex-1",
                          item.id === config.paymentId ? "border-foreground" : "border-[#e3e3e3]"
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className="min-w-0 flex-1">
                            <span className="block text-xs font-medium text-foreground">
                              {item.id} · {item.bank}
                            </span>
                            <span className="block text-[11px] text-[#8a8a8a]">{item.date}</span>
                          </span>
                          <span className="whitespace-nowrap text-xs font-semibold text-foreground">
                            {formatMillions(item.amount)}
                          </span>
                        </span>
                      </Radio>
                    ))}
                  </Radio.Group>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-muted-foreground">Orden de aplicación</span>
                  <Segmented<BulkPaymentOrder>
                    block
                    options={PAYMENT_ORDERS}
                    value={config.order}
                    onChange={(value) => onConfigChange({ order: value })}
                  />
                </div>
                {coverage && (
                  <div className="flex flex-col gap-1.5 rounded-md bg-white px-3 py-2.5">
                    <Progress
                      percent={Math.min(100, (coverage.payment / (coverage.total || 1)) * 100)}
                      showInfo={false}
                      size="small"
                      strokeColor="#CBE71E"
                      trailColor="#ececec"
                      className="!m-0"
                    />
                    <span className="text-xs text-[#444]">{coverageText}</span>
                  </div>
                )}
              </>
            )}

            {config.action === "novedad" && (
              <div className="flex flex-col gap-1">
                <span className="text-[11px] text-muted-foreground">Tipo de novedad</span>
                <Select
                  value={config.noveltyType}
                  onChange={(value) => onConfigChange({ noveltyType: value })}
                  options={toOptions(MOCK_NOVELTY_TYPES)}
                  style={{ width: "100%" }}
                />
              </div>
            )}

            {config.action === "radicar" && (
              <p className="text-xs text-[#444]">Se marcarán como radicadas con fecha de hoy.</p>
            )}

            {config.action === "estado_cta" && (
              <p className="text-xs text-[#444]">
                Se enviará un Excel con las {formatNumber(scopedRows.length)} facturas al contacto
                de cartera del cliente.
              </p>
            )}

            <div className="flex flex-col gap-1">
              <span className="text-[11px] text-muted-foreground">Comentario</span>
              <Input.TextArea
                value={config.comment}
                onChange={(event) => onConfigChange({ comment: event.target.value })}
                placeholder="Queda en el historial de cada factura"
                rows={3}
                className="!text-xs"
                style={{ resize: "none" }}
              />
            </div>
          </div>
        </div>
      </div>

      <footer className="flex flex-none items-center gap-2.5 border-t border-[#ececec] px-[22px] py-3.5">
        <Button type="text" size="large" icon={<CaretLeft size={12} />} onClick={onBack}>
          Resultados
        </Button>
        <div className="flex-1" />
        <Button
          type="primary"
          size="large"
          disabled={isInvalid}
          onClick={() => onRun(applyCount)}
          className="!font-semibold"
        >
          {action.verb} {formatNumber(applyCount)} facturas
        </Button>
      </footer>
    </>
  );
};

export default BulkSearchActionStep;
