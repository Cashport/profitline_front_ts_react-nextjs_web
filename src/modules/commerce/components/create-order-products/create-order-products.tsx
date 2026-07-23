import { FC, useContext, useEffect, useState, useMemo } from "react";
import { Button, Collapse, Divider, Flex } from "antd";
import { CaretLeft, CaretRight } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import UiSearchInput from "@/components/ui/search-input";
import UiTab from "@/components/ui/ui-tab";
import CartButton from "../button-cart";
import CreateOrderProduct from "../create-order-product";
import { getProductsByClient } from "@/services/commerce/commerce";

import { ISelectType } from "@/types/clients/IClients";
import { IOrderConfirmedResponse, ISelectedProduct } from "@/types/commerce/ICommerce";

import styles from "./create-order-products.module.scss";
import { useDebounce } from "@/hooks/useSearch";
import { OrderViewContext } from "../../contexts/orderViewContext";

export interface selectClientForm {
  client: ISelectType;
}

interface IFetchedCategory {
  category: string;
  products: ISelectedProduct[];
}

interface CategoryMap {
  id: number;
  name: string;
  productIds: number[];
}

interface SubGroup {
  categoryId: number;
  categoryName: string;
  products: ISelectedProduct[];
}

const CreateOrderProducts: FC = () => {
  const { ID } = useAppStore((state) => state.selectedProject);
  const {
    client,
    setClient,
    categories,
    setCategories,
    setSelectedCategories,
    setExecutiveDiscounts,
    setBonus,
    setConfirmOrderData,
    setDeactivateCrossSelling,
    toggleCart,
    numberOfItems,
    businessUnit
  } = useContext(OrderViewContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 800);

  const [productsMap, setProductsMap] = useState<Map<number, ISelectedProduct>>(new Map());
  const [categoriesMap, setCategoriesMap] = useState<Map<number, CategoryMap>>(new Map());

  useEffect(() => {
    const fetchProducts = async () => {
      if (!client?.id) return;

      const response = await getProductsByClient(ID, client.id, businessUnit);
      if (!response.data) return;

      const newProductsMap = new Map<number, ISelectedProduct>();
      const newCategoriesMap = new Map<number, CategoryMap>();
      const categoriesList: IFetchedCategory[] = [];

      response.data.forEach((category) => {
        const categoryName = category.category;
        const categoryId = category.category_id;
        const categoryProducts: ISelectedProduct[] = [];
        const productIds: number[] = [];

        category.products.forEach((product) => {
          const formattedProduct: ISelectedProduct = {
            id: Number(product.id),
            name: product.description,
            price: product.price,
            price_taxes: product.price_taxes,
            discount: 0,
            discount_percentage: 0,
            quantity: 0,
            image: product.image,
            category_id: Number(product.id_category),
            SKU: product.SKU,
            EAN: product.EAN,
            stock: true,
            category_name: product.category_name,
            shipment_unit: product.shipment_unit
          };

          newProductsMap.set(formattedProduct.id, formattedProduct);
          productIds.push(formattedProduct.id);
          categoryProducts.push(formattedProduct);
        });

        newCategoriesMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          productIds
        });

        categoriesList.push({
          category: categoryName,
          products: categoryProducts
        });
      });

      setProductsMap(newProductsMap);
      setCategoriesMap(newCategoriesMap);
      setCategories(categoriesList);

      const firstCategoryId = newCategoriesMap.keys().next().value;
      if (firstCategoryId !== undefined && !activeTab) {
        setActiveTab(String(firstCategoryId));
      }
    };

    fetchProducts();
  }, [client?.id, ID]);

  const filteredCategories = useMemo(() => {
    if (!categories || categoriesMap.size === 0) return [];

    const searchUpper = debouncedSearch.toUpperCase();

    return Array.from(categoriesMap.values()).map((category) => {
      const filteredProducts = category.productIds
        .map((id) => productsMap.get(id))
        .filter((product): product is ISelectedProduct => {
          if (!product) return false;
          if (!searchUpper) return true;

          return (
            product.name.toUpperCase().includes(searchUpper) ||
            product.SKU.toUpperCase().includes(searchUpper)
          );
        });

      // Sub-group by the item-specific category_id
      const subGroupsMap = new Map<number, SubGroup>();
      filteredProducts.forEach((product) => {
        const existing = subGroupsMap.get(product.category_id);
        if (existing) {
          existing.products.push(product);
        } else {
          subGroupsMap.set(product.category_id, {
            categoryId: product.category_id,
            categoryName: product.category_name,
            products: [product]
          });
        }
      });

      return {
        tabId: category.id,
        tabName: category.name,
        productCount: filteredProducts.length,
        subGroups: Array.from(subGroupsMap.values())
      };
    });
  }, [categories, debouncedSearch, productsMap, categoriesMap]);

  const categoryTabs = useMemo(() => {
    return filteredCategories.map((tab) => ({
      key: String(tab.tabId),
      label: `${tab.tabName} (${tab.productCount})`,
      children: (
        <div key={`tab-content-${tab.tabId}-${debouncedSearch}`}>
          <CategorySubGroups subGroups={tab.subGroups} searchKey={debouncedSearch} />
        </div>
      )
    }));
  }, [filteredCategories, debouncedSearch]);

  return (
    <div className={styles.marketContainer}>
      <Flex justify="space-between" align="center" gap={"0.75rem"}>
        <Button
          type="text"
          size="large"
          className={styles.buttonGoBack}
          icon={<CaretLeft size={"1.3rem"} />}
          onClick={() => {
            setSelectedCategories([]);
            setExecutiveDiscounts([]);
            setBonus(undefined);
            setConfirmOrderData({} as IOrderConfirmedResponse);
            setDeactivateCrossSelling(true);
            setClient(undefined as any);
          }}
        >
          {client?.name}
        </Button>
        <div className={styles.searchWrapper}>
          <UiSearchInput
            placeholder="Buscar"
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>
        <CartButton onClick={toggleCart} numberOfItems={numberOfItems} />
      </Flex>

      <UiTab tabs={categoryTabs} activeKey={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
};

interface CategorySubGroupsProps {
  subGroups: SubGroup[];
  searchKey: string;
}

const CategorySubGroups: FC<CategorySubGroupsProps> = ({ subGroups, searchKey }) => {
  // Los sub-grupos ya están resueltos cuando este componente monta (los tabs se derivan de ellos),
  // así que basta con inicializar perezosamente: solo el primero abierto.
  const [activeKeys, setActiveKeys] = useState<string[]>(() =>
    subGroups.length ? [String(subGroups[0].categoryId)] : []
  );

  return (
    <Collapse
      ghost
      className={styles.categoryCollapse}
      activeKey={activeKeys}
      onChange={(keys) => setActiveKeys(Array.isArray(keys) ? keys : [keys])}
      expandIcon={({ isActive }) => (
        <CaretRight
          size={"0.85rem"}
          className={`${styles.categoryChevron} ${isActive ? styles.isOpen : ""}`}
        />
      )}
      items={subGroups.map((group) => ({
        key: String(group.categoryId),
        className: styles.categorySection,
        label: (
          <Divider orientation="left" orientationMargin={0} className={styles.categoryDivider}>
            {group.categoryName}
          </Divider>
        ),
        children: (
          <div className={styles.productsGrid}>
            {group.products.map((product) => (
              <CreateOrderProduct
                key={`product-${product.id}-${searchKey}`}
                product={product}
                categoryName={group.categoryName}
              />
            ))}
          </div>
        )
      }))}
    />
  );
};

export default CreateOrderProducts;
