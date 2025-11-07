import { FC, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex } from "antd";
import { CaretLeft } from "phosphor-react";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { Controller, useForm } from "react-hook-form";
import styles from "./create-order-checkout.module.scss";
import GeneralSelect from "@/components/ui/general-select";
import AlternativeBlackButton from "@/components/atoms/buttons/alternativeBlackButton/alternativeBlackButton";
import {
  createDraft,
  createOrder,
  createOrderFromDraft,
  getAdresses
} from "@/services/commerce/commerce";
import { useAppStore } from "@/lib/store/store";
import {
  ICommerceAdresses,
  IDiscountPackageAvailable,
  IShippingInformation
} from "@/types/commerce/ICommerce";
import { useMessageApi } from "@/context/MessageContext";
import { GenericResponse } from "@/types/global/IGlobal";
import InputRadioRightSide from "@/components/ui/input-radio-right-side";
import { SelectContactIndicative } from "@/components/molecules/selects/contacts/SelectContactIndicative";
import { SelectLocations } from "@/components/molecules/selects/clients/SelectLocations/SelectLocations";
import { OrderViewContext } from "../../contexts/orderViewContext";

interface IShippingInfoForm {
  addresses: {
    value: string;
    label: string;
  };
  city: {
    value: string;
    label: string;
  };
  address: string;
  email: string;
  indicative: {
    value: string;
    label: string;
  };
  phone: string;
  comment: string;
}

// Constante para identificar la opción de nueva dirección
const NEW_ADDRESS_OPTION = {
  value: "new_address",
  label: "+ Nueva dirección"
};

