"use client";

import { useState } from "react";
import { Input, Pagination } from "antd";

import { WALLET_PEOPLE } from "../../mocked-data";
import { fac, fmtFull, fmtM } from "../../utils/format";
import PersonBadge from "../shared/person-badge";
import NoveltyDrawer, { NoveltyPanel, SectionTitle } from "./novelty-drawer";
import type { IWalletDocument, IWalletPerson } from "../../types";

interface ModalLinkNoveltyProps {
  open: boolean;
  clienteNombre: string;
  /** Facturas y saldos marcados en la pestaña "Facturas". */
  documentos: IWalletDocument[];
  onClose: () => void;
}

interface MockNovedadAbierta {
  id: string;
  tipo: string;
  monto: number;
  responsable: IWalletPerson;
}

const NOVEDADES_PAGE_SIZE = 5;

// TODO: reemplazar por las novedades abiertas reales del cliente.
const MOCK_NOVEDADES_ABIERTAS: MockNovedadAbierta[] = [
  {
    id: "NOV-1042",
    tipo: "Acuerdo de pago",
    monto: 32_000_000,
    responsable: WALLET_PEOPLE.cosorio
  },
  { id: "NOV-1041", tipo: "Refacturación", monto: 281_000_000, responsable: WALLET_PEOPLE.cosorio },
  {
    id: "NOV-1044",
    tipo: "Nota crédito comercial",
    monto: 126_000_000,
    responsable: WALLET_PEOPLE.comercial
  },
  { id: "NOV-1045", tipo: "Refacturación", monto: 177_000_000, responsable: WALLET_PEOPLE.cosorio },
  {
    id: "NOV-1039",
    tipo: "Cruce de saldos / legalización",
    monto: 64_000_000,
    responsable: WALLET_PEOPLE.gtorres
  },
  {
    id: "NOV-1037",
    tipo: "Pago no identificado",
    monto: 18_500_000,
    responsable: WALLET_PEOPLE.mbermudez
  },
  {
    id: "NOV-1035",
    tipo: "Faltante / avería en entrega",
    monto: 9_200_000,
    responsable: WALLET_PEOPLE.eorjuela
  },
  {
    id: "NOV-1033",
    tipo: "Factura rechazada / sin radicar",
    monto: 41_300_000,
    responsable: WALLET_PEOPLE.malfonso
  },
  {
    id: "NOV-1030",
    tipo: "NC diferencia de precio",
    monto: 27_800_000,
    responsable: WALLET_PEOPLE.backoffice
  },
  {
    id: "NOV-1028",
    tipo: "Acuerdo de pago",
    monto: 152_000_000,
    responsable: WALLET_PEOPLE.cosorio
  },
  { id: "NOV-1025", tipo: "Refacturación", monto: 73_400_000, responsable: WALLET_PEOPLE.gtorres },
  {
    id: "NOV-1021",
    tipo: "Cruce de saldos / legalización",
    monto: 15_900_000,
    responsable: WALLET_PEOPLE.comercial
  }
];

/** Vínculo de los documentos seleccionados a una novedad abierta del cliente.
 *  TODO: reemplazar el mock y el `console.log` de envío por el endpoint real. */
function LinkNoveltyForm({
  clienteNombre,
  documentos,
  onClose
}: Omit<ModalLinkNoveltyProps, "open">) {
  const [novedadExistente, setNovedadExistente] = useState(MOCK_NOVEDADES_ABIERTAS[0].id);
  const [comentario, setComentario] = useState("");
  const [novedadesPage, setNovedadesPage] = useState(1);

  const novedadesVisibles = MOCK_NOVEDADES_ABIERTAS.slice(
    (novedadesPage - 1) * NOVEDADES_PAGE_SIZE,
    novedadesPage * NOVEDADES_PAGE_SIZE
  );

  const total = documentos.reduce((sum, d) => sum + d.saldo, 0);

  const handleSubmit = () => {
    console.log("Vincular novedad", { novedadExistente, comentario, documentos });
    onClose();
  };

  return (
    <NoveltyPanel
      title="Vincular a una novedad existente"
      subtitle={`${fac(documentos.length)} · ${fmtFull(total)} · ${clienteNombre}`}
      onClose={onClose}
      submitLabel="Vincular facturas"
      sendingLabel="Vinculando…"
      onSubmit={handleSubmit}
      submitDisabled={documentos.length === 0}
    >
      <div>
        <SectionTitle>Novedades abiertas de este cliente</SectionTitle>
        <div className="overflow-hidden rounded-md border border-border">
          {novedadesVisibles.map((n) => (
            <div
              key={n.id}
              onClick={() => setNovedadExistente(n.id)}
              className="flex cursor-pointer items-center gap-3 border-b border-border px-3 py-2.5 text-[12.5px] transition-colors last:border-b-0 hover:bg-secondary"
            >
              <input
                type="radio"
                name="novedad-existente"
                aria-label={`Seleccionar ${n.id}`}
                className="accent-wallet-accent"
                checked={novedadExistente === n.id}
                onChange={() => setNovedadExistente(n.id)}
              />
              <span className="font-mono font-semibold text-foreground">{n.id}</span>
              <span className="min-w-0 flex-1 truncate text-muted-foreground">{n.tipo}</span>
              <span className="whitespace-nowrap font-semibold tabular-nums text-foreground">
                {fmtM(n.monto)}
              </span>
              <PersonBadge person={n.responsable} mini className="flex-none" />
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex justify-end">
          <Pagination
            current={novedadesPage}
            pageSize={NOVEDADES_PAGE_SIZE}
            total={MOCK_NOVEDADES_ABIERTAS.length}
            onChange={setNovedadesPage}
            showSizeChanger={false}
            hideOnSinglePage
            size="small"
          />
        </div>
      </div>

      <div>
        <SectionTitle>Comentario</SectionTitle>
        <Input.TextArea
          rows={2}
          value={comentario}
          placeholder="Ej.: el cliente pide el soporte firmado antes del viernes"
          onChange={(e) => setComentario(e.target.value)}
        />
      </div>
    </NoveltyPanel>
  );
}

export default function ModalLinkNovelty({ open, onClose, ...form }: ModalLinkNoveltyProps) {
  return (
    <NoveltyDrawer open={open} onClose={onClose}>
      <LinkNoveltyForm onClose={onClose} {...form} />
    </NoveltyDrawer>
  );
}
