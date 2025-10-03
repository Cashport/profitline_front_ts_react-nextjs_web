import { useCallback, useContext } from "react";
import { OrderViewContext } from "../../containers/create-order/create-order";
import { ISelectedProduct } from "@/types/commerce/ICommerce";

export const useHandleProductsItems = (product: ISelectedProduct, categoryName: string) => {
  const { selectedCategories, setSelectedCategories } = useContext(OrderViewContext);

  const alreadySelectedProduct: ISelectedProduct | null =
    selectedCategories.reduce<ISelectedProduct | null>((acc, category) => {
      if (category.category_id === product.category_id) {
        const foundProduct = category.products.find((p) => p.id === product.id);
        if (foundProduct) return foundProduct;
      }
      return acc;
    }, null);

  const handleAddToCart = (product: ISelectedProduct) => {
    const newState = [...selectedCategories];
    const categoryIndex = selectedCategories.findIndex(
      (c) => c.category_id === product.category_id
    );

    const productToAdd = {
      id: product.id,
      name: product.name,
      price: product.price,
      discount: product.discount,
      discount_percentage: product.discount_percentage,
      quantity: 1,
      image: product.image,
      category_id: product.category_id,
      SKU: product.SKU,
      stock: product.stock,
      category_name: product.category_name,
      shipment_unit: product.shipment_unit
    };

    if (categoryIndex === -1) {
      //Category does not exist
      newState.push({
        category: categoryName,
        category_id: product.category_id,
        products: [productToAdd]
      });
    } else {
      //Category already exists
      const existingProducts = newState[categoryIndex].products;
      existingProducts.push(productToAdd);
    }
    setSelectedCategories(newState);
  };

  const handleDecrementQuantity = useCallback(
    (productId: number) => {
      const newState = [...selectedCategories];
      const categoryIndex = selectedCategories.findIndex((c) =>
        c.products.find((p) => p.id === productId)
      );

      const productIndex = newState[categoryIndex].products.findIndex((p) => p.id === productId);

      const updatedProduct = {
        ...newState[categoryIndex].products[productIndex],
        quantity: selectedCategories[categoryIndex].products[productIndex].quantity - 1
      };

      if (updatedProduct.quantity === 0) {
        newState[categoryIndex].products.splice(productIndex, 1);
      } else {
        newState[categoryIndex].products[productIndex] = updatedProduct;
      }

      // Remove the category if there are no products left
      if (newState[categoryIndex].products.length === 0) {
        newState.splice(categoryIndex, 1);
      }

      setSelectedCategories(newState);
    },
    [selectedCategories, setSelectedCategories]
  );

  const handleIncrementQuantity = useCallback(
    (productId: number) => {
      const newState = [...selectedCategories];
      const categoryIndex = selectedCategories.findIndex((c) =>
        c.products.find((p) => p.id === productId)
      );

      const productIndex = newState[categoryIndex].products.findIndex((p) => p.id === productId);

      const updatedProduct = {
        ...newState[categoryIndex].products[productIndex],
        quantity: newState[categoryIndex].products[productIndex].quantity + 1
      };

      // Replace the old product with the updated product in the products array
      newState[categoryIndex].products[productIndex] = updatedProduct;

      // Set the updated state array
      setSelectedCategories(newState);
    },
    [selectedCategories, setSelectedCategories]
  );

  const handleChangeQuantity = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>, productId: number, categoryId: number) => {
      const newState = [...selectedCategories];
      const newQuantity = parseInt(event.target.value);
      const categoryIndex = selectedCategories.findIndex((c) =>
        c.products.find((p) => p.id === productId)
      );
      const productIndex = newState[categoryIndex].products.findIndex((p) => p.id === productId);

      if (isNaN(newQuantity) || newQuantity <= 0) {
        // Remove the product if the quantity is 0 or not a number(empty input)
        newState[categoryIndex].products.splice(productIndex, 1);

        // Remove the category if there are no products left
        if (newState[categoryIndex].products.length === 0) {
          newState.splice(categoryIndex, 1);
        }

        setSelectedCategories(newState);
        return;
      }

      // Create a new array with updated products
      const updatedCategories = newState.map((category) => {
        if (category.category_id === categoryId) {
          // Map over the products only if this is the right category
          const updatedProducts = category.products.map((product) => {
            if (product.id === productId) {
              // Update the quantity of the matched product
              return { ...product, quantity: newQuantity };
            }
            return product;
          });
          // Return the updated category with updated products
          return { ...category, products: updatedProducts };
        }
        return category;
      });

      setSelectedCategories(updatedCategories); // Update state with the newly formed categories array
    },
    [selectedCategories, setSelectedCategories]
  );

  return {
    alreadySelectedProduct,
    handleAddToCart,
    handleDecrementQuantity,
    handleIncrementQuantity,
    handleChangeQuantity
  };
};
