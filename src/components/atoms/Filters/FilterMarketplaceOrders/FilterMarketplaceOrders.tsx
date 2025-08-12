import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Cascader } from "antd";
import { getOrdersFilter } from "@/services/commerce/commerce";
import "../filterCascader.scss";

// Interfaces para los tipos de datos
interface ISeller {
  id: number;
  name: string;
  checked: boolean;
}

interface ISellerGroup {
  id: number;
  name: string;
  sellers: ISeller[];
}

export interface IMarketplaceOrdersFilters {
  sellerFilter: ISellerGroup[];
}

// Interface para las opciones del Cascader
interface Option {
  value: string | number;
  label: string;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  children?: Option[];
}

// Interface para los filtros seleccionados
export interface IMarketplaceOrderFilters {
  sellers: string[];
}

interface Props {
  setSelectedFilters: Dispatch<SetStateAction<IMarketplaceOrderFilters>>;
}

const initValueFiltersData = {
  sellers: []
};

export const FilterMarketplaceOrders = ({ setSelectedFilters }: Props) => {
  const [optionsList, setOptionsList] = useState<Option[]>([]);
  const [selectOptions, setSelectOptions] = useState<(string | number)[][]>([]);
  const [sellersData, setSellersData] = useState<ISellerGroup[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const response = await getOrdersFilter();

        const sellerGroups = response.sellerFilter;

        setSellersData(sellerGroups);

        // Transformar directamente a opciones del Cascader
        const sellersOptions = transformSellersToOptions(sellerGroups);
        setOptionsList(sellersOptions);
      } catch (error) {
        console.error("Error al cargar los filtros:", error);
      }
    };

    loadInitialData();
  }, []);

  // Efecto para actualizar los filtros cuando cambian las selecciones
  useEffect(() => {
    if (selectOptions.length === 0) {
      return setSelectedFilters({
        sellers: []
      });
    }

    // Extraer solo los IDs de vendedores individuales (nivel 1 del cascader)
    const selectedSellerIds = selectOptions
      .filter((item) => item.length === 2) // group > seller
      .map((item) => String(item[1])); // El ID del seller está en la posición 1

    setSelectedFilters({
      sellers: selectedSellerIds
    });
  }, [selectOptions, setSelectedFilters]);

  // Función para transformar los datos de la API a opciones del Cascader
  const transformSellersToOptions = (sellerGroups: ISellerGroup[]): Option[] => {
    return sellerGroups.map((group) => ({
      value: group.id,
      label: group.name,
      isLeaf: false,
      children: group.sellers.map((seller) => ({
        value: seller.id,
        label: seller.name,
        isLeaf: true
      }))
    }));
  };

  // Función para manejar cambios en la selección
  const onChange = (value: (string | number)[][]) => {
    // Procesar las selecciones para manejar la lógica de grupos
    const processedSelections: (string | number)[][] = [];

    value.forEach((selection) => {
      if (selection.length === 1) {
        // Si se selecciona un grupo completo, agregar todos sus vendedores
        const groupId = selection[0];
        const selectedGroup = sellersData.find((group) => group.id === groupId);

        if (selectedGroup) {
          selectedGroup.sellers.forEach((seller) => {
            processedSelections.push([groupId, seller.id]);
          });
        }
      } else if (selection.length === 2) {
        // Si se selecciona un vendedor individual
        processedSelections.push(selection);
      }
    });

    setSelectOptions(processedSelections);
  };

  // Función personalizada para mostrar las etiquetas seleccionadas
  const displayRender = (labels: string[], selectedOptions?: Option[]) => {
    if (!selectedOptions || selectedOptions.length === 0) return "";

    const sellerNames: string[] = [];
    const groupCounts: { [key: string]: number } = {};

    // Contar las selecciones por grupo
    selectOptions.forEach((selection) => {
      if (selection.length === 2) {
        const groupId = selection[0];
        const group = sellersData.find((g) => g.id === groupId);
        if (group) {
          if (groupCounts[group.name]) {
            groupCounts[group.name]++;
          } else {
            groupCounts[group.name] = 1;
          }
        }
      }
    });

    // Mostrar nombres de grupos cuando todos sus vendedores están seleccionados
    Object.entries(groupCounts).forEach(([groupName, count]) => {
      const group = sellersData.find((g) => g.name === groupName);
      if (group && count === group.sellers.length) {
        sellerNames.push(groupName);
      } else if (group) {
        sellerNames.push(`${groupName} (${count})`);
      }
    });

    return sellerNames.join(",");
  };

  return (
    <Cascader
      className="filterCascader"
      style={{ width: "15rem", height: "46px" }}
      multiple
      size="large"
      removeIcon
      maxTagCount="responsive"
      placeholder="Filtrar"
      placement="bottomLeft"
      onClear={() => {
        setSelectOptions([]);
        setSelectedFilters(initValueFiltersData);
      }}
      options={optionsList}
      changeOnSelect
      value={selectOptions}
      onChange={onChange}
      displayRender={displayRender}
      showCheckedStrategy="SHOW_PARENT"
    />
  );
};
