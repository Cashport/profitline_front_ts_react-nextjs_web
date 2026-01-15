import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { parsePhoneNumberWithError } from "libphonenumber-js";
import { Controller, useForm } from "react-hook-form";
import { Flex, Modal, Select, Typography, message } from "antd";

import { getWhatsappClients } from "@/services/chat/clients";
import { postContact } from "@/services/contacts/contacts";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { SelectContactRole } from "@/components/molecules/selects/contacts/SelectContactRole";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { SelectContactIndicative } from "@/components/molecules/selects/contacts/SelectContactIndicative";

import { IAddClientForm } from "@/types/chat/IChat";
import { ICreateEditContact, IResponseContactOptions } from "@/types/contacts/IContacts";

import "./addClientModal.scss";
import { ApiError, fetcher } from "@/utils/api/api";
import useSWR from "swr";
import { useContactModalOptions } from "@/hooks/useContactModalOptions";

interface PropsInvoicesTable {
  showAddClientModal: boolean;
  setShowAddClientModal: Dispatch<SetStateAction<boolean>>;
  isActionLoading: boolean;
  initialName?: string;
  initialPhone?: string;
}

const AddClientModal = ({
  showAddClientModal,
  setShowAddClientModal,
  isActionLoading,
  initialName,
  initialPhone
}: PropsInvoicesTable) => {
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);
  const { callingCodeOptions, roleOptions, isLoading } = useContactModalOptions();

  const initialPhoneData = extractNationalNumber(initialPhone, callingCodeOptions);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid }
  } = useForm<IAddClientForm>({
    mode: "onChange",
    defaultValues: {
      name: initialName || "",
      phone: initialPhoneData.phone,
      indicative: initialPhoneData.indicative,
      client: undefined
    }
  });

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await getWhatsappClients();
        const formatted = res.map((c) => ({ id: c.uuid, name: c.client_name }));
        setClients(formatted);
      } catch (error) {
        console.error("Error fetching WhatsApp clients:", error);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    if (!showAddClientModal) {
      reset();
    }
  }, [showAddClientModal, reset]);

  useEffect(() => {
    if (showAddClientModal && (initialName || initialPhone)) {
      const phoneData = extractNationalNumber(initialPhone, callingCodeOptions);
      reset({
        name: initialName || "",
        phone: phoneData.phone,
        indicative: phoneData.indicative,
        client: undefined
      });
    }
  }, [showAddClientModal, initialName, initialPhone, reset]);

  const onSubmitForm = async (data: IAddClientForm) => {
    try {
      const body: ICreateEditContact = {
        clientUUID: String(data.client.value),
        contact_name: data.name,
        contact_lastname: data.lastname ?? "",
        contact_email: data.email,
        contact_phone: data.phone,
        position: Number(data.role.value),
        name_position: data.position,
        country_calling_code_id: Number(data.indicative.value)
      };

      await postContact(body);

      message.success("Cliente agregado exitosamente");
      setShowAddClientModal(false);
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(error.message);
      } else {
        message.error("Error al agregar el cliente");
      }
      console.error("Error submitting form:", error);
    }
  };

  const filterOption = (input: string, option?: { label: string; value: string }) => {
    return option?.label.toLowerCase().includes(input.toLowerCase()) ?? false;
  };

  return (
    <Modal
      destroyOnClose
      open={showAddClientModal}
      className="AddClientModalContainer"
      footer={false}
      onCancel={() => {
        setShowAddClientModal(false);
      }}
    >
      <Flex vertical gap={24}>
        <div className="AddClientModalContainer__header">
          <h2 className="AddClientModalContainer__header__title">Agregar cliente</h2>
          <p className="AddClientModalContainer__header__info">
            Ingresa la información del nuevo cliente.
          </p>
        </div>

        <div className="AddClientModalContainer__content">
          <InputForm titleInput="Nombres" control={control} nameInput="name" error={errors.name} />
          <InputForm
            titleInput="Apellidos"
            control={control}
            nameInput="lastname"
            error={errors.lastname}
            validationRules={{ required: false }}
          />
          <InputForm
            titleInput="Cargo"
            control={control}
            nameInput="position"
            error={errors.position}
          />
          <div className="inputContainer">
            <h5 className="inputContainer__title">Rol</h5>
            <Controller
              name="role"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectContactRole
                  errors={errors.role}
                  field={field}
                  options={roleOptions}
                  isLoading={isLoading}
                />
              )}
            />
          </div>
          <div className="inputContainer">
            <h5 className="inputContainer__title">Indicativo</h5>
            <Controller
              name="indicative"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectContactIndicative
                  errors={errors.indicative}
                  field={field}
                  options={callingCodeOptions}
                  isLoading={isLoading}
                />
              )}
            />
          </div>
          <InputForm
            titleInput="Teléfono"
            control={control}
            nameInput="phone"
            error={errors.phone}
            typeInput="number"
            validationRules={{
              validate: (value, formValues) => {
                const isColombia = formValues.indicative?.value === 1;

                if (isColombia) {
                  return /^\d{10}$/.test(value) || "El teléfono debe tener 10 dígitos";
                }
                return /^\d{7,12}$/.test(value) || "El teléfono debe tener entre 7 y 12 dígitos";
              }
            }}
          />
          <InputForm
            titleInput="Email"
            control={control}
            nameInput="email"
            error={errors.email}
            typeInput="email"
            validationRules={{
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: "El email no es válido"
              }
            }}
          />
          <div className="inputContainer">
            <h5 className="inputContainer__title">Cliente</h5>
            <Controller
              name="client"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <>
                  <Select
                    showSearch
                    placeholder="Seleccione cliente"
                    className={errors.client ? "selectInputError" : "selectInputCustom"}
                    variant="borderless"
                    optionLabelProp="label"
                    {...field}
                    popupClassName="selectDrop"
                    options={clients.map((client) => ({
                      label: client.name,
                      value: client.id,
                      className: "selectOptions"
                    }))}
                    labelInValue
                    allowClear
                    filterOption={filterOption}
                  />
                  {errors.client && (
                    <Typography.Text className="textError">
                      El cliente es obligatorio *
                    </Typography.Text>
                  )}
                </>
              )}
            />
          </div>
        </div>
        <div className="AddClientModalContainer__footer">
          <>
            <SecondaryButton
              onClick={() => {
                setShowAddClientModal(false);
              }}
            >
              Cancelar
            </SecondaryButton>
            <PrincipalButton
              disabled={!isValid}
              onClick={handleSubmit(onSubmitForm)}
              loading={isActionLoading}
            >
              Agregar
            </PrincipalButton>
          </>
        </div>
      </Flex>
    </Modal>
  );
};

