"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Pagination, Spin } from "antd";
import { ArrowRight } from "lucide-react";

import { cn } from "@/utils/utils";
import { EST_META, TRAMOS } from "../../constants";
import { fmtM, grp } from "../../utils/format";
import { nextSort, ordenar, sumaTramos } from "../../utils/wallet-calc";
import DetailTooltip, { tramoRows } from "../shared/detail-tooltip";
import DistBar from "../shared/dist-bar";
import SortableTh from "../shared/sortable-th";
import StatusChip from "../shared/status-chip";
import type { IWalletDrilldown, IWalletGroupRow, SortState } from "../../types";

interface InvoiceGroupsProps {
  rows: IWalletGroupRow[];
  // eslint-disable-next-line no-unused-vars
  onOpenDetail: (clave: string) => void;
  drilldown: IWalletDrilldown | null;
  /** Nombre corto del cliente del drilldown; null sin selección. */
  clienteNombre: string | null;
  openGroup: string | null;
  onClearDrilldown: () => void;
  /** Consultando grupos: la tabla se queda y el cuerpo muestra un spinner. */
  loading?: boolean;
}

const TEXTUAL_COLS = ["grupo", "cliente", "estado"];

/** El endpoint de grupos no pagina, así que se pagina aquí sobre lo cargado. */
const PAGE_SIZE = 15;

const TH_PLAIN =
  "whitespace-nowrap border-b border-border bg-muted/40 px-3 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground";

/** Días sin gestión: verde ≤3, ámbar ≤7, rojo por encima. */
const GestionChip = ({ dias }: { dias: number | null }) => {
  if (dias === null) return <span className="text-muted-foreground">—</span>;
  return (
    <StatusChip sev={dias <= 3 ? "ok" : dias <= 7 ? "warn" : "crit"}>
      {dias === 0 ? "Hoy" : `${dias}d`}
    </StatusChip>
  );
};

