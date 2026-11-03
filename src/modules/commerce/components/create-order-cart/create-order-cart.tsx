import { FC, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Flex, Typography } from "antd";
import { Eye, Gift, Sparkle } from "@phosphor-icons/react";
import { AxiosError } from "axios";
import { BagSimple, X } from "phosphor-react";
import { useTranslations } from "use-intl";

import { formatNumber } from "@/utils/utils";
import { GALDERMA_PROJECT_ID } from "@/utils/constants/globalConstants";
import { useAppStore } from "@/lib/store/store";
import useScreenWidth from "@/components/hooks/useScreenWidth";
import { confirmOrder } from "@/services/commerce/commerce";
import { getPromotions, IPromotion } from "@/services/promotion/promotion";

import { OrderViewContext } from "../../contexts/orderViewContext";
import CreateOrderItem from "../create-order-cart-item";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import CreateOrderDiscountsModal from "../create-order-discounts-modal";
import { ModalConfirmAction } from "@/components/molecules/modals/ModalConfirmAction/ModalConfirmAction";
import ModalBonus from "../modal-bonus";
import {
  EVEN_QUANTITY_PRODUCT,
  EVEN_QUANTITY_GROUP_PRODUCTS,
  matchesProductIdentifier,
  CANULA_COMPLEMENT,
  AGUA_COMPLEMENT,
  ProductIdentifier,
  isCanulaProduct
} from "../../utils/constants/evenQuantityProducts";
import { computeComplementRequirements } from "../../utils/complementCalculation";
import { ISelectedCategories } from "../../containers/create-order/create-order";

import { ISelectType } from "@/types/clients/IClients";
import {
  Discount,
  DiscountItem,
  IConfirmOrderData,
  ISelectedProduct
} from "@/types/commerce/ICommerce";

import styles from "./create-order-cart.module.scss";
export interface selectClientForm {
  client: ISelectType;
}

interface CreateOrderCartProps {
  onClose?: () => void;
}

const { Text } = Typography;