export default AddClientModal;

/**
 * Parsea un número telefónico internacional y extrae el número nacional
 * @param internationalPhone - Teléfono en formato internacional (ej: "+573001234567")
 * @returns El número nacional o vacío si falla el parseo
 */
function extractNationalNumber(
  internationalPhone: string | undefined,
  indicativeOptions: { value: string | number; label: string }[] = []
): { phone: string; indicative: { value: string | number; label: string } } {
  const defaultIndicative = { value: "1", label: "+57" };

  if (!internationalPhone || internationalPhone.trim() === "") {
    return { phone: "", indicative: defaultIndicative };
  }

  const formattedNumber = internationalPhone.startsWith("+")
    ? internationalPhone
    : `+${internationalPhone}`;

  try {
    const phoneNumber = parsePhoneNumberWithError(formattedNumber);

    if (!phoneNumber || !phoneNumber.isValid()) {
      return { phone: "", indicative: defaultIndicative };
    }

    const countryCallingCode = phoneNumber.countryCallingCode;
    const matchingOption = indicativeOptions.find((option) =>
      option.label.includes(`+${countryCallingCode}`)
    );

    return {
      phone: phoneNumber.nationalNumber,
      indicative: matchingOption || defaultIndicative
    };
  } catch (error) {
    console.error("Error parseando número de teléfono:", error);
    return { phone: "", indicative: defaultIndicative };
  }
}
