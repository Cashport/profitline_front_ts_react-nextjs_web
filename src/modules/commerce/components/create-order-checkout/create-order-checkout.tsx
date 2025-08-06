import { FC, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Flex } from "antd";
import { CaretLeft } from "phosphor-react";
import { OrderViewContext } from "../../containers/create-order/create-order";
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

interface IShippingInfoForm {
  addresses: {
    value: string;
    label: string;
  };
  city: string;
  address: string;
  email: string;
  phone: string;
  comment: string;
}

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
    const selectedAddress =
      watchSelectAddress &&
      addresses.find((address) => address.address === watchSelectAddress.label);
    if (!selectedAddress) return;
    setValue("city", selectedAddress?.city);
    setValue("address", selectedAddress?.address);
    setValue("email", selectedAddress?.email);
  }, [watchSelectAddress]);

  useEffect(() => {
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
        city: data.city,
        dispatch_address: data.address,
        email: data.email,
        phone_number: data.phone,
        comments: data.comment
      },
      order_summary: confirmOrderData
    };

    const response = (await createDraft(
      projectId,
      client.id,
      createOrderModelData,
      showMessage
    )) as GenericResponse<{ id_order: number }>;

    if (response.status === 200) {
      router.push(`/comercio`);
    }
    setLoading(false);
  };

  const onSubmitFinishOrder = async (data: IShippingInfoForm) => {
    setLoading(true);
    const createOrderModelData = {
      shipping_information: {
        address: data.address,
        city: data.city,
        dispatch_address: data.address,
        email: data.email,
        phone_number: data.phone,
        comments: data.comment
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
      const url = `/comercio/pedidoConfirmado/${response.data.id_order}?notification=${response.data.notificationId}`;
      router.prefetch(url);
      router.push(url);
    }

    setLoading(false);
  };

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
                options={addresses?.map((address) => address.address)}
                customStyleContainer={{ gridColumn: "1 / span 2" }}
              />
            )}
          />
          <InputForm
            readOnly={true}
            titleInput="Ciudad"
            control={control}
            nameInput="city"
            error={errors.city}
          />
          <InputForm
            readOnly={true}
            titleInput="Dirección de despacho"
            control={control}
            nameInput="address"
            error={errors.address}
          />
          <InputForm
            readOnly={true}
            titleInput="Email"
            control={control}
            nameInput="email"
            error={errors.email}
          />
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
          />
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
  return {
    addresses: {
      label: shippingInfo.address,
      value: shippingInfo.address
    },
    city: shippingInfo.city,
    address: shippingInfo.address,
    email: shippingInfo.email,
    phone: shippingInfo.phone_number,
    comment: shippingInfo.comments
  };
};
