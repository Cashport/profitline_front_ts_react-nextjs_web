import { Select } from "antd";
import {
  ControllerRenderProps,
  FieldErrorsImpl,
  Merge,
  FieldError as OriginalFieldError
} from "react-hook-form";
import { selectClientForm } from "../create-order-search-client/create-order-search-client";
import { useAppStore } from "@/lib/store/store";
import { useEffect, useState, useMemo, useContext } from "react";
import { getClients } from "@/services/commerce/commerce";
import "./create-order-select-client.scss";
import { IEcommerceClient } from "@/types/commerce/ICommerce";
import { OrderViewContext } from "@/modules/commerce/contexts/orderViewContext";

type ExtendedFieldError =
  | OriginalFieldError
  | Merge<OriginalFieldError, FieldErrorsImpl<{ value: string; label: string; email: string }>>;

interface Props {
  errors: ExtendedFieldError | undefined;
  field: ControllerRenderProps<selectClientForm, "client">;
}

const SelectClientSimplified = ({ errors, field }: Props) => {
  const { ID } = useAppStore((state) => state.selectedProject);
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState<IEcommerceClient[]>([]);
  const { setClient } = useContext(OrderViewContext); // Obtenemos la función del contexto

  useEffect(() => {
    if (!ID) return;
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await getClients(ID);
        setClients(response?.data || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, [ID]);

  // Memorizar las opciones del select
  const options = useMemo(
    () =>
      clients.map((client) => ({
        value: client.client_id,
        label: client.client_name,
        // Almacenar el email en la metadata de la opción
        email: client.client_email,
        payment_type: client.payment_type
      })),
    [clients]
  );

  // Crear un mapa para búsqueda rápida de emails
  const clientEmailMap = useMemo(
    () =>
      clients.reduce(
        (acc, client) => ({
          ...acc,
          [client.client_id]: client.client_email
        }),
        {} as Record<string, string>
      ),
    [clients]
  );

  const clientPaymentTypeMap = useMemo(
    () =>
      clients.reduce(
        (acc, client) => ({
          ...acc,
          [client.client_id]: client.payment_type
        }),
        {} as Record<string, number>
      ),
    [clients]
  );

  const handleChange = (value: { value: string; label: string } | null) => {
    if (value) {
      const enrichedValue = {
        ...value,
        email: clientEmailMap[value.value] || "",
        payment_type: clientPaymentTypeMap[value.value] || ""
      };

      console.log("Cliente seleccionado:", enrichedValue); // <-- aquí

      // Enviar al formulario
      field.onChange(enrichedValue);
    } else {
      field.onChange(null);
      console.log("Cliente deseleccionado");
    }
  };


  return (
    <Select
      showSearch
      optionFilterProp="label"
      placeholder="Seleccione un cliente"
      className={`selectInputClientBase ${errors ? "selectInputClientError" : "selectInputClientCustom"}`}
      loading={loading}
      variant="borderless"
      optionLabelProp="label"
      {...field}
      onChange={handleChange}
      popupClassName="selectDrop"
      options={options}
      labelInValue
    />
  );
};

export default SelectClientSimplified;
