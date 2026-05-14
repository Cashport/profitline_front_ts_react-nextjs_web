"use client";
import { useState } from "react";
import { Modal, Typography } from "antd";

import { IPromotion } from "@/services/promotion/promotion";

import styles from "./modal-bonus.module.scss";

const { Title } = Typography;

interface ProductoPromocion {
  id: string;
  nombre: string;
}

interface GrupoProductos {
  id: string;
  modo: "pool" | "fijo";
  unidadesPool?: number;
  productos: ProductoPromocion[];
  cantidadesFijas?: Record<string, number>;
}

interface OpcionPromocion {
  id: string;
  label: string;
  grupos: GrupoProductos[];
}

interface PromocionDisponible {
  id: string;
  nombre: string;
  opciones: OpcionPromocion[];
}

interface BonificadoGenerico {
  id: string;
  nombre: string;
  saldoDisponible: number;
  saldoTotal: number;
}

const MOCK_PROMOCIONES: PromocionDisponible[] = [
  {
    id: "promo-1",
    nombre: "Promo Verano",
    opciones: [
      {
        id: "op-1",
        label: "Opción A",
        grupos: [
          {
            id: "grupo-pool-1",
            modo: "pool",
            unidadesPool: 3,
            productos: [
              { id: "p1", nombre: "Producto Pool 1" },
              { id: "p2", nombre: "Producto Pool 2" }
            ]
          }
        ]
      },
      {
        id: "op-2",
        label: "Opción B",
        grupos: [
          {
            id: "grupo-fijo-1",
            modo: "fijo",
            productos: [{ id: "p3", nombre: "Producto Fijo 1" }],
            cantidadesFijas: { p3: 2 }
          }
        ]
      }
    ]
  }
];

const MOCK_GENERICOS: BonificadoGenerico[] = [
  { id: "gen-1", nombre: "Bonificado Genérico 1", saldoDisponible: 5, saldoTotal: 10 }
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  promotions: IPromotion[];
}

