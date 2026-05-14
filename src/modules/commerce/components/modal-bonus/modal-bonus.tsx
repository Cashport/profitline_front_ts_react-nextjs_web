"use client";
import { useContext, useState } from "react";
import { Modal, Typography } from "antd";

import { IBonus, IGiftItemGroup, IGiftOption } from "@/types/commerce/ICommerce";
import { IPromotion } from "@/services/promotion/promotion";
import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";

import styles from "./modal-bonus.module.scss";

const { Title } = Typography;

interface Props {
  isOpen: boolean;
  onClose: () => void;
  promotions: IPromotion[];
}

const ModalBonus = ({ isOpen, onClose, promotions: _promotions }: Props) => {
  const { confirmOrderData, setBonus } = useContext(OrderViewContext);

  const promotion = confirmOrderData?.promotion;
  const giftOptions: IGiftOption[] = promotion?.active_range?.gift_options ?? [];

  const tabOptions = giftOptions.filter((o) => o.items.some((g) => !g.fixed));
  const fixedGroups: IGiftItemGroup[] = giftOptions.flatMap((o) =>
    o.items.filter((g) => g.fixed)
  );

  const [activeTab, setActiveTab] = useState(0);
  const [poolQty, setPoolQty] = useState<Record<number, Record<number, number>>>({});
  const [fixedQty, setFixedQty] = useState<Record<number, number>>(() =>
    Object.fromEntries(fixedGroups.map((g) => [g.gift_item_group_id, g.max_selection_qty]))
  );

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

  const updateFixed = (groupId: number, delta: number, max: number) => {
    setFixedQty((prev) => {
      const current = prev[groupId] ?? max;
      return { ...prev, [groupId]: Math.max(0, Math.min(max, current + delta)) };
    });
  };

  const totalBonificados = () => {
    const poolTotal = Object.values(poolQty).flatMap(Object.values).reduce((s, v) => s + v, 0);
    const fixedTotal = fixedGroups.reduce(
      (s, g) => s + (fixedQty[g.gift_item_group_id] ?? g.max_selection_qty),
      0
    );
    return poolTotal + fixedTotal;
  };

  const handleConfirm = () => {
    if (promotion) {
      const bonusState: IBonus = {
        id: promotion.promotion_id,
        bonusOptions: giftOptions.map((opt) => ({
          cards: opt.items.map((group) => ({
            fixed: group.fixed,
            items: group.items.map(({ image: _img, ...rest }) => ({
              ...rest,
              qty: group.fixed
                ? (fixedQty[group.gift_item_group_id] ?? group.max_selection_qty)
                : (poolQty[group.gift_item_group_id]?.[rest.product_id] ?? 0)
            }))
          }))
        }))
      };
      setBonus(bonusState);
    }
    onClose();
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
        {!promotion ? (
          <p style={{ color: "#999", fontSize: 13, textAlign: "center", padding: "1rem 0" }}>
            No hay bonificados disponibles
          </p>
        ) : (
          <>
            {tabOptions.length > 0 && (
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
                </div>
              </div>
            )}

            {fixedGroups.length > 0 && (
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Otros bonificados</p>
                <div className={styles.genericTable}>
                  <table className={styles.table}>
                    <tbody>
                      {fixedGroups.map((group, gIdx) => {
                        const item = group.items[0];
                        if (!item) return null;
                        const qty = fixedQty[group.gift_item_group_id] ?? group.max_selection_qty;
                        return (
                          <tr
                            key={group.gift_item_group_id}
                            className={gIdx < fixedGroups.length - 1 ? styles.rowBorder : ""}
                          >
                            <td className={styles.cellName}>
                              {item.description}
                              <span className={styles.saldoHint}>
                                ({qty}/{group.max_selection_qty})
                              </span>
                            </td>
                            <td className={styles.cellControl}>
                              <div className={styles.counter}>
                                <button
                                  onClick={() =>
                                    updateFixed(
                                      group.gift_item_group_id,
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
                                    updateFixed(
                                      group.gift_item_group_id,
                                      1,
                                      group.max_selection_qty
                                    )
                                  }
                                  disabled={qty >= group.max_selection_qty}
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
            )}
          </>
        )}

        <div className={styles.footer}>
          <p className={styles.footerTotal}>
            Total: <strong>{totalBonificados()}</strong>
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
