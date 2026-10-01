import { useAppStore } from "@/lib/store/store";
import useSWR from "swr";
import { getProductsByProject } from "@/services/products/products";
import { useEffect, useState } from "react";
import { Product, ProductLine } from "@/types/products/products";
import { RadioChangeEvent } from "antd";
import { UseFormSetValue } from "react-hook-form";
import { DiscountSchema } from "../../../../resolvers/generalResolver";

type UseDiscountFeatsProps = {
  setValue: UseFormSetValue<DiscountSchema>;
};
export default function useDiscountFeats({ setValue }: UseDiscountFeatsProps) {
  const { ID } = useAppStore((state) => state.selectedProject);
  const { data: products, isLoading } = useSWR(ID ? ["products-by-project", ID] : null, () =>
    getProductsByProject(ID)
  );
  const [lines, setLines] = useState<ProductLine[]>([]);

  const mapProductsToLines = (products: Product[]) => {
    const lines = products.reduce((acc: ProductLine[], product: Product) => {
      if (acc.find((line) => line.id === product.id_line)) {
        const index = acc.findIndex((line) => line.id === product.id_line);
        acc[index].products.push(product);
      } else {
        acc.push({
          id: product.id_line,
          name: product.description_line,
          products: [product]
        });
      }
      return acc;
    }, []);
    return lines;
  };

  useEffect(() => {
    if (products?.data) {
      const lines = mapProductsToLines(products.data);
      setLines(lines);
    }
  }, [products]);

  const onChange = (e: RadioChangeEvent) => {
    setValue("computation_type", e.target.value, { shouldValidate: true });
  };
  return { lines, onChange, isLoading, projectId: ID };
}