const CreateOrderCart: FC<CreateOrderCartProps> = ({ onClose }) => {
  const t = useTranslations("commerce.cart");
  const tSummary = useTranslations("commerce.summary");
  const tCommon = useTranslations("common");
  const { formatMoney, config, projectId } = useAppStore((state) => ({
    formatMoney: state.formatMoney,
    config: state.config,
    projectId: state.selectedProject.ID
  }));
  const width = useScreenWidth();
  const [openDiscountsModal, setOpenDiscountsModal] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState<string | null>(null);
  const [insufficientStockProducts, setInsufficientStockProducts] = useState<string[]>([]);
  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [promotionId, setPromotionId] = useState<number | undefined>(undefined);
  const [isPromotionDetailLoading, setIsPromotionDetailLoading] = useState(false);
  const [appliedDiscounts, setAppliedDiscounts] = useState<any>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCanulasModal, setShowCanulasModal] = useState(false);
  const [showOnlyCanulasOrAguaModal, setShowOnlyCanulasOrAguaModal] = useState(false);
  const [showOddSBVitalModal, setShowOddSBVitalModal] = useState(false);
  const [showOddGroupModal, setShowOddGroupModal] = useState(false);
  const [showComplementMismatchModal, setShowComplementMismatchModal] = useState(false);
  const [complementCatalogMissing, setComplementCatalogMissing] = useState<string | null>(null);

  const rejectedComplementSKUsRef = useRef<Set<string>>(new Set());
  const prevAutoAssignedSKUsRef = useRef<Set<string>>(new Set());

  const {
    selectedCategories,
    setSelectedCategories,
    checkingOut,
    setCheckingOut,
    client,
    confirmOrderData,
    setConfirmOrderData,
    selectedDiscount,
    categories,
    setCategories,
    executiveDiscounts,
    deactivateCrossSelling,
    channelName,
    bonus,
    businessUnit
  } = useContext(OrderViewContext);
  const numberOfSelectedProducts = selectedCategories.reduce(
    (acc, category) => acc + category.products.length,
    0
  );
  const totalProductsQuantity = selectedCategories.reduce(
    (acc, category) => acc + category.products.reduce((sum, product) => sum + product.quantity, 0),
    0
  );

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!client?.id) return;
      try {
        const promotions = await getPromotions(client.nit_id || client.id);
        setPromotions(promotions.promotions);
        if (promotions.promotions[0]) setPromotionId(promotions.promotions[0].id);
      } catch (error) {
        console.error("Error fetching promotions:", error);
      }
    };
    fetchPromotions();
  }, [client?.id]);

  useEffect(() => {
    const activeRange = confirmOrderData?.promotion?.active_range;
    if (!activeRange?.progress_message) return;
    setPromotionMessage(activeRange.progress_message);
    const timer = setTimeout(() => setPromotionMessage(null), 12000);
    return () => clearTimeout(timer);
  }, [confirmOrderData?.promotion?.active_range?.range_id]);

  const handleOpenDiscountsModal = () => {
    setOpenDiscountsModal(true);
  };

  const handleSelectPromotionId = (id: number) => {
    if (id !== promotionId) setIsPromotionDetailLoading(true);
    setPromotionId(id);
  };

  const ESTETICA_MINIMUM = 1600000;
  const ALASTIN_MINIMUM = 1;
  const normalizedChannel = channelName?.trim().toLowerCase();
  const isAlastin = normalizedChannel === "alastin";
  const isEstetica = normalizedChannel === "estetica";

  const minimumOrderAmount = isAlastin ? ALASTIN_MINIMUM : ESTETICA_MINIMUM;
  const isTotalLessThanMinimum = useMemo(
    () => confirmOrderData?.total < minimumOrderAmount,
    [confirmOrderData?.total, minimumOrderAmount]
  );

  const hasNoCanulasOrAgua = useMemo(() => {
    return !selectedCategories.some((category) =>
      category.products.some(
        (product) =>
          product.name?.toLowerCase().includes("canula") ||
          product.name?.toLowerCase().includes("agua")
      )
    );
  }, [selectedCategories]);

  const hasOnlyCanulasOrAgua = useMemo(() => {
    const allProducts = selectedCategories.flatMap((c) => c.products);
    if (allProducts.length === 0) return false;
    return allProducts.every((product) => {
      const name = product.name?.toLowerCase() ?? "";
      return name.includes("canula") || name.includes("agua");
    });
  }, [selectedCategories]);

  const hasOddSBVital = useMemo(() => {
    return selectedCategories.some((category) =>
      category.products.some(
        (p) => matchesProductIdentifier(p, EVEN_QUANTITY_PRODUCT) && p.quantity % 2 !== 0
      )
    );
  }, [selectedCategories]);

  const hasOddRestylaneGroupSum = useMemo(() => {
    const total = selectedCategories.reduce((sum, category) => {
      return (
        sum +
        category.products.reduce((catSum, p) => {
          const inGroup = EVEN_QUANTITY_GROUP_PRODUCTS.some((id) =>
            matchesProductIdentifier(p, id)
          );
          return inGroup ? catSum + p.quantity : catSum;
        }, 0)
      );
    }, 0);
    return total > 0 && total % 2 !== 0;
  }, [selectedCategories]);

  const complementMismatch = useMemo(() => {
    const req = computeComplementRequirements(selectedCategories, client?.id);
    if (!req.hasMainProduct) return null;

    const allProducts = selectedCategories.flatMap((c) => c.products);
    const actualCanulas = allProducts
      .filter(isCanulaProduct)
      .reduce((sum, p) => sum + p.quantity, 0);
    const actualAgua = allProducts
      .filter((p) => matchesProductIdentifier(p, AGUA_COMPLEMENT))
      .reduce((sum, p) => sum + p.quantity, 0);

    if (actualCanulas === req.requiredCanulas && actualAgua === req.requiredAgua) return null;

    return {
      expectedCanulas: req.requiredCanulas,
      expectedAgua: req.requiredAgua,
      actualCanulas,
      actualAgua
    };
  }, [selectedCategories]);

  const handleContinuePurchase = (options?: {
    skipOddSBVital?: boolean;
    skipOddGroup?: boolean;
  }) => {
    if (projectId === GALDERMA_PROJECT_ID && isAlastin) {
      if (isTotalLessThanMinimum) {
        setShowConfirmModal(true);
        return;
      }
      setCheckingOut(true);
      onClose && onClose();
      return;
    }

    if (projectId === GALDERMA_PROJECT_ID && isEstetica) {
      const hasAnnualDiscount = !!selectedDiscount?.idAnnualDiscount;

      if (!hasAnnualDiscount && !options?.skipOddSBVital && hasOddSBVital) {
        setShowOddSBVitalModal(true);
        return;
      }
      if (!hasAnnualDiscount && !options?.skipOddGroup && hasOddRestylaneGroupSum) {
        setShowOddGroupModal(true);
        return;
      }
      if (hasOnlyCanulasOrAgua) {
        setShowOnlyCanulasOrAguaModal(true);
        return;
      }
      if (isTotalLessThanMinimum) {
        setShowConfirmModal(true);
        return;
      }
      if (complementMismatch) {
        setShowComplementMismatchModal(true);
        return;
      }
      if (hasNoCanulasOrAgua) {
        setShowCanulasModal(true);
        return;
      }
      setCheckingOut(true);
      onClose && onClose();
      return;
    }

    // GALDERMA with any other channel, or non-GALDERMA projects: proceed directly.
    setCheckingOut(true);
    if (projectId === GALDERMA_PROJECT_ID) onClose && onClose();
  };

  const handleConfirmCanulas = () => {
    setShowCanulasModal(false);
    setCheckingOut(true);
    onClose && onClose();
  };

  const handleConfirmComplementMismatch = () => {
    setShowComplementMismatchModal(false);
    if (hasNoCanulasOrAgua) {
      setShowCanulasModal(true);
      return;
    }
    setCheckingOut(true);
    onClose && onClose();
  };

  const handleConfirmOddSBVital = () => {
    setShowOddSBVitalModal(false);
    handleContinuePurchase({ skipOddSBVital: true });
  };

  const handleConfirmOddGroup = () => {
    setShowOddGroupModal(false);
    handleContinuePurchase({ skipOddSBVital: true, skipOddGroup: true });
  };

  const handleCloseModal = () => {
    setShowConfirmModal(false);
  };

  const handleCloseCanulasModal = () => {
    setShowCanulasModal(false);
  };

  const handleCloseOnlyCanulasOrAguaModal = () => {
    setShowOnlyCanulasOrAguaModal(false);
  };

  const handleCloseOddSBVitalModal = () => {
    setShowOddSBVitalModal(false);
  };

  const handleCloseOddGroupModal = () => {
    setShowOddGroupModal(false);
  };

  useEffect(() => {
    const fetchTotalValues = async () => {
      if (selectedCategories.length > 0) {
        const products = selectedCategories
          .flatMap((category) => category.products)
          .map((product) => ({
            product_sku: product.SKU,
            quantity: product.quantity,
            // El backend distingue packs de productos regulares para saber
            // si debe desglosar el pack al confirmar la orden.
            is_pack: (product.is_pack ? 1 : 0) as 0 | 1
          }));
        // promotion_applyed se calcula SOLO con los bonificados comunes
        // (bonusOptions). Los "other bonified" (otherBonificated) NO cuentan,
        // porque no pertenecen al rango activo de la promoción.
        const promotionApplyed = (bonus?.bonusOptions ?? []).some((opt) =>
          opt.cards.some((card) => card.items.length > 0)
        );
        const confirmOrderData: IConfirmOrderData = {
          discount_package: selectedDiscount,
          order_summary: products,
          executive_discounts: executiveDiscounts,
          deactivate_cross_selling: !deactivateCrossSelling,
          business_unit: businessUnit,
          ...(promotionId !== undefined && { promotion_id: promotionId }),
          promotion_applyed: promotionApplyed
        };
        try {
          const response = await confirmOrder(projectId, client?.id || "", confirmOrderData);
          if (response.status === 200) {
            setConfirmOrderData(response.data);
            setInsufficientStockProducts(response.data.insufficientStockProducts);
            if (response.data.discounts?.discountItems?.length > 0)
              setAppliedDiscounts(response.data.discounts?.discountItems);
          }
        } catch (error) {
          if (error instanceof AxiosError) {
            console.error("Error confirmando orden", error.message);
          } else {
            console.error("Unexpected error", error);
          }
        } finally {
          setIsPromotionDetailLoading(false);
        }
      }
    };

    const timeOut = setTimeout(() => {
      fetchTotalValues();
    }, 500);
    return () => {
      clearTimeout(timeOut);
    };
  }, [selectedCategories, selectedDiscount, executiveDiscounts, promotionId, bonus]);

  useEffect(() => {
    const newState = selectedCategories.map((category) => ({
      ...category,
      products: category.products.map((product) => ({
        ...product,
        stock: !insufficientStockProducts.includes(product.SKU)
      }))
    }));
    setSelectedCategories(newState);

    const updatedCategories = categories.map((category) => ({
      ...category,
      products: category.products.map((product) => ({
        ...product,
        stock: !insufficientStockProducts.includes(product.SKU)
      }))
    }));
    setCategories(updatedCategories);
  }, [insufficientStockProducts]);

  useEffect(() => {
    if (projectId !== GALDERMA_PROJECT_ID) return;
    if (categories.length === 0) return;

    const req = computeComplementRequirements(selectedCategories, client?.id);

    const currentSKUs = new Set<string>();
    for (const cat of selectedCategories) {
      for (const p of cat.products) {
        if (p.SKU) currentSKUs.add(p.SKU);
      }
    }
    for (const prevSKU of prevAutoAssignedSKUsRef.current) {
      if (!currentSKUs.has(prevSKU)) {
        rejectedComplementSKUsRef.current.add(prevSKU);
      }
    }

    if (!req.hasMainProduct) {
      rejectedComplementSKUsRef.current.clear();
    }

    const findCatalogProduct = (identifier: ProductIdentifier): ISelectedProduct | undefined => {
      for (const cat of categories) {
        const match = cat.products.find((p) => matchesProductIdentifier(p, identifier));
        if (match) return match;
      }
      return undefined;
    };

    const plan: { identifier: ProductIdentifier; requiredQty: number }[] = [
      { identifier: CANULA_COMPLEMENT, requiredQty: req.requiredCanulas },
      { identifier: AGUA_COMPLEMENT, requiredQty: req.requiredAgua }
    ];

    let mutated = false;
    const next: ISelectedCategories[] = selectedCategories.map((c) => ({
      ...c,
      products: [...c.products]
    }));

    for (const { identifier, requiredQty } of plan) {
      const isCanulaPlanItem = identifier === CANULA_COMPLEMENT;
      let catIdx = -1;
      let prodIdx = -1;
      for (let i = 0; i < next.length && prodIdx === -1; i++) {
        const j = next[i].products.findIndex((p) =>
          isCanulaPlanItem ? isCanulaProduct(p) : matchesProductIdentifier(p, identifier)
        );
        if (j !== -1) {
          catIdx = i;
          prodIdx = j;
        }
      }
      const existing = catIdx !== -1 ? next[catIdx].products[prodIdx] : undefined;

      if (!req.hasMainProduct) {
        if (existing && existing.autoAssigned === true) {
          next[catIdx].products.splice(prodIdx, 1);
          if (next[catIdx].products.length === 0) next.splice(catIdx, 1);
          mutated = true;
        }
        continue;
      }

      if (requiredQty === 0) {
        if (existing && existing.autoAssigned === true) {
          next[catIdx].products.splice(prodIdx, 1);
          if (next[catIdx].products.length === 0) next.splice(catIdx, 1);
          mutated = true;
        }
        continue;
      }

      if (existing) {
        if (existing.autoAssigned === false) {
          continue;
        }
        if (existing.quantity !== requiredQty || existing.autoAssigned !== true) {
          next[catIdx].products[prodIdx] = {
            ...existing,
            quantity: requiredQty,
            autoAssigned: true
          };
          mutated = true;
        }
        continue;
      }

      const catalogProduct = findCatalogProduct(identifier);
      if (!catalogProduct) {
        setComplementCatalogMissing(identifier.description);
        continue;
      }

      if (rejectedComplementSKUsRef.current.has(catalogProduct.SKU)) {
        continue;
      }

      const toInsert: ISelectedProduct = {
        id: catalogProduct.id,
        name: catalogProduct.name,
        price: catalogProduct.price,
        price_taxes: catalogProduct.price_taxes,
        discount: catalogProduct.discount,
        discount_percentage: catalogProduct.discount_percentage,
        quantity: requiredQty,
        image: catalogProduct.image,
        category_id: catalogProduct.category_id,
        category_name: catalogProduct.category_name,
        SKU: catalogProduct.SKU,
        EAN: catalogProduct.EAN,
        stock: catalogProduct.stock,
        shipment_unit: catalogProduct.shipment_unit,
        autoAssigned: true
      };

      const existingCatIdx = next.findIndex((c) => c.category_id === toInsert.category_id);
      if (existingCatIdx === -1) {
        next.push({
          category_id: toInsert.category_id,
          category: toInsert.category_name,
          products: [toInsert]
        });
      } else {
        next[existingCatIdx].products.push(toInsert);
      }
      mutated = true;
    }

    const newSnapshot = new Set<string>();
    for (const cat of next) {
      for (const p of cat.products) {
        if (p.autoAssigned !== undefined && p.SKU) newSnapshot.add(p.SKU);
      }
    }
    prevAutoAssignedSKUsRef.current = newSnapshot;

    if (mutated) setSelectedCategories(next);
  }, [selectedCategories, categories, projectId, client?.id]);

  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartContainer__top}>
        <Flex className={styles.header} justify="space-between">
          <h3>{t("title")}</h3>
          <p>
            {t("skusAndProducts", {
              skus: numberOfSelectedProducts,
              products: totalProductsQuantity
            })}
          </p>
        </Flex>
        {width <= 768 && onClose && (
          <button onClick={onClose} className={styles.closeButton} aria-label={t("closeCart")}>
            <X size={16} weight="bold" />
          </button>
        )}

        {selectedCategories.length === 0 && (
          <div className={styles.emptyCart}>
            <BagSimple className={styles.bagLogo} size={82} />
            <p>{t("empty")}</p>
            <button
              className={styles.discountsButton}
              data-info={t("viewAllDiscounts")}
              onClick={handleOpenDiscountsModal}
            ></button>
          </div>
        )}
        <div className={styles.products}>
          {selectedCategories.map((category) => (
            <div key={category.category_id}>
              <Flex className={styles.products__header} justify="space-between">
                <h3>{category.products[0].category_name}</h3>
                <p>
                  {t("skusAndProducts", {
                    skus: category.products.length,
                    products: category.products.reduce((sum, product) => sum + product.quantity, 0)
                  })}
                </p>
              </Flex>
              {category.products.map((product) => {
                const productsDiscount: DiscountItem[] = appliedDiscounts?.filter(
                  (discount: any) => discount.product_sku === product.SKU
                );
                return (
                  <CreateOrderItem
                    key={`${product.id}-${product.SKU}`}
                    product={product}
                    categoryName={category.category}
                    productsDiscount={productsDiscount}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {selectedCategories.length > 0 && (
        <div className={styles.cartContainer__footer}>
          {promotionMessage && (
            <div
              className={`${styles.promotionMessage} w-full flex items-center gap-2 px-4 py-3 bg-black text-white text-sm font-semibold rounded-xl `}
            >
              <Sparkle size={16} weight="fill" className="text-cashport-green flex-shrink-0" />
              <span className="flex-1">{promotionMessage}</span>
            </div>
          )}
          {
            <button
              onClick={() => {
                setIsBonusModalOpen(true);
              }}
              className="w-full flex items-center gap-2 px-4 py-3 bg-[#FAFAFA] hover:bg-[#F3F3F3] transition-colors border border-[#EEEEEE] rounded-xl"
            >
              <Gift size={13} className="text-[#141414] flex-shrink-0" />
              <span className="flex-1 text-[13px] font-semibold text-[#141414] text-left">
                {t("freeGoods")}
              </span>
              <span className="px-1.5 py-0.5 text-[13px] font-bold bg-[#CBE71E] text-[#141414] rounded-md">
                {confirmOrderData?.promotion?.active_range?.gift_options &&
                (confirmOrderData.promotion?.active_range?.gift_options?.length ?? 0) > 1
                  ? t("available", {
                      count: confirmOrderData?.promotion?.active_range?.gift_options?.length ?? 0
                    })
                  : (confirmOrderData?.other_bonificated_products?.length ?? 0) > 0 &&
                    t("available", {
                      count: confirmOrderData?.other_bonificated_products?.length ?? 0
                    })}
              </span>
              <Eye size={14} className="text-[#999999]" />
            </button>
          }
          {!checkingOut && (
            <>
              <button
                className={styles.discountsButton}
                data-info={t("viewAllDiscounts")}
                onClick={handleOpenDiscountsModal}
              ></button>
              <hr className={styles.separator} />
            </>
          )}

          <Flex vertical gap={"0.25rem"}>
            <Flex justify="space-between">
              <p>{tSummary("subtotal")}</p>
              <p>${formatNumber(confirmOrderData?.subtotal)}</p>
            </Flex>

            <Flex justify="space-between" style={{ marginTop: "0.2rem" }}>
              <p className={styles.cartContainer__footer__discountExplanation}>
                {tSummary("productDiscounts")}
              </p>
              {confirmOrderData.discounts ? (
                <Text className={styles.cartContainer__footer__discountExplanation}>
                  -${formatNumber(confirmOrderData.discounts?.totalProductDiscount)}
                </Text>
              ) : (
                <Text className={styles.cartContainer__footer__discountExplanation}>-$0</Text>
              )}
            </Flex>

            <Flex justify="space-between" style={{ marginTop: "0.2rem" }}>
              <p className={styles.cartContainer__footer__discountExplanation}>
                {tSummary("orderDiscounts")}
              </p>
              {confirmOrderData.discounts ? (
                <Text className={styles.cartContainer__footer__discountExplanation}>
                  -${formatNumber(confirmOrderData.discounts?.totalOrderDiscount)}
                </Text>
              ) : (
                <Text className={styles.cartContainer__footer__discountExplanation}>-$0</Text>
              )}
            </Flex>
            <Flex justify="space-between" gap={"0.25rem"}>
              <p className={styles.cartContainer__footer__discountExplanation}>
                {tSummary("totalDiscount")}
              </p>
              {confirmOrderData.discounts ? (
                <Text className={styles.cartContainer__footer__discountExplanation}>
                  -${formatNumber(confirmOrderData.discounts?.totalDiscount)}
                </Text>
              ) : (
                <Text className={styles.cartContainer__footer__discountExplanation}>-$0</Text>
              )}
            </Flex>
            <Flex justify="space-between" style={{ marginTop: "0.5rem" }}>
              <strong>{tSummary("total")}</strong>
              <strong>${formatNumber(confirmOrderData?.total)}</strong>
            </Flex>
            <Flex justify="space-between">
              <p>{tSummary("vat")}</p>
              <p>${formatNumber(confirmOrderData?.taxes)}</p>
            </Flex>
            <Flex justify="space-between">
              <p>{tSummary("totalWithEarlyPayment")}</p>
              <p>${formatNumber(confirmOrderData?.total_pronto_pago)}</p>
            </Flex>
          </Flex>

          {!checkingOut && (
            <PrincipalButton onClick={() => handleContinuePurchase()}>
              {t("continuePurchase")}
            </PrincipalButton>
          )}
        </div>
      )}

      {openDiscountsModal && (
        <CreateOrderDiscountsModal setOpenDiscountsModal={setOpenDiscountsModal} />
      )}

      <ModalBonus
        isOpen={isBonusModalOpen}
        onClose={() => setIsBonusModalOpen(false)}
        promotions={promotions}
        selectedPromotionId={promotionId ?? null}
        onSelectPromotion={handleSelectPromotionId}
        loading={isPromotionDetailLoading}
      />

      <ModalConfirmAction
        isOpen={showConfirmModal}
        onClose={handleCloseModal}
        title={t("cannotContinue")}
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>
              {t("minimumOrder", { amount: formatMoney(minimumOrderAmount) })}
            </p>
            <p>{t("addMoreProducts")}</p>
          </Flex>
        }
        cancelText={t("understood")}
        hideOkButton
      />

      <ModalConfirmAction
        isOpen={showCanulasModal}
        onClose={handleCloseCanulasModal}
        onOk={handleConfirmCanulas}
        title={t("confirmContinue")}
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>{t("noCannulasOrWater")}</p>
            <p>{t("reviewOrder")}</p>
          </Flex>
        }
        okText={tCommon("actions.confirm")}
        cancelText={tCommon("actions.cancel")}
      />

      <ModalConfirmAction
        isOpen={showOnlyCanulasOrAguaModal}
        onClose={handleCloseOnlyCanulasOrAguaModal}
        title={t("cannotContinue")}
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>
              {t("onlyCannulasOrWater")}
            </p>
            <p>{t("addOtherProducts")}</p>
          </Flex>
        }
        cancelText={t("understood")}
        hideOkButton
      />

      <ModalConfirmAction
        isOpen={showOddSBVitalModal}
        onClose={handleCloseOddSBVitalModal}
        onOk={handleConfirmOddSBVital}
        title={t("confirmContinue")}
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>{t("oddSkinboosters")}</p>
          </Flex>
        }
        okText={tCommon("actions.continue")}
        cancelText={tCommon("actions.cancel")}
      />

      <ModalConfirmAction
        isOpen={showOddGroupModal}
        onClose={handleCloseOddGroupModal}
        onOk={handleConfirmOddGroup}
        title={t("confirmContinue")}
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>{t("oddRestylane")}</p>
          </Flex>
        }
        okText={tCommon("actions.continue")}
        cancelText={tCommon("actions.cancel")}
      />

      <ModalConfirmAction
        isOpen={showComplementMismatchModal}
        onClose={() => setShowComplementMismatchModal(false)}
        onOk={handleConfirmComplementMismatch}
        title={t("cannotContinue")}
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>{t("complementMismatch")}</p>
            {complementMismatch && (
              <>
                <p>
                  {t.rich("requiredCannulas", {
                    expected: complementMismatch.expectedCanulas,
                    actual: complementMismatch.actualCanulas,
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
                <p>
                  {t.rich("requiredWater", {
                    expected: complementMismatch.expectedAgua,
                    actual: complementMismatch.actualAgua,
                    strong: (chunks) => <strong>{chunks}</strong>
                  })}
                </p>
                <p>{t("reloadOrContactSupport")}</p>
              </>
            )}
          </Flex>
        }
        cancelText={t("modify")}
        okText={tCommon("actions.continue")}
        hideOkButton={
          !!complementMismatch &&
          complementMismatch.actualCanulas > complementMismatch.expectedCanulas
        }
      />

      <ModalConfirmAction
        isOpen={!!complementCatalogMissing}
        onClose={() => setComplementCatalogMissing(null)}
        title={t("complementUnavailable")}
        content={
          <Flex vertical className={styles.confirmationModalContent} gap="0.5rem">
            <p className={styles.confirmationModalContent__totalLabel}>
              {t("complementNotFound", { product: complementCatalogMissing ?? "" })}
            </p>
            <p>{t("contactCatalogAdmin")}</p>
          </Flex>
        }
        cancelText={t("understood")}
        hideOkButton
      />
    </div>
  );
};

export default CreateOrderCart;
