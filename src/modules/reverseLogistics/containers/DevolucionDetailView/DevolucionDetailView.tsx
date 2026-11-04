"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { useSWRConfig } from "swr";
import dayjs from "dayjs";
import { Input } from "antd";
import { MoreHorizontal, Pencil } from "lucide-react";
import { useTranslations } from "use-intl";
import Header from "@/components/organisms/header";
import UiSearchInput from "@/components/ui/search-input/search-input";
import UiTab from "@/components/ui/ui-tab";
import ProfitLoader from "@/components/ui/profit-loader";
import GeneralDropdown, { DropdownItem } from "@/components/ui/dropdown/dropdown";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import { Button } from "@/modules/chat/ui/button";
import { useMessageApi } from "@/context/MessageContext";
import {
  IProfit360ActualizarDevolucionRequest,
  IProfit360DevolucionCambio,
  IProfit360DevolucionDocumento,
  IProfit360DevolucionPdf
} from "@/types/reverseLogistics/IReverseLogistics";
import {
  actualizarProfit360DevolucionProductos,
  anularProfit360Devolucion,
  getProfit360DevolucionPdf,
  reenviarProfit360Devolucion
} from "@/services/reverseLogistics/reverseLogistics";
import { CausalBadge } from "../../components/CausalBadge/CausalBadge";
import { DevolucionInfoCards } from "../../components/DevolucionInfoCards/DevolucionInfoCards";
import { DevolucionDocumentos } from "../../components/DevolucionDocumentos/DevolucionDocumentos";
import { DevolucionProductos } from "../../components/DevolucionProductos/DevolucionProductos";
import { ModalMotivoDevolucion } from "../../components/ModalMotivoDevolucion/ModalMotivoDevolucion";
import { fmtCop, fmtNumber } from "../../utils/format";

interface DevolucionDetailViewProps {
  id: string;
}

type DetalleTab = "documentos" | "productos";

type DetailT = ReturnType<typeof useTranslations<"reverseLogistics.returnDetail">>;

const LISTADO_PATH = "/reverse-logistics/returns";

// Campos del cambio `documento`: `monto` viaja como "montoDocumento". `etiqueta`
// es la clave de `reverseLogistics.returnDetail.changes.fields`.
const CAMPOS_DOCUMENTO = [
  { field: "numeroDocumento", campo: "numeroDocumento", etiqueta: "number" },
  { field: "fechaDocumento", campo: "fechaDocumento", etiqueta: "date" },
  { field: "unidades", campo: "unidades", etiqueta: "units" },
  { field: "monto", campo: "montoDocumento", etiqueta: "value" }
] as const;

const mostrarCampo = (
  field: (typeof CAMPOS_DOCUMENTO)[number]["field"],
  doc: IProfit360DevolucionDocumento
) =>
  field === "fechaDocumento"
    ? dayjs(doc.fechaDocumento).format("DD/MM/YYYY")
    : field === "monto"
      ? fmtCop(doc.monto)
      : String(doc[field]);

