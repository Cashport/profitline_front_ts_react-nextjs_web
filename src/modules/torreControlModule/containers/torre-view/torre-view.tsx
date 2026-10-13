"use client";

import { useMemo, useState } from "react";

import { WALLET_PORTFOLIO } from "@/modules/walletModule/mocked-data";
import AgingPanel from "../../components/aging-panel/aging-panel";
import ExecutivePanel from "../../components/executive-panel/executive-panel";
import NoveltyTypePanel from "../../components/novelty-type-panel/novelty-type-panel";
import TopClientsPanel from "../../components/top-clients-panel/top-clients-panel";
import TorreFilters from "../../components/torre-filters/torre-filters";
import TorreHeader from "../../components/torre-header/torre-header";
import TorreKpiCards from "../../components/torre-kpi-cards/torre-kpi-cards";
import { TORRE_NOVEDADES } from "../../mocked-data";
import {
  aplicarTramos,
  novedadesEnVista,
  porEjecutivo,
  porTipo,
  porTramo,
  resumen,
  topClientes
} from "../../utils/torre-calc";
import type { TramoIndex } from "@/modules/walletModule/types";

/* Todas las cifras de la página salen de aquí y bajan como props: cuando el
   portafolio venga de un request en vez de la constante, no cambia nada más. */

export default function TorreView() {
  // TODO: la búsqueda global filtrará contra el API; hoy sólo vive en el header.
  const [, setSearch] = useState("");
  // El único filtro vivo. Los otros cuatro ejes esperan el endpoint de filtros.
  const [tramos, setTramos] = useState<TramoIndex[]>([]);

  /* `base` es el portafolio con todo menos el filtro de tramo — el sitio donde
     entrarán coordinador, ejecutivo, KAM y tipo. Alimenta sólo el gráfico de
     tramos, que así conserva sus seis columnas aunque una esté seleccionada. */
  const base = WALLET_PORTFOLIO;
  const vista = useMemo(() => aplicarTramos(base, tramos), [base, tramos]);

  const resumenBase = useMemo(() => resumen(base), [base]);
  const tramosBase = useMemo(() => porTramo(base), [base]);

  const resumenVista = useMemo(() => resumen(vista), [vista]);
  const ejecutivos = useMemo(() => porEjecutivo(vista), [vista]);
  const clientes = useMemo(() => topClientes(vista), [vista]);
  const novedades = useMemo(() => novedadesEnVista(TORRE_NOVEDADES, tramos), [tramos]);
  const tipos = useMemo(() => porTipo(novedades), [novedades]);

  const toggleTramo = (t: TramoIndex) =>
    setTramos((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));

  return (
    <div className="wallet-scope flex flex-col gap-4 pb-6">
      <TorreHeader onSearchChange={setSearch} />

      <h2 className="text-lg font-semibold text-foreground">Torre de control</h2>

      <TorreFilters resumen={resumenVista} />
      <TorreKpiCards resumen={resumenVista} novedades={novedades} />

      <div className="grid grid-cols-1 items-stretch gap-3.5 xl:grid-cols-2">
        <AgingPanel
          porTramo={tramosBase}
          resumen={resumenBase}
          seleccion={tramos}
          onToggle={toggleTramo}
        />
        <ExecutivePanel ejecutivos={ejecutivos} />
      </div>

      <div className="grid grid-cols-1 items-start gap-3.5 xl:grid-cols-2">
        <NoveltyTypePanel tipos={tipos} />
        <TopClientsPanel clientes={clientes} />
      </div>
    </div>
  );
}
