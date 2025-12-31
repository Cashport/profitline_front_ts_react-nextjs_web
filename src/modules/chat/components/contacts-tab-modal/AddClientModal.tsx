import { Dispatch, SetStateAction } from "react";
import { Flex, Modal } from "antd";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { Controller, useForm } from "react-hook-form";
import { SelectContactRole } from "@/components/molecules/selects/contacts/SelectContactRole";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { SelectContactIndicative } from "@/components/molecules/selects/contacts/SelectContactIndicative";

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
  console.log("initialPhone", initialPhone);
  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IAddClientForm>({
    mode: "onChange",
    defaultValues: {
      name: initialName || "",
      phone: initialPhone || "",
      indicative: { value: 57, label: "+57" }
    }
  });

  const onSubmitForm = async (data: IAddClientForm) => {
    console.log("Form data submitted:", data);

    // setShowAddClientModal({ isOpen: false, contactId: 0 });
  };

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