// Compara el detalle con el borrador y arma el cuerpo de actualizar-productos,
// junto con la lista legible que se muestra al guardar. Los precintos no se
// envían, así que el backend los deja como están.
function buildCambios(
  original: IProfit360DevolucionPdf,
  draft: IProfit360DevolucionPdf,
  t: DetailT
) {
  const body: Omit<IProfit360ActualizarDevolucionRequest, "id" | "Observacion"> = { data: [] };
  const data: IProfit360DevolucionCambio[] = body.data;
  const resumen: string[] = [];

  if (draft.resumen.observacion !== original.resumen.observacion) {
    body.observacionGeneral = draft.resumen.observacion;
    resumen.push(t("changes.observationUpdated"));
  }
  if (draft.resumen.cantidadEmbalaje !== original.resumen.cantidadEmbalaje) {
    body.embalajes = [
      { idEmbalaje: draft.resumen.idembalaje, cantidad: draft.resumen.cantidadEmbalaje }
    ];
    resumen.push(
      t("changes.packagingQuantity", {
        packaging: draft.resumen.embalaje,
        from: original.resumen.cantidadEmbalaje,
        to: draft.resumen.cantidadEmbalaje
      })
    );
  }

  draft.datos.forEach((doc) => {
    const previo = original.datos.find(
      (d) => d.idDocumentoXDevolucion === doc.idDocumentoXDevolucion
    );
    if (!previo) return;
    const nombre = t("changes.document", { number: previo.numeroDocumento });

    CAMPOS_DOCUMENTO.forEach(({ field, campo, etiqueta }) => {
      if (doc[field] === previo[field]) return;
      data.push({
        type: "documento",
        idDocumentoXDevolucion: doc.idDocumentoXDevolucion,
        campo,
        oldvalue: String(previo[field]),
        newvalue: String(doc[field])
      });
      resumen.push(
        t("changes.documentField", {
          document: nombre,
          field: t(`changes.fields.${etiqueta}`),
          from: mostrarCampo(field, previo),
          to: mostrarCampo(field, doc)
        })
      );
    });

    previo.data.forEach((p) => {
      if (doc.data.some((x) => x.idProductoxDocumento === p.idProductoxDocumento)) return;
      data.push({ type: "eliminar", idProductoxDocumento: p.idProductoxDocumento, lote: p.lote });
      resumen.push(
        t("changes.productRemoved", { document: nombre, product: p.nombreProducto, lot: p.lote })
      );
    });

    doc.data.forEach((p) => {
      const antes = previo.data.find((x) => x.idProductoxDocumento === p.idProductoxDocumento);
      const producto = t("changes.product", {
        document: nombre,
        product: p.nombreProducto,
        lot: p.lote
      });
      if (!antes) {
        // La forma de `newvalue` no está documentada: se envía la fila con la
        // misma forma que trae la respuesta, sin el id temporal. Pendiente de
        // confirmar.
        data.push({
          type: "adicionar",
          lote: p.lote,
          newvalue: JSON.stringify({ ...p, idProductoxDocumento: undefined })
        });
        resumen.push(
          t("changes.productAdded", { document: nombre, product: p.nombreProducto, lot: p.lote })
        );
        return;
      }
      const base = { idProductoxDocumento: p.idProductoxDocumento, lote: p.lote };
      if (p.cantidadProdXDoc !== antes.cantidadProdXDoc) {
        data.push({
          ...base,
          type: "unidad",
          oldvalue: String(antes.cantidadProdXDoc),
          newvalue: String(p.cantidadProdXDoc)
        });
        resumen.push(
          t("changes.quantity", {
            product: producto,
            from: antes.cantidadProdXDoc,
            to: p.cantidadProdXDoc
          })
        );
      }
      if (p.precioUnitario !== antes.precioUnitario) {
        data.push({
          ...base,
          type: "valor",
          oldvalue: String(antes.precioUnitario),
          newvalue: String(p.precioUnitario)
        });
        resumen.push(
          t("changes.unitPrice", {
            product: producto,
            from: fmtCop(antes.precioUnitario),
            to: fmtCop(p.precioUnitario)
          })
        );
      }
      if (p.observacionProducto !== antes.observacionProducto) {
        data.push({
          ...base,
          type: "observacionProducto",
          oldvalue: antes.observacionProducto,
          newvalue: p.observacionProducto
        });
        resumen.push(t("changes.productObservation", { product: producto }));
      }
    });
  });

  return { body, resumen };
}

// Errores por documento en edición; bloquean el guardado. Que el documento
// conserve al menos un producto lo asegura la tabla (no deja quitar el último).
function validarDocumentos(datos: IProfit360DevolucionDocumento[], t: DetailT) {
  const errores: Record<string, string> = {};
  datos.forEach((doc) => {
    const numero = doc.numeroDocumento.trim();
    const error = !numero
      ? t("validation.numberRequired")
      : datos.some((d) => d !== doc && d.numeroDocumento.trim() === numero)
        ? t("validation.numberDuplicated")
        : doc.data.some((p) => !(p.cantidadProdXDoc > 0))
          ? t("validation.quantityRequired")
          : "";
    if (error) errores[doc.idDocumentoXDevolucion] = error;
  });
  return errores;
}

