"use client";
import { useContext, useEffect, useState } from "react";
import { Modal, Typography, Spin } from "antd";
import { ArrowLeft, Gift } from "@phosphor-icons/react";

import { IBonus, IGiftOption, IOtherBonusGroup } from "@/types/commerce/ICommerce";
import { IPromotion } from "@/services/promotion/promotion";
import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";
import { SPANISH_MONTHS } from "@/modules/dataQuality/utils/months";

import styles from "./modal-bonus.module.scss";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  promotions: IPromotion[];
  selectedPromotionId: number | null;
  onSelectPromotion: (id: number) => void;
  loading: boolean;
}

const ModalBonus = ({
  isOpen,
  onClose,
  promotions,
  selectedPromotionId,
  onSelectPromotion,
  loading
}: Props) => {
  const { confirmOrderData, setBonus } = useContext(OrderViewContext);

  const promotion = confirmOrderData?.promotion;
  const giftOptions: IGiftOption[] = promotion?.active_range?.gift_options ?? [];
  const otherGroups: IOtherBonusGroup[] = confirmOrderData?.other_bonificated_products ?? [];

  // Stable key over the set of Otros products so cart refetches don't wipe input
  const otherKey = otherGroups
    .flatMap((g) => g.items.flatMap((s) => s.items.map((p) => `${g.group_id}:${p.product_id}`)))
    .join(",");

  const tabOptions = giftOptions;

  const flexPromotion = promotions.find((p) => p.isFlex);
  const nonFlexPromotions = promotions.filter((p) => !p.isFlex);

  const currentMonthName = SPANISH_MONTHS[new Date().getMonth()];

  type Segment = "flex" | "promos" | "otros";

  const [activeSegment, setActiveSegment] = useState<Segment>("flex");
  // sub-view of the Promos tab: the non-flex list vs. a selected promo's detail
  const [promosScreen, setPromosScreen] = useState<"list" | "detail">("list");
  const [activeTab, setActiveTab] = useState(0);
  const [poolQty, setPoolQty] = useState<Record<number, Record<number, number>>>({});
  // Otros: misma forma que los bonificados comunes — un mapa por subgrupo
  // (identificado por su `group_item_id` único), con la cantidad por producto.
  const [otherPoolQty, setOtherPoolQty] = useState<
    Record<number /* group_item_id */, Record<number /* product_id */, number>>
  >({});

  useEffect(() => {
    if (!isOpen) return;
    const selected = promotions.find((p) => p.id === selectedPromotionId);
    setActiveTab(0);
    if (selected?.isFlex) {
      setActiveSegment("flex");
    } else if (selected && !selected.isFlex) {
      setActiveSegment("promos");
      setPromosScreen("detail");
    } else if (flexPromotion) {
      setActiveSegment("flex");
      onSelectPromotion(flexPromotion.id);
    } else if (nonFlexPromotions.length > 0) {
      setActiveSegment("promos");
      setPromosScreen("list");
    } else {
      setActiveSegment("otros");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedPromotionId]);

  // re-seed Otros quantities only when the set of Otros products actually changes
  // (client/promotion switch) — keyed on otherKey, not the array reference, so the
  // frequent cart refetch (which hands back a new array each time) doesn't wipe
  // the user's in-progress input back to the seed value.
  //
  // Los "fixed" arrancan con el `qty` que manda el backend (puede ser 0), los
  // "pool" arrancan en 0. En ambos casos el usuario puede mover la cantidad
  // entre 0 y `max_selection_qty`.
  useEffect(() => {
    const seed: Record<number, Record<number, number>> = {};
    otherGroups.forEach((g) =>
      g.items.forEach((sub) => {
        seed[sub.group_item_id] = Object.fromEntries(
          sub.items.map((p) => [p.product_id, p.qty ?? 0])
        );
      })
    );
    setOtherPoolQty(seed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otherKey]);

  const getPoolGroupTotal = (groupId: number) => {
    const group = poolQty[groupId] ?? {};
    return Object.values(group).reduce((s, v) => s + v, 0);
  };

  const getOtherPoolGroupTotal = (groupItemId: number) => {
    const group = otherPoolQty[groupItemId] ?? {};
    return Object.values(group).reduce((s, v) => s + v, 0);
  };

  const updatePool = (groupId: number, productId: number, delta: number, max: number) => {
    setPoolQty((prev) => {
      const group = prev[groupId] ?? {};
      const current = group[productId] ?? 0;
      const groupTotal = Object.values(group).reduce((s, v) => s + v, 0);
      const next = Math.max(0, current + delta);
      if (delta > 0 && groupTotal >= max) return prev;
      return { ...prev, [groupId]: { ...group, [productId]: next } };
    });
  };

  // pool: set an absolute value, clamping so the group total never exceeds max
  const setPoolValue = (groupId: number, productId: number, value: number, max: number) => {
    setPoolQty((prev) => {
      const group = prev[groupId] ?? {};
      const current = group[productId] ?? 0;
      const othersTotal = Object.values(group).reduce((s, v) => s + v, 0) - current;
      const clamped = Math.max(0, Math.min(value, max - othersTotal));
      return { ...prev, [groupId]: { ...group, [productId]: clamped } };
    });
  };

  // Otros pool: análogo a `updatePool`/`setPoolValue` pero indexado por
  // `group_item_id` del subgrupo de Otros. La suma de las cantidades de los
  // productos del subgrupo nunca puede superar `max_selection_qty`.
  const updateOtherPool = (
    groupItemId: number,
    productId: number,
    delta: number,
    max: number
  ) => {
    setOtherPoolQty((prev) => {
      const group = prev[groupItemId] ?? {};
      const current = group[productId] ?? 0;
      const groupTotal = Object.values(group).reduce((s, v) => s + v, 0);
      const next = Math.max(0, current + delta);
      if (delta > 0 && groupTotal >= max) return prev;
      return { ...prev, [groupItemId]: { ...group, [productId]: next } };
    });
  };

  const setOtherPoolValue = (
    groupItemId: number,
    productId: number,
    value: number,
    max: number
  ) => {
    setOtherPoolQty((prev) => {
      const group = prev[groupItemId] ?? {};
      const current = group[productId] ?? 0;
      const othersTotal = Object.values(group).reduce((s, v) => s + v, 0) - current;
      const clamped = Math.max(0, Math.min(value, max - othersTotal));
      return { ...prev, [groupItemId]: { ...group, [productId]: clamped } };
    });
  };

  // turn raw input text into a non-negative integer
  const parseQtyInput = (raw: string) => {
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? 0 : Math.max(0, n);
  };

  const totalBonificados = () => {
    const activeItems = tabOptions[activeTab]?.items ?? [];

    const poolTotal = activeItems
      .filter((g) => !g.fixed)
      .reduce((s, g) => s + getPoolGroupTotal(g.gift_item_group_id), 0);

    const fixedTotal = activeItems
      .filter((g) => g.fixed)
      .flatMap((g) => g.items)
      .reduce((s, it) => s + (it.qty ?? 0), 0);

    // Otros: contar solo lo del pedido actual. Tanto los subgrupos pool como los
    // fijos se rigen ahora por el state del usuario (los fijos pueden ajustarse
    // entre 0 y max_selection_qty), por lo que siempre usamos
    // `getOtherPoolGroupTotal`.
    const otherTotal = otherGroups.reduce(
      (sum, group) =>
        sum + group.items.reduce((s2, sub) => s2 + getOtherPoolGroupTotal(sub.group_item_id), 0),
      0
    );

    return poolTotal + fixedTotal + otherTotal;
  };

  const handleConfirm = () => {
    const activeOption = tabOptions[activeTab];

    const bonusOptions =
      promotion && activeOption
        ? [
            {
              cards: activeOption.items
                .map((group) => ({
                  fixed: group.fixed,
                  items: group.items
                    .map(({ image: _img, ...rest }) => ({
                      ...rest,
                      qty: group.fixed
                        ? rest.qty
                        : poolQty[group.gift_item_group_id]?.[rest.product_id] ?? 0
                    }))
                    .filter((item) => item.qty > 0)
                }))
                .filter((card) => card.items.length > 0)
            }
          ]
        : [];

    // Otros: misma forma que `bonusOptions`, descartando cards vacías
    // y grupos sin cards. Tanto los pool como los fijos leen la cantidad del
    // state del usuario, que se inicializa con el `qty` del backend (los fijos
    // pueden bajarse a 0 o subirse hasta max_selection_qty).
    const otherBonificated = otherGroups
      .map((group) => ({
        group_id: group.group_id,
        description: group.description,
        assigned_qty: group.assigned_qty,
        available_qty: group.available_qty,
        expiration_date: group.expiration_date,
        cards: group.items
          .map((sub) => ({
            fixed: sub.fixed,
            subgroup_number: sub.subgroup_number,
            max_selection_qty: sub.max_selection_qty,
            items: sub.items
              .map(({ image: _img, ...rest }) => ({
                ...rest,
                qty: otherPoolQty[sub.group_item_id]?.[rest.product_id] ?? 0
              }))
              .filter((item) => item.qty > 0)
          }))
          .filter((card) => card.items.length > 0)
      }))
      .filter((group) => group.cards.length > 0);

    if (promotion || otherBonificated.length > 0) {
      const bonusState: IBonus = {
        id: promotion?.promotion_id,
        bonusOptions,
        otherBonificated
      };
      setBonus(bonusState);
    }
    onClose();
  };

  const handleSelectPromotion = (id: number) => {
    onSelectPromotion(id);
    setActiveTab(0);
    setPromosScreen("detail");
  };

  const renderPromosList = () => (
    <div className={styles.selectContent}>
      <p className={styles.selectLabel}>Elige la promoción a aplicar</p>
      <div className={styles.promotionsList}>
        {nonFlexPromotions.map((promo) => {
          const isActive = selectedPromotionId === promo.id;
          return (
            <button
              key={promo.id}
              onClick={() => handleSelectPromotion(promo.id)}
              className={isActive ? styles.promotionCardActive : styles.promotionCard}
            >
              <div className={styles.promotionCardLeft}>
                <Gift size={16} weight={isActive ? "fill" : "regular"} />
                <span>{promo.name}</span>
              </div>
              {isActive && <span className={styles.promotionCheck}>✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderPromotionGifts = () => {
    if (loading) {
      return (
        <div style={{ display: "flex", justifyContent: "center", padding: "2rem 0" }}>
          <Spin />
        </div>
      );
    }
    if (!promotion || tabOptions.length === 0) {
      const progressMessage = promotion?.ranges?.[0]?.progress_message;
      return (
        <p style={{ color: "#999", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>
          {progressMessage || "No hay bonificados disponibles"}
        </p>
      );
    }
    return (
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Bonificados promoción</p>

        {tabOptions.length > 1 && (
          <div className={styles.tabRow}>
            {tabOptions.map((opt, idx) => (
              <button
                key={opt.gift_group_id}
                onClick={() => setActiveTab(idx)}
                className={activeTab === idx ? styles.tabActive : styles.tab}
              >
                Opción {opt.option_number}
              </button>
            ))}
          </div>
        )}

        <div className={styles.grupos}>
          {tabOptions[activeTab]?.items
            .filter((g) => !g.fixed)
            .map((group) => {
              const groupTotal = getPoolGroupTotal(group.gift_item_group_id);
              return (
                <div key={group.gift_item_group_id} className={styles.poolTable}>
                  <div className={styles.poolHeader}>
                    <span>Elige {group.max_selection_qty} und.</span>
                    <span className={styles.poolCount}>
                      {groupTotal}/{group.max_selection_qty}
                    </span>
                  </div>
                  <table className={styles.table}>
                    <tbody>
                      {group.items.map((item, idx) => {
                        const qty = poolQty[group.gift_item_group_id]?.[item.product_id] ?? 0;
                        return (
                          <tr
                            key={item.product_id}
                            className={idx < group.items.length - 1 ? styles.rowBorder : ""}
                          >
                            <td className={styles.cellName}>{item.description}</td>
                            <td className={styles.cellControl}>
                              <div className={styles.counter}>
                                <button
                                  onClick={() =>
                                    updatePool(
                                      group.gift_item_group_id,
                                      item.product_id,
                                      -1,
                                      group.max_selection_qty
                                    )
                                  }
                                  disabled={qty <= 0}
                                  className={styles.counterBtn}
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min={0}
                                  value={qty}
                                  className={styles.counterInput}
                                  onChange={(e) =>
                                    setPoolValue(
                                      group.gift_item_group_id,
                                      item.product_id,
                                      parseQtyInput(e.target.value),
                                      group.max_selection_qty
                                    )
                                  }
                                  onKeyDown={(e) => {
                                    if (["e", "E", "+", "-", ".", ","].includes(e.key))
                                      e.preventDefault();
                                  }}
                                />
                                <button
                                  onClick={() =>
                                    updatePool(
                                      group.gift_item_group_id,
                                      item.product_id,
                                      1,
                                      group.max_selection_qty
                                    )
                                  }
                                  disabled={groupTotal >= group.max_selection_qty}
                                  className={styles.counterBtn}
                                >
                                  +
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              );
            })}

          {tabOptions[activeTab]?.items
            .filter((g) => g.fixed)
            .map((group) => (
              <div key={group.gift_item_group_id} className={styles.fixedTable}>
                <div className={styles.fixedHeader}>
                  <span>Incluido</span>
                </div>
                <table className={styles.table}>
                  <tbody>
                    {group.items.map((item, idx) => (
                      <tr
                        key={item.product_id}
                        className={idx < group.items.length - 1 ? styles.rowBorderGreen : ""}
                      >
                        <td className={styles.cellName}>{item.description}</td>
                        <td className={styles.cellBadge}>
                          <span className={styles.fixedBadge}>{item.qty}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
    );
  };

  // Renderiza un subgrupo "pool" de Otros (misma UI/reglas que los bonificados
  // comunes en pool: suma de cantidades por producto <= max_selection_qty).
  const renderOtherPoolSubgroup = (
    group: IOtherBonusGroup,
    subgroup: IOtherBonusGroup["items"][number]
  ) => {
    const groupTotal = getOtherPoolGroupTotal(subgroup.group_item_id);
    return (
      <div key={subgroup.group_item_id} className={styles.poolTable}>
        <div className={styles.poolHeader}>
          <span>Elige {subgroup.max_selection_qty} und.</span>
          <span className={styles.poolCount}>
            {groupTotal}/{subgroup.max_selection_qty}
          </span>
        </div>
        <table className={styles.table}>
          <tbody>
            {subgroup.items.map((item, idx) => {
              const qty = otherPoolQty[subgroup.group_item_id]?.[item.product_id] ?? 0;
              return (
                <tr
                  key={item.product_id}
                  className={idx < subgroup.items.length - 1 ? styles.rowBorder : ""}
                >
                  <td className={styles.cellName}>{item.description}</td>
                  <td className={styles.cellControl}>
                    <div className={styles.counter}>
                      <button
                        onClick={() =>
                          updateOtherPool(
                            subgroup.group_item_id,
                            item.product_id,
                            -1,
                            subgroup.max_selection_qty
                          )
                        }
                        disabled={qty <= 0}
                        className={styles.counterBtn}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={qty}
                        className={styles.counterInput}
                        onChange={(e) =>
                          setOtherPoolValue(
                            subgroup.group_item_id,
                            item.product_id,
                            parseQtyInput(e.target.value),
                            subgroup.max_selection_qty
                          )
                        }
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
                        }}
                      />
                      <button
                        onClick={() =>
                          updateOtherPool(
                            subgroup.group_item_id,
                            item.product_id,
                            1,
                            subgroup.max_selection_qty
                          )
                        }
                        disabled={groupTotal >= subgroup.max_selection_qty}
                        className={styles.counterBtn}
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  // Renderiza un subgrupo "fijo" de Otros. Conserva la UI visual de los
  // bonificados comunes en fijo (cuadro verde + header "Incluido"), pero el
  // item es ajustable: arranca con el `qty` que manda el backend y se puede
  // mover entre 0 y `max_selection_qty` con la misma regla de suma del pool.
  const renderOtherFixedSubgroup = (
    subgroup: IOtherBonusGroup["items"][number]
  ) => {
    const groupTotal = getOtherPoolGroupTotal(subgroup.group_item_id);
    return (
      <div key={subgroup.group_item_id} className={styles.fixedTable}>
        <div className={styles.fixedHeader}>
          <span>Incluido</span>
          <span className={styles.poolCount}>
            {groupTotal}/{subgroup.max_selection_qty}
          </span>
        </div>
        <table className={styles.table}>
          <tbody>
            {subgroup.items.map((item, idx) => {
              const qty =
                otherPoolQty[subgroup.group_item_id]?.[item.product_id] ?? item.qty ?? 0;
              return (
                <tr
                  key={item.product_id}
                  className={idx < subgroup.items.length - 1 ? styles.rowBorderGreen : ""}
                >
                  <td className={styles.cellName}>{item.description}</td>
                  <td className={styles.cellControl}>
                    <div className={styles.counter}>
                      <button
                        onClick={() =>
                          updateOtherPool(
                            subgroup.group_item_id,
                            item.product_id,
                            -1,
                            subgroup.max_selection_qty
                          )
                        }
                        disabled={qty <= 0}
                        className={styles.counterBtn}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        value={qty}
                        className={styles.counterInput}
                        onChange={(e) =>
                          setOtherPoolValue(
                            subgroup.group_item_id,
                            item.product_id,
                            parseQtyInput(e.target.value),
                            subgroup.max_selection_qty
                          )
                        }
                        onKeyDown={(e) => {
                          if (["e", "E", "+", "-", ".", ","].includes(e.key)) e.preventDefault();
                        }}
                      />
                      <button
                        onClick={() =>
                          updateOtherPool(
                            subgroup.group_item_id,
                            item.product_id,
                            1,
                            subgroup.max_selection_qty
                          )
                        }
                        disabled={groupTotal >= subgroup.max_selection_qty}
                        className={styles.counterBtn}
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderOtros = () => (
    <div className={styles.section}>
      <p className={styles.sectionLabel}>Otros bonificados</p>
      <div className={styles.otrosGroups}>
        {otherGroups.map((group) => (
          <div key={group.group_id} className={styles.otrosGroup}>
            <div className={styles.otrosGroupHeader}>
              <span className={styles.otrosGroupTitle}>{group.description}</span>
              <span className={styles.saldoHint}>
                Disp. {group.available_qty}/{group.assigned_qty}
              </span>
            </div>
            <div className={styles.grupos}>
              {group.items
                .filter((sub) => !sub.fixed)
                .map((sub) => renderOtherPoolSubgroup(group, sub))}
              {group.items
                .filter((sub) => sub.fixed)
                .map((sub) => renderOtherFixedSubgroup(sub))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBody = () => {
    if (activeSegment === "otros") return renderOtros();
    if (activeSegment === "promos" && promosScreen === "list") return renderPromosList();
    return renderPromotionGifts();
  };

  return (
    <Modal
      className="modalBonus"
      width={448}
      open={isOpen}
      onCancel={onClose}
      footer={null}
      title={
        <div className={styles.titleRow}>
          {activeSegment === "promos" && promosScreen === "detail" && (
            <button
              onClick={() => setPromosScreen("list")}
              className={styles.backButton}
              aria-label="Volver a la lista de promociones"
            >
              <ArrowLeft size={16} weight="bold" />
            </button>
          )}
          <Title level={4} style={{ margin: 0 }}>
            Bonificados
          </Title>
        </div>
      }
      destroyOnClose
    >
      <div className={styles.content}>
        <div className={styles.segmentHeader}>
          <div className={styles.segmentGroup}>
            {flexPromotion && (
              <button
                onClick={() => {
                  setActiveSegment("flex");
                  onSelectPromotion(flexPromotion.id);
                }}
                className={activeSegment === "flex" ? styles.segmentActive : styles.segment}
              >
                Flex
              </button>
            )}
            {nonFlexPromotions.length > 0 && (
              <button
                onClick={() => {
                  setActiveSegment("promos");
                  setPromosScreen("list");
                }}
                className={activeSegment === "promos" ? styles.segmentActive : styles.segment}
              >
                Promos {currentMonthName}
              </button>
            )}
          </div>
          {otherGroups.length > 0 && (
            <>
              <span className={styles.segmentDivider} />
              <button
                onClick={() => setActiveSegment("otros")}
                className={activeSegment === "otros" ? styles.otrosBtnActive : styles.otrosBtn}
              >
                Otros
              </button>
            </>
          )}
        </div>

        {renderBody()}

        <div className={styles.footer}>
          <p className={styles.footerTotal}>
            Total: <strong>{loading ? "—" : totalBonificados()}</strong>
          </p>
          <button onClick={handleConfirm} className={styles.confirmBtn}>
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalBonus;
