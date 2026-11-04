import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Flex, Modal } from "antd";
import { useTranslations } from "use-intl";
import { IContact, IContactForm } from "@/types/contacts/IContacts";
import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { Controller, useForm } from "react-hook-form";
import { SelectContactRole } from "@/components/molecules/selects/contacts/SelectContactRole";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { SelectContactIndicative } from "@/components/molecules/selects/contacts/SelectContactIndicative";
import { MessageType, useMessageApi } from "@/context/MessageContext";
import { getContact } from "@/services/contacts/contacts";
import "./contacts-tab-modal.scss";
import { useContactModalOptions } from "@/hooks/useContactModalOptions";

type showContactModalType = {
  isOpen: boolean;
  contactId: number;
};

interface PropsInvoicesTable {
  showContactModal: showContactModalType;
  setShowContactModal: Dispatch<SetStateAction<showContactModalType>>;
  createContact: (
    // eslint-disable-next-line no-unused-vars
    contactInfo: IContactForm,
    // eslint-disable-next-line no-unused-vars
    showMessage: (type: MessageType, content: string) => void
  ) => Promise<boolean>;
  updateContact: (
    // eslint-disable-next-line no-unused-vars
    contactInfo: IContactForm,
    // eslint-disable-next-line no-unused-vars
    contactId: number,
    // eslint-disable-next-line no-unused-vars
    showMessage: (type: MessageType, content: string) => void
  ) => Promise<boolean>;
  clientId: string;
  isActionLoading: boolean;
}

const ContactsTabModal = ({
  showContactModal,
  setShowContactModal,
  createContact,
  updateContact,
  clientId,
  isActionLoading
}: PropsInvoicesTable) => {
  const t = useTranslations("clients.contacts.modal");
  const tCommon = useTranslations("common");
  const { showMessage } = useMessageApi();
  const [ableToEdit, setAbleToEdit] = useState(false);
  const [contactDetails, setContactDetails] = useState<IContact>();
  console.log("contactDetails", contactDetails);
  const { callingCodeOptions, roleOptions, isLoading } = useContactModalOptions();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<IContactForm>({
    mode: "onChange",
    values: contactDetails ? dataToForm(contactDetails) : undefined
  });

  useEffect(() => {
    if (!showContactModal.contactId) {
      setAbleToEdit(true);
    }
    const fetchData = async () => {
      if (showContactModal.contactId) {
        const response = await getContact(clientId, showContactModal.contactId);
        setContactDetails(response.data[0]);
      }
    };

    fetchData();
  }, [showContactModal.contactId]);

  const onSubmitForm = async (data: IContactForm) => {
    if (showContactModal.contactId) {
      const success = await updateContact(data, showContactModal.contactId, showMessage);
      if (!success) return;
    } else {
      const success = await createContact(data, showMessage);
      if (!success) return;
    }

    setShowContactModal({ isOpen: false, contactId: 0 });
  };

  return (
    <Modal
      width={"50%"}
      destroyOnClose
      open={showContactModal.isOpen}
      className="contactModalContainer"
      footer={false}
      onCancel={() => {
        setShowContactModal({ isOpen: false, contactId: 0 });
      }}
    >
      <Flex vertical gap={24}>
        <div className="contactModalContainer__header">
          <h2 className="contactModalContainer__header__title">
            {showContactModal.contactId ? t("titleEdit") : t("titleCreate")}
          </h2>
          <p className="contactModalContainer__header__info">
            {showContactModal.contactId ? t("infoEdit") : t("infoCreate")}
          </p>
        </div>

        <div className="contactModalContainer__content">
          <InputForm
            titleInput={t("firstNames")}
            control={control}
            nameInput="name"
            error={errors.name}
            readOnly={!ableToEdit}
          />
          <InputForm
            titleInput={t("lastNames")}
            control={control}
            nameInput="lastname"
            error={errors.lastname}
            readOnly={!ableToEdit}
          />
          <InputForm
            titleInput={t("position")}
            control={control}
            nameInput="position"
            error={errors.position}
            readOnly={!ableToEdit}
          />
          <div className="inputContainer">
            <h5 className="inputContainer__title">{t("role")}</h5>
            <Controller
              name="role"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectContactRole
                  errors={errors.role}
                  field={field}
                  readOnly={!ableToEdit}
                  options={roleOptions}
                  isLoading={isLoading}
                />
              )}
            />
          </div>
          <div className="inputContainer">
            <h5 className="inputContainer__title">{t("callingCode")}</h5>
            <Controller
              name="indicative"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <SelectContactIndicative
                  errors={errors.indicative}
                  field={field}
                  readOnly={!ableToEdit}
                  options={callingCodeOptions}
                  isLoading={isLoading}
                />
              )}
            />
          </div>
          <InputForm
            titleInput={tCommon("fields.phone")}
            control={control}
            nameInput="phone"
            error={errors.phone}
            readOnly={!ableToEdit}
            typeInput="number"
            validationRules={{
              validate: (value, formValues) => {
                const isColombia = formValues.indicative?.value === 1;

                if (isColombia) {
                  return /^\d{10}$/.test(value) || t("phoneExactDigits", { digits: 10 });
                }
                return /^\d{7,12}$/.test(value) || t("phoneDigitsRange", { min: 7, max: 12 });
              }
            }}
          />
          <InputForm
            titleInput={t("email")}
            control={control}
            nameInput="email"
            error={errors.email}
            readOnly={!ableToEdit}
            typeInput="email"
            validationRules={{
              pattern: {
                value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                message: t("invalidEmail")
              }
            }}
          />
        </div>

        <div className="contactModalContainer__footer">
          {ableToEdit ? (
            <>
              <SecondaryButton
                onClick={() => {
                  if (!showContactModal.contactId) {
                    setShowContactModal({ isOpen: false, contactId: 0 });
                  } else {
                    setAbleToEdit(false);
                  }
                }}
              >
                {tCommon("actions.cancel")}
              </SecondaryButton>
              <PrincipalButton
                disabled={!isValid}
                onClick={handleSubmit(onSubmitForm)}
                loading={isActionLoading}
              >
                {showContactModal.contactId ? tCommon("actions.saveChanges") : t("createContact")}
              </PrincipalButton>
            </>
          ) : (
            <>
              <SecondaryButton
                onClick={() => setShowContactModal({ isOpen: false, contactId: 0 })}
                disabled={isActionLoading}
              >
                {tCommon("actions.cancel")}
              </SecondaryButton>
              <PrincipalButton onClick={() => setAbleToEdit(true)}>
                {tCommon("actions.edit")}
              </PrincipalButton>
            </>
          )}
        </div>
      </Flex>
    </Modal>
  );
};

export default ContactsTabModal;

const dataToForm = (data: IContact): IContactForm => {
  return {
    name: data.contact_name,
    lastname: data.contact_lastname,
    position: data.name_position,
    role: { label: data.contact_position, value: data.contact_position_id },
    indicative: {
      label: `${data.country_calling_code} ${data.country_name}`,
      value: data.country_calling_code_id
    },
    phone: data.contact_phone,
    email: data.contact_email
  };
};