/** Grupos de facturas: todo lo que se resuelve con una sola gestión. */
export default function InvoiceGroups({
  rows,
  onOpenDetail,
  drilldown,
  clienteNombre,
  openGroup,
  onClearDrilldown,
  loading
}: InvoiceGroupsProps) {
  const [sort, setSort] = useState<SortState>({ col: "monto", dir: "desc" });
  const zona = useRef<HTMLElement>(null);

  // null = todos los tramos del cliente, o ninguna selección.
  const ti = drilldown?.tramo ?? null;
  const enTramo = ti !== null;

  // Las filas ya llegan acotadas por el servidor (useWalletMatrixGroups recibe
  // el cliente y el tramo): aquí sólo se ordenan.
  const visibleRows = useMemo(
    () =>
      ordenar(rows, sort, (g) => {
        switch (sort.col) {
          case "grupo":
            return g.novedadId ?? EST_META[g.tipo].nom;
          case "cliente":
            return g.cliente;
          case "fact":
            return g.facturas;
          case "gestion":
            return g.diasSinGestion === null ? 99999 : g.diasSinGestion;
          case "estado":
            return g.estado.nom;
          default:
            return g.monto;
        }
      }),
    [rows, sort]
  );

  const [page, setPage] = useState(1);
  const pageRows = useMemo(
    () => visibleRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [visibleRows, page]
  );

  // Otro acotado u otro orden cambian qué hay en cada página: se vuelve a la primera.
  useEffect(() => {
    setPage(1);
  }, [rows, sort]);

  // Al acotar, la tabla suele quedar fuera de pantalla: se trae a la vista.
  useEffect(() => {
    if (drilldown) zona.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [drilldown]);

  const onSort = (col: string) => setSort((s) => nextSort(s, col, TEXTUAL_COLS));
  // Con un tramo elegido el API ya recortó `monto` a ese tramo, así que no hay
  // dos cifras que distinguir: la columna es la misma, sólo cambia el rótulo.
  const suma = visibleRows.reduce((a, g) => a + g.monto, 0);
  const titulo =
    drilldown && clienteNombre
      ? `${clienteNombre} · ${enTramo ? TRAMOS[ti].label : "todos los tramos"}`
      : "Grupos de facturas";

  return (
    <section ref={zona} className="rounded-xl bg-card text-card-foreground shadow-sm">
      <div className="flex flex-wrap items-center gap-2.5 border-b border-border p-4">
        <h3 className="text-[13.5px] font-semibold text-foreground">{titulo}</h3>
        <span className="ml-auto text-[11.5px] text-muted-foreground">
          {loading ? (
            "Actualizando…"
          ) : (
            <>
              {grp(visibleRows.length)} · {fmtM(suma)}
              {enTramo && " en el tramo"} · doble clic para abrir la gestión
            </>
          )}
        </span>
        {drilldown && (
          <button
            type="button"
            onClick={onClearDrilldown}
            className="rounded-md border border-border bg-card px-2.5 py-1 text-[11.5px] font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            Ver todos
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12.5px]">
          <thead>
            <tr>
              <SortableTh col="grupo" label="Grupo" sort={sort} onSort={onSort} />
              <SortableTh col="cliente" label="Cliente" sort={sort} onSort={onSort} />
              <SortableTh col="fact" label="Fact." align="right" sort={sort} onSort={onSort} />
              <SortableTh
                col="monto"
                label={enTramo ? `Total ${TRAMOS[ti].short}` : "Total"}
                align="right"
                sort={sort}
                onSort={onSort}
              />
              <th scope="col" className={TH_PLAIN}>
                Reparto
              </th>
              <th scope="col" className={TH_PLAIN}>
                Responsable
              </th>
              <SortableTh col="gestion" label="Gest." align="right" sort={sort} onSort={onSort} />
              <th scope="col" className={TH_PLAIN}>
                Ticket
              </th>
              <th scope="col" className={TH_PLAIN}>
                Límite
              </th>
              <SortableTh col="estado" label="Estado" sort={sort} onSort={onSort} />
              <th className="border-b border-border bg-muted/40" />
            </tr>
          </thead>

          <tbody>
            {loading ? (
              // Con `keepPreviousData` las filas de abajo serían de la foto
              // anterior: mejor el spinner que datos de otro acotado.
              <tr>
                <td colSpan={11} className="p-9 text-center">
                  <Spin size="large" />
                </td>
              </tr>
            ) : visibleRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-9 text-center text-muted-foreground">
                  No hay grupos con los filtros actuales.
                </td>
              </tr>
            ) : (
              pageRows.map((g) => (
                <tr
                  key={g.clave}
                  onDoubleClick={() => onOpenDetail(g.clave)}
                  className={cn(
                    "cursor-pointer border-b border-border last:border-b-0",
                    openGroup === g.clave && "bg-wallet-accent-soft"
                  )}
                >
                  <td className="px-3 py-2.5">
                    <span className="inline-flex items-center gap-2 font-semibold text-foreground">
                      <i
                        className={cn("h-2.5 w-2.5 shrink-0 rounded-[3px]", EST_META[g.tipo].bg)}
                        style={{ boxShadow: "inset 0 0 0 1px var(--wallet-seg-edge)" }}
                      />
                      {g.novedadId ? (
                        <span className="font-mono">{g.novedadId}</span>
                      ) : (
                        EST_META[g.tipo].nom
                      )}
                    </span>
                    <div className="text-[11.5px] text-muted-foreground">{g.detalle}</div>
                  </td>

                  <td className="px-3 py-2.5 text-foreground">{g.cliente}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-foreground">
                    {g.facturas}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-right font-semibold tabular-nums text-foreground">
                    {fmtM(g.monto)}
                  </td>
                  <DetailTooltip
                    title="Reparto por tramo"
                    rows={tramoRows(g.tramos)}
                    // El pie sale de la suma del reparto y no de `monto`: con un
                    // tramo pedido el API recorta el total, y el tooltip tiene
                    // que cerrar con las filas que está mostrando.
                    total={{ value: fmtM(sumaTramos(g.tramos)) }}
                  >
                    <td className="px-3 py-2.5">
                      <DistBar tramos={g.tramos} resaltar={ti} />
                    </td>
                  </DetailTooltip>
                  <td className="whitespace-nowrap px-3 py-2.5">
                    {g.responsable ? (
                      <span className="text-foreground">{g.responsable}</span>
                    ) : (
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        Sin dueño
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <GestionChip dias={g.diasSinGestion} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                    {g.compromiso ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 tabular-nums">
                    {g.limite ?? <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-3 py-2.5">
                    <StatusChip sev={g.estado.sev}>{g.estado.nom}</StatusChip>
                  </td>
                  <td className="px-3 py-2.5 text-right">
                    <button
                      type="button"
                      aria-label="Abrir gestión"
                      title="Abrir gestión"
                      onClick={() => onOpenDetail(g.clave)}
                      className="inline-flex rounded-md border border-border bg-card p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-4 py-3">
          <span className="text-[11.5px] text-muted-foreground">
            Mostrando {pageRows.length} de {grp(visibleRows.length)}
          </span>
          <Pagination
            current={page}
            pageSize={PAGE_SIZE}
            total={visibleRows.length}
            onChange={setPage}
            showSizeChanger={false}
            hideOnSinglePage
          />
        </div>
      )}

      <div className="border-t border-border px-4 py-3 text-[11.5px] leading-relaxed text-muted-foreground">
        {enTramo ? (
          // Con un tramo elegido el API recorta cada grupo a ese tramo, así que
          // aquí no se ve el total del grupo sino su parte. Decirlo evita que
          // el monto se lea como "todo lo que se resuelve con una gestión".
          <>
            Sólo los grupos de {clienteNombre} con facturas en {TRAMOS[ti].label.toLowerCase()}, y
            los montos son la parte que cae en ese tramo. Un mismo grupo puede tener más cartera en
            otros tramos.
          </>
        ) : (
          <>
            {drilldown
              ? `Todos los grupos de ${clienteNombre}, sin importar el tramo. `
              : "Estos son los grupos de toda la foto. "}
            <b className="font-semibold text-foreground">Total</b> es todo lo que se resuelve con
            una sola gestión.
          </>
        )}
      </div>
    </section>
  );
}