const mensajeError = (error: unknown, fallback: string) =>
  error instanceof Error && error.message ? error.message : fallback;

export function DevolucionDetailView({ id }: DevolucionDetailViewProps) {
  const t = useTranslations("reverseLogistics.returnDetail");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const { mutate: mutateGlobal } = useSWRConfig();
  const { showMessage } = useMessageApi();

  const { data, isLoading, mutate } = useSWR(
    ["reverse-logistics/profit360-devolucion-pdf", id],
    () => getProfit360DevolucionPdf(id),
    { revalidateOnFocus: false }
  );

  const [draft, setDraft] = useState<IProfit360DevolucionPdf | null>(null);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<DetalleTab>("documentos");
  // null mientras el usuario no abra / cierre documentos: queda abierto el primero.
  const [openDocs, setOpenDocs] = useState<string[] | null>(null);
  const [openProductos, setOpenProductos] = useState<string[]>([]);
  const [modal, setModal] = useState<"reenviar" | "anular" | "guardar" | null>(null);
  const [reenviando, setReenviando] = useState(false);

  const errores = useMemo<Record<string, string>>(
    () => (draft ? validarDocumentos(draft.datos, t) : {}),
    [draft, t]
  );
  const cambios = useMemo(
    () => (draft && data ? buildCambios(data, draft, t) : null),
    [draft, data, t]
  );

  const volver = () => router.push(LISTADO_PATH);

  if (!data) {
    return (
      <div className="flex flex-col">
        <Header title={t("title")} onBack={volver} />
        <div className="flex min-h-[400px] items-center justify-center rounded-xl bg-cashport-white p-6 shadow-sm">
          {isLoading ? (
            <ProfitLoader />
          ) : (
            <p className="text-sm text-[#999999]">{t("loadError")}</p>
          )}
        </div>
      </div>
    );
  }

  const editing = draft !== null;
  const { resumen, datos, productos, lotes } = draft ?? data;

  const lineas = datos.flatMap((d) => d.data);
  const totalUnidades = lineas.reduce((acc, p) => acc + p.cantidadProdXDoc, 0);
  const totalValor = lineas.reduce((acc, p) => acc + p.valorTotal, 0);
  const codigos = Array.from(new Set(lineas.map((p) => p.codigo)));
  const docKeys = datos.map((d) => d.idDocumentoXDevolucion);
  const docsAbiertos = openDocs ?? docKeys.slice(0, 1);
  const nErrores = Object.keys(errores).length;

  // "Expandir todo" actúa sobre la vista visible: documentos o productos.
  const enProductos = !editing && tab === "productos";
  const claves = enProductos ? codigos : docKeys;
  const abiertas = enProductos ? openProductos : docsAbiertos;
  const todoAbierto = claves.length > 0 && claves.every((k) => abiertas.includes(k));
  const toggleTodo = () => {
    const next = todoAbierto ? [] : claves;
    if (enProductos) setOpenProductos(next);
    else setOpenDocs(next);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    // Al buscar se abren los documentos para ver las coincidencias.
    if (value.trim()) setOpenDocs(docKeys);
  };

  const startEdit = () => {
    setDraft(data);
    setOpenDocs(docKeys);
  };

  const handleGuardarClick = () => {
    if (nErrores) {
      showMessage("warning", t("messages.reviewDocuments"));
      return;
    }
    if (!cambios?.resumen.length) {
      setDraft(null);
      showMessage("info", t("messages.noChanges"));
      return;
    }
    setModal("guardar");
  };

  // Unidades, montos o estado de la devolución cambian en el listado.
  const refrescarListado = () =>
    mutateGlobal((key) => Array.isArray(key) && key[0] === "reverse-logistics/profit360-visits");

  const handleGuardar = async (motivo: string) => {
    if (!cambios) return;
    try {
      await actualizarProfit360DevolucionProductos({ id, Observacion: motivo, ...cambios.body });
      showMessage("success", t("messages.saved", { id: resumen.idboleto }));
    } catch (error) {
      const mensaje = mensajeError(error, t("messages.saveError"));
      // Pharma360 responde 400 cuando guardó pero no pudo regenerar el PDF: los
      // cambios ya quedaron, así que no se deben volver a enviar.
      if (!mensaje.startsWith("Los cambios se guardaron")) {
        showMessage("error", mensaje);
        throw error;
      }
      showMessage("warning", mensaje);
    }
    setDraft(null);
    mutate();
    refrescarListado();
  };

  const handleReenviar = async () => {
    setReenviando(true);
    try {
      await reenviarProfit360Devolucion(id);
      showMessage("success", t("messages.resent"));
      setModal(null);
    } catch (error) {
      showMessage("error", mensajeError(error, t("messages.resendError")));
    } finally {
      setReenviando(false);
    }
  };

  const handleAnular = async (motivo: string) => {
    try {
      await anularProfit360Devolucion({ id, Observacion: motivo });
    } catch (error) {
      showMessage("error", mensajeError(error, t("messages.voidError")));
      throw error;
    }
    showMessage("success", t("messages.voided", { id: resumen.idboleto }));
    refrescarListado();
    router.push(LISTADO_PATH);
  };

  const acciones: DropdownItem[] = [
    { key: "reenviar", label: t("actions.resend"), onClick: () => setModal("reenviar") },
    { key: "anular", label: t("actions.void"), danger: true, onClick: () => setModal("anular") }
  ];

  const expandirTodo = (
    <button
      type="button"
      onClick={toggleTodo}
      className="text-xs font-semibold text-gray-900 transition-colors hover:text-[#1677ff]"
    >
      {todoAbierto ? t("collapseAll") : t("expandAll")}
    </button>
  );

  const documentos = (
    <DevolucionDocumentos
      datos={datos}
      search={editing ? "" : search}
      editing={editing}
      activeKeys={docsAbiertos}
      onChangeActiveKeys={setOpenDocs}
      errores={errores}
      productos={productos}
      lotes={lotes}
      onChangeDatos={(next) => setDraft((d) => d && { ...d, datos: next })}
    />
  );

  return (
    <div className="flex flex-col">
      <Header
        title={t("titleWithId", { id: resumen.idboleto })}
        onBack={volver}
        titleExtra={
          <div className="flex flex-wrap gap-1">
            {resumen.causal.Causales.map((c) => (
              <CausalBadge key={c.Id || c.causal} label={c.causal} rgb={c.RGB} />
            ))}
          </div>
        }
        actionsExtra={
          editing ? null : (
            <UiSearchInput
              id="devolucion-detail-search"
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
            />
          )
        }
      />

      <div className="flex flex-col gap-4 rounded-xl bg-cashport-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
            <span className="flex items-center gap-2">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-cashport-black text-[10px] font-semibold text-white">
                {resumen.usuario.slice(0, 2).toUpperCase()}
              </span>
              <span>
                {t.rich("createdBy", {
                  user: resumen.usuario,
                  b: (chunks) => <span className="font-medium text-gray-900">{chunks}</span>
                })}
              </span>
            </span>
            <span>{dayjs(resumen.fecharegistro).format("DD/MM/YYYY HH:mm")}</span>
          </div>

          {editing ? (
            <div className="flex flex-wrap items-center gap-3">
              {nErrores ? (
                <span className="text-xs font-medium text-red-600">
                  {t("docsToFix", { count: nErrores })}
                </span>
              ) : null}
              <SecondaryButton onClick={() => setDraft(null)}>
                {tCommon("actions.cancel")}
              </SecondaryButton>
              <PrincipalButton onClick={handleGuardarClick}>
                {tCommon("actions.saveChanges")}
              </PrincipalButton>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={startEdit}>
                <Pencil className="mr-1 h-4 w-4" />
                {tCommon("actions.edit")}
              </Button>
              <GeneralDropdown items={acciones} align="end">
                <button
                  type="button"
                  aria-label={t("moreActions")}
                  title={t("moreActions")}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-600 transition-colors hover:border-gray-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </GeneralDropdown>
            </div>
          )}
        </div>

        {editing ? (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 rounded-lg bg-[#f4f9d2] px-3.5 py-2 text-xs">
            <Pencil className="h-3.5 w-3.5" />
            <b className="font-semibold">{t("editMode")}</b>
            <span className="text-gray-600">{t("editModeHint")}</span>
          </div>
        ) : null}

        <DevolucionInfoCards
          resumen={resumen}
          editing={editing}
          onChangeCantidadEmbalaje={(cantidadEmbalaje) =>
            setDraft((d) => d && { ...d, resumen: { ...d.resumen, cantidadEmbalaje } })
          }
        />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">{t("observation")}</span>
          {editing ? (
            <Input.TextArea
              rows={2}
              value={resumen.observacion}
              onChange={(e) => {
                const observacion = e.target.value;
                setDraft((d) => d && { ...d, resumen: { ...d.resumen, observacion } });
              }}
            />
          ) : (
            <p className="text-sm text-gray-900">{resumen.observacion || "—"}</p>
          )}
        </div>

        {editing ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-900">
                {t("customerDocuments")}{" "}
                <span className="font-normal text-gray-500">· {datos.length}</span>
              </span>
              {expandirTodo}
            </div>
            {documentos}
          </>
        ) : (
          <UiTab
            tabs={[
              {
                key: "documentos",
                label: t("tabs.byDocument", { count: datos.length }),
                children: documentos
              },
              {
                key: "productos",
                label: t("tabs.byProduct", { count: codigos.length }),
                children: (
                  <DevolucionProductos
                    datos={datos}
                    search={search}
                    expandedKeys={openProductos}
                    onChangeExpandedKeys={setOpenProductos}
                  />
                )
              },
              // El backend todavía no devuelve el historial de cambios.
              { key: "historial", label: t("tabs.history"), children: null, disabled: true }
            ]}
            activeKey={tab}
            onChangeTab={(key) => setTab(key as DetalleTab)}
            tabBarExtraContent={
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  {t.rich("tabTotals", {
                    units: fmtNumber(totalUnidades),
                    amount: fmtCop(totalValor),
                    b: (chunks) => <b className="font-semibold text-gray-900">{chunks}</b>
                  })}
                </span>
                {expandirTodo}
              </div>
            }
          />
        )}

        <div className="border-t border-gray-100 pt-3 text-xs text-gray-500">
          {t("total", { units: fmtNumber(totalUnidades), amount: fmtCop(totalValor) })}
        </div>
      </div>

      <ModalConfirmAction
        isOpen={modal === "reenviar"}
        onClose={() => setModal(null)}
        onOk={handleReenviar}
        okLoading={reenviando}
        title={t("resendModal.title")}
        content={
          resumen.email
            ? t("resendModal.contentEmail", { id: resumen.idboleto, email: resumen.email })
            : t("resendModal.contentCustomer", { id: resumen.idboleto })
        }
        okText={t("resendModal.ok")}
      />
      <ModalMotivoDevolucion
        open={modal === "anular"}
        title={t("voidModal.title")}
        description={t("voidModal.description", { id: resumen.idboleto })}
        label={t("voidModal.label")}
        placeholder={t("voidModal.placeholder")}
        okText={t("voidModal.ok")}
        danger
        onClose={() => setModal(null)}
        onConfirm={handleAnular}
      />
      <ModalMotivoDevolucion
        open={modal === "guardar"}
        title={t("saveModal.title")}
        description={
          cambios ? (
            <div className="flex flex-col gap-1 rounded-lg bg-gray-50 p-3 text-xs">
              <span className="font-semibold text-gray-900">
                {t("saveModal.summary", {
                  id: resumen.idboleto,
                  count: cambios.resumen.length
                })}
              </span>
              {cambios.resumen.map((c, i) => (
                <span key={`${i}-${c}`}>· {c}</span>
              ))}
            </div>
          ) : null
        }
        label={t("saveModal.label")}
        placeholder={t("saveModal.placeholder")}
        okText={t("saveModal.ok")}
        onClose={() => setModal(null)}
        onConfirm={handleGuardar}
      />
    </div>
  );
}
