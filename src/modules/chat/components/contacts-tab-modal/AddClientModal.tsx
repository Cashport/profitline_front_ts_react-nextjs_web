import { Dispatch, SetStateAction } from "react";
import { Flex, Modal, Select, Typography } from "antd";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { Controller, useForm } from "react-hook-form";
import { SelectContactRole } from "@/components/molecules/selects/contacts/SelectContactRole";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { SelectContactIndicative } from "@/components/molecules/selects/contacts/SelectContactIndicative";
import { parsePhoneNumberWithError } from "libphonenumber-js";

import { IAddClientForm } from "@/types/chat/IChat";

import "./addClientModal.scss";

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
  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IAddClientForm>({
    mode: "onChange",
    defaultValues: {
      name: initialName || "",
      phone: extractNationalNumber(initialPhone),
      indicative: { value: 57, label: "+57" },
      client: undefined
    }
  });

  const onSubmitForm = async (data: IAddClientForm) => {
    console.log("Form data submitted:", data);

    // setShowAddClientModal({ isOpen: false, contactId: 0 });
  };

  const clientOptions = mockClients.map((client) => ({
    value: client.id,
    label: client.name,
    className: "selectOptions"
  }));

  return (
    <Modal
      width={"50%"}
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
              render={({ field }) => <SelectContactRole errors={errors.role} field={field} />}
            />
          </div>
          <div className="inputContainer">
            <h5 className="inputContainer__title">Indicativo</h5>
            <Controller
              name="indicative"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectContactIndicative errors={errors.indicative} field={field} />
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
              pattern: {
                value: /^\d{10}$/,
                message: "El teléfono debe tener 10 dígitos"
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
                    placeholder="Seleccione cliente"
                    className={errors.client ? "selectInputError" : "selectInputCustom"}
                    variant="borderless"
                    optionLabelProp="label"
                    {...field}
                    popupClassName="selectDrop"
                    options={clientOptions}
                    labelInValue
                    allowClear
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
function extractNationalNumber(internationalPhone: string | undefined): string {
  if (!internationalPhone || internationalPhone.trim() === "") {
    return "";
  }

  try {
    const phoneNumber = parsePhoneNumberWithError(internationalPhone);

    if (!phoneNumber || !phoneNumber.isValid()) {
      return "";
    }

    // Usar phoneNumber.nationalNumber directamente
    return phoneNumber.nationalNumber;
  } catch (error) {
    console.error("Error parseando número de teléfono:", error);
    return "";
  }
}

const mockClients = [
  { id: 1, name: "Cliente A" },
  { id: 2, name: "Cliente B" },
  { id: 3, name: "Cliente C" }
];
