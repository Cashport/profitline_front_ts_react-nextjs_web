import { EstadoDevolucion, IReturn, ReturnRow } from "@/types/reverseLogistics/IReverseLogistics";

// Lower index = worse (shown on the group row when a client mixes estados).
export const ESTADO_PRIORITY: EstadoDevolucion[] = [
  "Demora de aprobación",
  "Aprobado / Rechazado",
  "En aprobación",
  "Visita en curso",
  "Visita programada",
  "Red generada",
  "Recogido",
  "Movimiento Odoo",
  "Contabilización de NC",
  "Entregado"
];

export function worstEstado(estados: EstadoDevolucion[]): EstadoDevolucion {
  return estados.reduce((worst, current) => {
    const wi = ESTADO_PRIORITY.indexOf(worst);
    const ci = ESTADO_PRIORITY.indexOf(current);
    const wIdx = wi === -1 ? ESTADO_PRIORITY.length : wi;
    const cIdx = ci === -1 ? ESTADO_PRIORITY.length : ci;
    return cIdx < wIdx ? current : worst;
  });
}


const toLeaf = (dev: IReturn): ReturnRow => ({
  key: `dev-${dev.id}`,
  isGroup: false,
  devCount: 1,
  id: dev.id,
  idBoleto: dev.idBoleto,
  fecha: dev.fecha,
  cliente: dev.cliente,
  direccionCliente: dev.direccionCliente,
  canal: dev.canal,
  lineaNegocio: dev.lineaNegocio,
  unidades: dev.unidades,
  causal: dev.causal,
  monto: dev.monto,
  estado: dev.estado,
  pdfUrl: dev.pdfUrl
});

// Groups devoluciones by client: clients with a single return stay flat rows,
// clients with several become an expandable parent row with aggregated totals.
export function buildReturnRows(returns: IReturn[]): ReturnRow[] {
  const byCliente = new Map<string, IReturn[]>();
  returns.forEach((dev) => {
    if (!byCliente.has(dev.cliente)) byCliente.set(dev.cliente, []);
    byCliente.get(dev.cliente)!.push(dev);
  });

  const rows: ReturnRow[] = [];
  byCliente.forEach((devs, cliente) => {
    if (devs.length === 1) {
      rows.push(toLeaf(devs[0]));
      return;
    }
    rows.push({
      key: `group-${cliente}`,
      isGroup: true,
      devCount: devs.length,
      id: devs[0].id,
      idBoleto: "",
      fecha: devs[0].fecha,
      cliente,
      direccionCliente: "",
      canal: devs[0].canal,
      lineaNegocio: devs[0].lineaNegocio,
      unidades: devs.reduce((sum, d) => sum + d.unidades, 0),
      monto: devs.reduce((sum, d) => sum + d.monto, 0),
      estado: worstEstado(devs.map((d) => d.estado)),
      children: devs.map(toLeaf)
    });
  });

  return rows;
}
