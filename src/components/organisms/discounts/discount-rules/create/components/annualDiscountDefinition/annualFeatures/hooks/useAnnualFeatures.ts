import { UseFormReturn } from "react-hook-form";
import { DiscountSchema } from "../../../../resolvers/generalResolver";
import { useAppStore } from "@/lib/store/store";
import useSWR from "swr";
import { useEffect, useMemo } from "react";
import { getAllLinesByClient } from "@/services/line/line";

type AnnualFeaturesProps = {
  form: UseFormReturn<DiscountSchema, any, undefined>;
};

export default function useAnnualFeatures({ form }: AnnualFeaturesProps) {
  const { ID: projectId } = useAppStore((project) => project.selectedProject);
  const { watch, setValue } = form;
  const clientId = watch("client");

  const key = projectId && clientId ? `${projectId}-${clientId}` : null;

  const {
    data: categoriesByClient,
    isLoading: isLoadingOption,
    error: APIproductsError
  } = useSWR(key, () => getAllLinesByClient(projectId.toString(), clientId || ""), {
    shouldRetryOnError: false // No volver a intentar si ocurre un error
  });

  useEffect(() => {
    if (APIproductsError !== undefined) {
      setValue("annual_ranges", []);
    }
  }, [APIproductsError]);

  console.log("api products error", APIproductsError);
  const options = useMemo(() => {
    return (
      categoriesByClient?.map((cat) => ({
        label: cat.category,
        value: cat.category_id,
        productsAvailable: cat.products
      })) || []
    );
  }, [categoriesByClient]);

  return {
    options,
    clientWithoutProducts: APIproductsError !== undefined,
    isLoadingOption
  };
}