const CreateOrderCheckout: FC = ({}) => {
  const {
    setCheckingOut,
    client,
    confirmOrderData,
    shippingInfo,
    selectedDiscount,
    setSelectedDiscount,
    discounts
  } = useContext(OrderViewContext);
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const { draftInfo } = useAppStore((state) => state);
  const [loading, setLoading] = useState(false);
  const [addresses, setAddresses] = useState<ICommerceAdresses[]>([]);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const router = useRouter();
  const { showMessage } = useMessageApi();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid }
  } = useForm<IShippingInfoForm>({
    mode: "onChange",
    defaultValues: shippingInfo ? shippingInfoToForm(shippingInfo) : undefined
  });
  const watchSelectAddress = watch("addresses");

  useEffect(() => {
    // Verificar si se seleccionó "Nueva dirección"
    if (watchSelectAddress?.value === NEW_ADDRESS_OPTION.value) {
      setIsNewAddress(true);
      // Limpiar los campos para permitir entrada manual
      setValue("city", { label: "", value: "" });
      setValue("address", "");
    } else if (watchSelectAddress) {
      setIsNewAddress(false);
      // Buscar la dirección seleccionada en el array de direcciones
      const selectedAddress = addresses.find(
        (address) => address.address === watchSelectAddress.label
      );
      if (selectedAddress) {
        setValue("city", {
          label: selectedAddress.city,
          value: selectedAddress.city
        });
        setValue("address", selectedAddress.address);
      }
    }
  }, [watchSelectAddress, addresses, setValue]);

  // when mounting
  useEffect(() => {
    if (!client) return;
    setValue("email", client.email);
    const fetchAdresses = async () => {
      const response = await getAdresses(client.id);
      setAddresses(response.data);
    };
    fetchAdresses();
  }, []);

  const handleGoBack = () => {
    setCheckingOut(false);
  };

  const handleRadioClick = (value: IDiscountPackageAvailable) => {
    if (selectedDiscount === value) setSelectedDiscount(undefined);
    else setSelectedDiscount(value);
  };

  const onSubmitSaveDraft = async (data: IShippingInfoForm) => {
    setLoading(true);
    router.prefetch("/comercio");
    const createOrderModelData = {
      shipping_information: {
        address: data.address,
        city: data.city.label,
        dispatch_address: data.address,
        email: data.email,
        phone_number: `${data.indicative}${data.phone}`,
        comments: data.comment,
        id: data.addresses.value
      },
      order_summary: confirmOrderData
    };

    if (!client) return;

    try {
      const response = (await createDraft(
        projectId,
        client.id,
        createOrderModelData,
        showMessage
      )) as GenericResponse<{ id_order: number }>;

      if (response.status === 200) {
        router.push(`/comercio`);
      }
    } catch (error) {
      showMessage("error", "Error creating draft");
    }
    setLoading(false);
  };

  const onSubmitFinishOrder = async (data: IShippingInfoForm) => {
    setLoading(true);

    if (!client) {
      showMessage("error", "Cliente no encontrado");
      setLoading(false);
      return;
    }

    const indicative = data.indicative.label.split(" ")[0];
    const createOrderModelData = {
      shipping_information: {
        address: data.address,
        city: data.city.label,
        dispatch_address: data.address,
        email: data.email,
        phone_number: `${indicative}${data.phone}`,
        comments: data.comment,
        // Solo incluir id_address si NO es una nueva dirección
        ...(data.addresses.value !== NEW_ADDRESS_OPTION.value && {
          id: data.addresses.value
        })
      },
      order_summary: confirmOrderData
    };

    if (!!draftInfo?.id || (!!draftInfo.client_name && draftInfo.id !== undefined)) {
      const response = (await createOrderFromDraft(
        projectId,
        client.id,
        draftInfo.id,
        createOrderModelData,
        showMessage
      )) as GenericResponse<{ id_order: number }>;

      if (response.status === 200) {
        const url = `/comercio/pedidoConfirmado/${draftInfo.id}`;
        router.prefetch(url);
        router.push(url);
      }
      setLoading(false);
      return;
    }

    const response = await createOrder(projectId, client.id, createOrderModelData, showMessage);
    if (response.status === 200) {
      const queryParams = [];
      if (!response.data?.notificationId) {
        queryParams.push(`notification=${response.data.id_order}`);
      }
      const queryParamsString = queryParams.join("&");
      const url = `/comercio/pedidoConfirmado/${response.data.id_order}${queryParams.length > 0 ? `?${queryParamsString}` : ""}`;
      router.prefetch(url);
      router.push(url);
    }

    setLoading(false);
  };

  // Preparar opciones del select con "Nueva dirección" al principio
  const addressOptions = [
    NEW_ADDRESS_OPTION,
    ...addresses.map((address) => ({
      label: address.address,
      value: address.id
    }))
  ];

  return (
    <div className={styles.checkoutContainer}>
      <Button
        type="text"
        size="large"
        className={styles.buttonGoBack}
        icon={<CaretLeft size={"1.3rem"} />}
        onClick={handleGoBack}
      >
        Volver
      </Button>
      <h3 className={styles.title}>Confirma datos de envío</h3>

      <div className={styles.checkoutContainer__content}>
        <div className={styles.shippingInfo}>
          <Controller
            name="addresses"
            control={control}
            rules={{ required: true, minLength: 1 }}
            render={({ field }) => (
              <GeneralSelect
                errors={errors.addresses}
                field={field}
                title="Direcciones"
                placeholder="Seleccione una dirección"
                options={addressOptions}
                customStyleContainer={{ gridColumn: "1 / span 2" }}
              />
            )}
          />
          <Controller
            name="city"
            control={control}
            rules={
              isNewAddress
                ? {
                    required: "La ciudad es obligatoria",
                    minLength: {
                      value: 2,
                      message: "La ciudad debe tener al menos 2 caracteres"
                    }
                  }
                : undefined
            }
            render={({ field }) => (
              <SelectLocations errors={errors?.city} field={field} disabled={!isNewAddress} />
            )}
          />
          <InputForm
            readOnly={!isNewAddress}
            titleInput="Dirección de despacho"
            control={control}
            nameInput="address"
            error={errors.address}
            validationRules={
              isNewAddress
                ? {
                    required: "La dirección es obligatoria",
                    minLength: {
                      value: 5,
                      message: "La dirección debe tener al menos 5 caracteres"
                    }
                  }
                : undefined
            }
          />
          <InputForm titleInput="Email" control={control} nameInput="email" error={errors.email} />
          <Flex gap={"0.5rem"} align="flex-start">
            <Flex vertical>
              <p className={styles.inputLabel}>Indicativo</p>

              <Controller
                name="indicative"
                control={control}
                rules={{ required: "El indicativo es obligatorio" }}
                render={({ field }) => (
                  <SelectContactIndicative
                    errors={errors.indicative}
                    field={field}
                    readOnly={false}
                    className={styles.selectIndicative}
                    isColombia
                  />
                )}
              />
            </Flex>
            <InputForm
              titleInput="Teléfono de contacto"
              control={control}
              nameInput="phone"
              error={errors.phone}
              changeInterceptor={(value) => {
                // Eliminar caracteres no numéricos
                const numericValue = value.replace(/\D/g, "");
                // Limitar a 10 dígitos
                const truncatedValue = numericValue.slice(0, 10);
                // Actualizar el valor en el formulario
                setValue("phone", truncatedValue);
              }}
              validationRules={{
                required: "El teléfono es obligatorio",
                pattern: {
                  value: /^\d{10}$/,
                  message: "El teléfono debe tener exactamente 10 dígitos"
                }
              }}
              customStyle={{ width: "100%" }}
            />
          </Flex>
          <Controller
            name="comment"
            control={control}
            render={({ field }) => (
              <div className={styles.textArea}>
                <p className={styles.textArea__label}>Observaciones</p>
                <textarea
                  {...field}
                  placeholder="Ingresar un comentario"
                  style={errors.comment ? { borderColor: "red" } : {}}
                  maxLength={35}
                />
              </div>
            )}
          />
        </div>

        <div className={styles.discounts}>
          <h4 className={styles.discounts__title}>Seleccionar descuento a aplicar</h4>
          <div className={styles.radioGroup}>
            {discounts.map((discountPackage) => (
              <InputRadioRightSide
                key={discountPackage.id}
                value={discountPackage.id}
                customStyles={{ border: "2px solid #e0e0e0", borderRadius: "8px", padding: "1rem" }}
                onClick={() => handleRadioClick(discountPackage)}
                checked={
                  selectedDiscount &&
                  selectedDiscount.id === discountPackage.id &&
                  selectedDiscount.idAnnualDiscount === discountPackage.idAnnualDiscount
                }
              >
                <div className={styles.radioGroup__label}>
                  <p>{discountPackage.name}</p>
                </div>
              </InputRadioRightSide>
            ))}
          </div>
        </div>

        <Flex gap={"1rem"}>
          <AlternativeBlackButton
            onClick={handleSubmit(onSubmitSaveDraft)}
            fullWidth
            loading={loading}
            disabled={!!draftInfo?.id || !!draftInfo.client_name}
          >
            Guardar borrador
          </AlternativeBlackButton>
          <PrincipalButton
            onClick={handleSubmit(onSubmitFinishOrder)}
            fullWidth
            disabled={!isValid}
            loading={loading}
          >
            Finalizar pedido
          </PrincipalButton>
        </Flex>
      </div>
    </div>
  );
};

export default CreateOrderCheckout;

const shippingInfoToForm = (shippingInfo: IShippingInformation) => {
  // Extraer el indicativo y el número del phone_number
  const phoneMatch = shippingInfo.phone_number?.match(/^(\+\d{1,3})(\d+)$/);
  const indicative = phoneMatch ? phoneMatch[1] : "+57"; // Por defecto Colombia
  const phoneNumber = phoneMatch ? phoneMatch[2] : shippingInfo.phone_number;

  return {
    addresses: {
      label: shippingInfo.address,
      value: shippingInfo.address
    },
    city: {
      label: shippingInfo.city,
      value: shippingInfo.city
    },
    address: shippingInfo.address,
    email: shippingInfo.email,
    indicative: {
      label: indicative,
      value: indicative
    },
    phone: phoneNumber || "",
    comment: shippingInfo.comments
  };
};