const ModalBonus = ({ isOpen, onClose, promotions: _promotions }: Props) => {
  const [seleccionPromo, setSeleccionPromo] = useState<Record<string, string>>({});
  const [seleccionPool, setSeleccionPool] = useState<Record<string, Record<string, number>>>({});
  const [seleccionGenericos, setSeleccionGenericos] = useState<Record<string, number>>({});

  const updatePoolCantidad = (grupoId: string, productoId: string, delta: number, maxPool: number) => {
    setSeleccionPool((prev) => {
      const grupo = prev[grupoId] ?? {};
      const actual = grupo[productoId] ?? 0;
      const totalGrupo = Object.values(grupo).reduce((s, v) => s + v, 0);
      const nuevo = Math.max(0, actual + delta);
      if (delta > 0 && totalGrupo >= maxPool) return prev;
      return { ...prev, [grupoId]: { ...grupo, [productoId]: nuevo } };
    });
  };

  const getPoolTotal = (grupoId: string) => {
    const grupo = seleccionPool[grupoId] ?? {};
    return Object.values(grupo).reduce((s, v) => s + v, 0);
  };

  const updateGenerico = (id: string, delta: number, max: number) => {
    setSeleccionGenericos((prev) => {
      const actual = prev[id] ?? 0;
      const nuevo = Math.max(0, Math.min(max, actual + delta));
      return { ...prev, [id]: nuevo };
    });
  };

  const totalBonificados = () => {
    let total = 0;
    MOCK_PROMOCIONES.forEach((promo) => {
      const opcionId = seleccionPromo[promo.id] ?? promo.opciones[0]?.id;
      const opcion = promo.opciones.find((o) => o.id === opcionId);
      if (opcion) {
        opcion.grupos.forEach((g) => {
          if (g.modo === "fijo") {
            total += Object.values(g.cantidadesFijas ?? {}).reduce((s, v) => s + v, 0);
          } else {
            total += getPoolTotal(g.id);
          }
        });
      }
    });
    total += Object.values(seleccionGenericos).reduce((s, v) => s + v, 0);
    return total;
  };

  return (
    <Modal
      className="modalBonus"
      width={448}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={<Title level={4}>Bonificados</Title>}
      destroyOnClose
    >
      <div className={styles.content}>
        {MOCK_PROMOCIONES.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Bonificados promoción</p>
            {MOCK_PROMOCIONES.map((promo) => {
              const opcionSeleccionada = seleccionPromo[promo.id] ?? promo.opciones[0]?.id;
              const opcionActual = promo.opciones.find((o) => o.id === opcionSeleccionada);

              return (
                <div key={promo.id}>
                  {promo.opciones.length > 1 && (
                    <div className={styles.tabRow}>
                      {promo.opciones.map((op) => (
                        <button
                          key={op.id}
                          onClick={() => setSeleccionPromo((prev) => ({ ...prev, [promo.id]: op.id }))}
                          className={opcionSeleccionada === op.id ? styles.tabActive : styles.tab}
                        >
                          {op.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {opcionActual && (
                    <div className={styles.grupos}>
                      {opcionActual.grupos.map((grupo) => (
                        <div key={grupo.id}>
                          {grupo.modo === "pool" ? (
                            <div className={styles.poolTable}>
                              <div className={styles.poolHeader}>
                                <span>Elige {grupo.unidadesPool} und.</span>
                                <span className={styles.poolCount}>
                                  {getPoolTotal(grupo.id)}/{grupo.unidadesPool}
                                </span>
                              </div>
                              <table className={styles.table}>
                                <tbody>
                                  {grupo.productos.map((pp, idx) => {
                                    const cantidad = seleccionPool[grupo.id]?.[pp.id] ?? 0;
                                    return (
                                      <tr key={pp.id} className={idx < grupo.productos.length - 1 ? styles.rowBorder : ""}>
                                        <td className={styles.cellName}>{pp.nombre}</td>
                                        <td className={styles.cellControl}>
                                          <div className={styles.counter}>
                                            <button
                                              onClick={() => updatePoolCantidad(grupo.id, pp.id, -1, grupo.unidadesPool!)}
                                              disabled={cantidad <= 0}
                                              className={styles.counterBtn}
                                            >-</button>
                                            <span className={styles.counterVal}>{cantidad}</span>
                                            <button
                                              onClick={() => updatePoolCantidad(grupo.id, pp.id, 1, grupo.unidadesPool!)}
                                              disabled={getPoolTotal(grupo.id) >= grupo.unidadesPool!}
                                              className={styles.counterBtn}
                                            >+</button>
                                          </div>
                                        </td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className={styles.fixedTable}>
                              <div className={styles.fixedHeader}>
                                <span>Incluidos:</span>
                              </div>
                              <table className={styles.table}>
                                <tbody>
                                  {grupo.productos.map((pp, idx) => (
                                    <tr key={pp.id} className={idx < grupo.productos.length - 1 ? styles.rowBorderGreen : ""}>
                                      <td className={styles.cellName}>{pp.nombre}</td>
                                      <td className={styles.cellBadge}>
                                        <span className={styles.fixedBadge}>
                                          {grupo.cantidadesFijas?.[pp.id] ?? 1}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {MOCK_GENERICOS.length > 0 && (
          <div className={styles.section}>
            <p className={styles.sectionLabel}>Otros bonificados</p>
            <div className={styles.genericTable}>
              <table className={styles.table}>
                <tbody>
                  {MOCK_GENERICOS.map((g, idx) => {
                    const cantidad = seleccionGenericos[g.id] ?? 0;
                    return (
                      <tr key={g.id} className={idx < MOCK_GENERICOS.length - 1 ? styles.rowBorder : ""}>
                        <td className={styles.cellName}>
                          {g.nombre}
                          <span className={styles.saldoHint}>
                            ({g.saldoDisponible - cantidad}/{g.saldoTotal})
                          </span>
                        </td>
                        <td className={styles.cellControl}>
                          <div className={styles.counter}>
                            <button
                              onClick={() => updateGenerico(g.id, -1, g.saldoDisponible)}
                              disabled={cantidad <= 0}
                              className={styles.counterBtn}
                            >-</button>
                            <span className={styles.counterVal}>{cantidad}</span>
                            <button
                              onClick={() => updateGenerico(g.id, 1, g.saldoDisponible)}
                              disabled={cantidad >= g.saldoDisponible}
                              className={styles.counterBtn}
                            >+</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <p className={styles.footerTotal}>
            Total: <strong>{totalBonificados()}</strong>
          </p>
          <button onClick={onClose} className={styles.confirmBtn}>
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalBonus;
