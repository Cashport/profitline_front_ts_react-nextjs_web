"use client";
import { useContext, useEffect, useState } from "react";
import { Modal, Typography, Spin } from "antd";
import { ArrowLeft, Gift } from "@phosphor-icons/react";

import { IBonus, IGiftOption } from "@/types/commerce/ICommerce";
import { IPromotion } from "@/services/promotion/promotion";
import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";

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
  const otherBonificated = confirmOrderData?.other_bonificated_products ?? [];

  const tabOptions = giftOptions;

  const flexPromotion = promotions.find((p) => p.isFlex);
  const nonFlexPromotions = promotions.filter((p) => !p.isFlex);

  type Segment = "flex" | "promos" | "otros";

  const [activeSegment, setActiveSegment] = useState<Segment>("flex");
  // sub-view of the Promos Junio tab: the non-flex list vs. a selected promo's detail
  const [promosScreen, setPromosScreen] = useState<"list" | "detail">("list");
  const [activeTab, setActiveTab] = useState(0);
  const [poolQty, setPoolQty] = useState<Record<number, Record<number, number>>>({});
  const [otherQty, setOtherQty] = useState<Record<number, number>>(() =>
    Object.fromEntries(otherBonificated.map((p) => [p.product_id, p.qty]))
  );

  useEffect(() => {
    if (!isOpen) return;
    if (flexPromotion) {
      setActiveSegment("flex");
      onSelectPromotion(flexPromotion.id);
    } else if (nonFlexPromotions.length > 0) {
      setActiveSegment("promos");
      setPromosScreen("list");
    } else {
      setActiveSegment("otros");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const getPoolGroupTotal = (groupId: number) => {
    const group = poolQty[groupId] ?? {};
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

  const updateOther = (productId: number, delta: number, max: number) => {
    setOtherQty((prev) => {
      const current = prev[productId] ?? 0;
      const next = Math.max(0, current + delta);
      if (delta > 0 && next > max) return prev;
      return { ...prev, [productId]: next };
    });
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

    const otherTotal = Object.values(otherQty).reduce((s, v) => s + v, 0);

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

    const otherBonificatedPayload = otherBonificated
      .map(({ image: _img, max_selection_qty: _max, ...rest }) => ({
        ...rest,
        qty: otherQty[rest.product_id] ?? 0
      }))
      .filter((item) => item.qty > 0);

    if (promotion || otherBonificatedPayload.length > 0) {
      const bonusState: IBonus = {
        id: promotion?.promotion_id,
        bonusOptions,
        otherBonificated: otherBonificatedPayload
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
      return (
        <p style={{ color: "#999", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>
          No hay bonificados disponibles
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
                              const qty =
                                poolQty[group.gift_item_group_id]?.[item.product_id] ?? 0;
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
                                      <span className={styles.counterVal}>{qty}</span>
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
                              className={
                                idx < group.items.length - 1 ? styles.rowBorderGreen : ""
                              }
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

  const renderOtros = () => (
            <div className={styles.section}>
              <p className={styles.sectionLabel}>Otros bonificados</p>
              <div className={styles.genericTable}>
                <table className={styles.table}>
                  <tbody>
                    {otherBonificated.map((item, idx, arr) => {
                      const qty = otherQty[item.product_id] ?? 0;
                      return (
                        <tr
                          key={item.product_id}
                          className={idx < arr.length - 1 ? styles.rowBorder : ""}
                        >
                          <td className={styles.cellName}>
                            {item.description}
                            <span className={styles.saldoHint}>
                              ({qty}/{item.max_selection_qty})
                            </span>
                          </td>
                          <td className={styles.cellControl}>
                            <div className={styles.counter}>
                              <button
                                onClick={() =>
                                  updateOther(item.product_id, -1, item.max_selection_qty)
                                }
                                disabled={qty <= 0}
                                className={styles.counterBtn}
                              >
                                -
                              </button>
                              <span className={styles.counterVal}>{qty}</span>
                              <button
                                onClick={() =>
                                  updateOther(item.product_id, 1, item.max_selection_qty)
                                }
                                disabled={qty >= item.max_selection_qty}
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
                Promos Junio
              </button>
            )}
          </div>
          {otherBonificated.length > 0 && (
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
