import { getCityWarehouses } from "@/services/commerce/commerce";
import { ICityWarehouse } from "@/types/commerce/ICommerce";
import { useEffect, useState } from "react";

export const useCityWarehouse = () => {
  const [warehouseCities, setWarehousesCities] = useState<ICityWarehouse[]>([]);
  const [isCityLoading, setIsCityLoading] = useState(true);

  const warehouseBu = {
    "Tienda Piel": 55,
    Trade: 55,
    Institucional: 64
  };

  const fetchCities = async () => {
    const response = await getCityWarehouses();
    if (response.data) setWarehousesCities(response.data);
    setIsCityLoading(false);
  };

  useEffect(() => {
    fetchCities();
  }, []);
  return { warehouseCities, isCityLoading, warehouseBu };
};
