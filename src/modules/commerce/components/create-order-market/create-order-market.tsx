import { FC, useContext, useEffect, useState, useMemo } from "react";
import { Button, Flex } from "antd";
import { CaretLeft } from "phosphor-react";

import { useAppStore } from "@/lib/store/store";
import UiSearchInput from "@/components/ui/search-input";
import UiTab from "@/components/ui/ui-tab";
import CartButton from "../button-cart";
import CreateOrderProduct from "../create-order-product";
import { getProductsByClient } from "@/services/commerce/commerce";

import { ISelectType } from "@/types/clients/IClients";
import { ISelectedProduct } from "@/types/commerce/ICommerce";

import styles from "./create-order-market.module.scss";
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
  name: string;
  productIds: number[];
}

const CreateOrderMarket: FC = () => {
  const { ID } = useAppStore((state) => state.selectedProject);
  const {
    client,
    setClient,
    categories,
    setCategories,
    setSelectedCategories,
    toggleCart,
    numberOfItems
  } = useContext(OrderViewContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 800);

  const [productsMap, setProductsMap] = useState<Map<number, ISelectedProduct>>(new Map());
  const [categoriesMap, setCategoriesMap] = useState<Map<string, CategoryMap>>(new Map());

  useEffect(() => {
    const fetchProducts = async () => {
      if (!client?.id) return;

      const response = await getProductsByClient(ID, client.id);
      if (!response.data) return;

      const newProductsMap = new Map<number, ISelectedProduct>();
      const newCategoriesMap = new Map<string, CategoryMap>();
      const categoriesList: IFetchedCategory[] = [];

      response.data.forEach((category) => {
        const categoryName = category.category;
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
            stock: true,
            category_name: product.category_name,
            shipment_unit: product.shipment_unit
          };

          newProductsMap.set(formattedProduct.id, formattedProduct);
          productIds.push(formattedProduct.id);
          categoryProducts.push(formattedProduct);
        });

        newCategoriesMap.set(categoryName, {
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

      if (categoriesList.length > 0 && !activeTab) {
        setActiveTab(categoriesList[0].category);
      }
    };

    fetchProducts();
  }, [client?.id, ID]);

  const filteredCategories = useMemo(() => {
    if (!categories || categoriesMap.size === 0) return [];

    const searchUpper = debouncedSearch.toUpperCase();

    return Array.from(categoriesMap.entries()).map(([categoryName, category]) => {
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

      return {
        category: categoryName,
        products: filteredProducts
      };
    });
  }, [categories, debouncedSearch, productsMap, categoriesMap]);

  const categoryTabs = useMemo(() => {
    return filteredCategories
      .map((category) => ({
        key: category.category,
        label: `${category.category} (${category.products.length})`,
        children: (
          <div className={styles.productsGrid} key={`grid-${category.category}-${debouncedSearch}`}>
            {category.products.map((product) => (
              <CreateOrderProduct
                key={`product-${product.id}-${debouncedSearch}`}
                product={product}
                categoryName={category.category}
              />
            ))}
          </div>
        )
      }))
      .map((tab) => ({
        ...tab,
        children: <div key={`tab-content-${tab.key}-${debouncedSearch}`}>{tab.children}</div>
      }));
  }, [filteredCategories, debouncedSearch]);

  return (
    <div className={styles.marketContainer}>
      <Flex justify="space-between" align="center">
        <Button
          type="text"
          size="large"
          className={styles.buttonGoBack}
          icon={<CaretLeft size={"1.3rem"} />}
          onClick={() => {
            setSelectedCategories([]);
            setClient(undefined as any);
          }}
        >
          {client?.name}
        </Button>
        <CartButton onClick={toggleCart} numberOfItems={numberOfItems} />
      </Flex>
      <Flex gap={"0.5rem"}>
        <UiSearchInput
          placeholder="Buscar"
          onChange={(event) => setSearchTerm(event.target.value)}
        />
      </Flex>

      <UiTab tabs={categoryTabs} activeKey={activeTab} onChangeTab={setActiveTab} />
    </div>
  );
};

export default CreateOrderMarket;
