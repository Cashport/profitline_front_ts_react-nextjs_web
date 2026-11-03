import { useTranslations } from "use-intl";
import { useEffect, useState } from "react";
import { Button, ColorPicker, Flex, Input, Select, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { CaretLeft, CaretRight } from "phosphor-react";
import Link from "next/link";

// components
import { SelectCountries } from "@/components/molecules/selects/SelectCountries/SelectCountries";
import { SelectCurrencies } from "@/components/molecules/selects/SelectCurrencies/SelectCurrencies";
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";
import { IFormProject } from "@/types/projects/IFormProject";
import { UploadImg } from "@/components/atoms/UploadImg/UploadImg";

//interfaces
import { IProject } from "@/types/projects/IProject";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import "./projectformtab.scss";
import { ModalBillingPeriod } from "@/components/molecules/modals/ModalBillingPeriod/ModalBillingPeriod";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { GenerateActionButton } from "@/components/atoms/GenerateActionButton";
import { ModalGenerateActionProjectForm } from "@/components/molecules/modals/ModalGenerateActionProjectForm/ModalGenerateActionProjectForm";
import { ModalMonthlyClosing } from "@/components/molecules/modals/ModalMonthlyClosing/ModalMonthlyClosing";

import {
  _onSubmit,
  dataToProjectFormData,
  ProjectFormTabProps,
  effectFunction,
  validationButtonText
} from "./projectFormTab.mapper";

const { Title, Text } = Typography;
const { Option } = Select;

export const ProjectFormTab = ({
  onEditProject = () => {},
  onSubmitForm = async () => {},
  statusForm = "review",
  data = {} as IProject,
  onActiveProject = () => {},
  onDesactivateProject = () => {}
}: ProjectFormTabProps) => {
  const t = useTranslations("shared.projectForm");
  const tCommon = useTranslations("common");
  const [isOpenModal, setIsOpenModal] = useState({
    selected: 0
  });
  const [isBillingPeriodOpen, setIsBillingPeriodOpen] = useState(false);
  const [imageFile, setImageFile] = useState(data.LOGO);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<IBillingPeriodForm | undefined>();
  const defaultValues =
    statusForm === "create"
      ? {
          general: {
            otp_required: "No",
            otp_revalidation_days: 30,
            password_expiration_days: 90,
            trusted_devices_enabled: "No",
            trusted_device_days: 30
          }
        }
      : dataToProjectFormData(data);
  const {
    watch,
    setValue,
    control,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<IFormProject>({
    defaultValues,
    disabled: statusForm === "review"
  });

  const generalDSOCurrentlyYear = watch("general.DSO_currenly_year");
  const otpRequired = watch("general.otp_required");
  const trustedDevicesEnabled = watch("general.trusted_devices_enabled");
  useEffect(() => {
    if (data.BILLING_PERIOD_CONFIG) {
      setBillingPeriod(data.BILLING_PERIOD_CONFIG);
    }
  }, []);

  useEffect(
    () => effectFunction(generalDSOCurrentlyYear, setValue, billingPeriod),
    [billingPeriod, generalDSOCurrentlyYear, setValue]
  );

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await _onSubmit(data, setImageError, imageFile, onSubmitForm, reset);
      setLoading(false);
    } catch (error) {
      console.warn("error create project: ", error);
    }
  };

  const handleOpenModal = (type: number) => {
    setIsOpenModal({ selected: type });
  };

  return (
    <>
      <div className="mainProyectsForm">
        <Flex component={"header"} className="headerProyectsForm">
          <Link href="/settings">
            <Button
              type="text"
              size="large"
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              {t("viewProjects")}
            </Button>
          </Link>
          <Flex gap={"1rem"}>
            {(statusForm === "review" || statusForm === "edit") && (
              <GenerateActionButton
                onClick={() => {
                  setIsOpenModal({ selected: 1 });
                }}
              />
            )}
          </Flex>
        </Flex>
        <Flex component={"main"} flex="1" vertical>
          {/* ------------Image Project-------------- */}
          <UploadImg
            disabled={statusForm === "review"}
            imgDefault={`${data.LOGO?.trim()}?v=${new Date().getTime()}`}
            setImgFile={setImageFile}
          />
          {imageError && <Text className="textError">{t("logoRequired")}</Text>}
          {/* -----------------------------------General--------------------------------------- */}
          <Title className="title" level={4}>
            {t("generalInfo")}
          </Title>
          <Flex component={"section"} className="generalProject" justify="flex-start">
            <InputForm
              titleInput={t("projectName")}
              nameInput="general.name"
              control={control}
              error={errors.general?.name}
            />
            <InputForm
              titleInput={tCommon("fields.taxId")}
              nameInput="general.nit"
              control={control}
              error={errors.general?.nit}
            />
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                {t("currencies")}
              </Title>
              <Controller
                name="general.currencies"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <SelectCurrencies errors={errors} field={field} />}
              />
              <Text className="textError">
                {errors?.general?.currencies && t("currencyRequired")}
              </Text>
            </Flex>
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                {t("country")}
              </Title>
              <Controller
                name="general.country"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <SelectCountries errors={errors} field={field} />}
              />
              <Text className="textError">{errors?.general?.country && t("countryRequired")}</Text>
            </Flex>
            <InputForm
              titleInput={t("address")}
              nameInput="general.address"
              control={control}
              error={errors.general?.address}
            />
            <Flex className="containerInput" vertical style={{ width: "24.5%" }} justify="center">
              <Title className="title" level={5}>
                {t("billingPeriod")}
              </Title>
              <Controller
                name="general.billing_period"
                control={control}
                rules={{ required: true, minLength: 1 }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input
                      readOnly
                      addonAfter={<CaretRight size={"16px"} />}
                      disabled={statusForm === "review"}
                      variant="borderless"
                      className={error ? "inputError" : "input"}
                      placeholder={t("billingPeriodPlaceholder")}
                      onClick={() => setIsBillingPeriodOpen(true)}
                      {...field}
                      value={
                        billingPeriod
                          ? billingPeriod.day_flag === "true"
                            ? t("billingDayOfMonth", { day: billingPeriod.day ?? "" })
                            : t("billingWeekdayOfMonth", {
                                order: billingPeriod.order ?? "",
                                dayOfWeek: billingPeriod.day_of_week ?? ""
                              })
                          : data.BILLING_PERIOD
                            ? data.BILLING_PERIOD
                            : undefined
                      }
                    />
                    {error && (
                      <Typography.Text className="textError">
                        {t("billingPeriodRequired")}
                      </Typography.Text>
                    )}
                  </>
                )}
              />
            </Flex>

            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                {t("invoiceValidityDate")}
              </Title>
              <Controller
                name="general.accept_date"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      placeholder={t("acceptanceDate")}
                      className={errors?.general?.accept_date ? "selectInputError" : "selectInput"}
                      loading={false}
                      variant="borderless"
                      optionLabelProp="label"
                      {...field}
                    >
                      <Option value={`Fecha de aceptación`} key={1} label={t("acceptanceDate")}>
                        {t("acceptanceDate")}
                      </Option>
                      <Option value={`Fecha de emisión`} key={2} label={t("issueDate")}>
                        {t("issueDate")}
                      </Option>
                    </Select>
                  );
                }}
              />
              <Text className="textError">
                {errors?.general?.accept_date && t("requiredField")}
              </Text>
            </Flex>
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                {t("dsoCurrentYearOnly")}
              </Title>
              <Controller
                name="general.DSO_currenly_year"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      placeholder={t("yesNoPlaceholder")}
                      className={
                        errors?.general?.DSO_currenly_year ? "selectInputError" : "selectInput"
                      }
                      loading={false}
                      variant="borderless"
                      optionLabelProp="label"
                      {...field}
                    >
                      <Option value={`Sí`} key={1} label={tCommon("status.yes")}>
                        {tCommon("status.yes")}
                      </Option>
                      <Option value={`No`} key={2} label={tCommon("status.no")}>
                        {tCommon("status.no")}
                      </Option>
                    </Select>
                  );
                }}
              />
              <Text className="textError">
                {errors?.general?.DSO_currenly_year && t("requiredField")}
              </Text>
            </Flex>
            <InputForm
              disabled={generalDSOCurrentlyYear === "Sí"}
              titleInput={t("dsoSalesDays")}
              nameInput="general.DSO_days"
              typeInput="number"
              validationRules={{
                required: generalDSOCurrentlyYear === "Sí" ? false : t("requiredField"),
                min: {
                  value: 1,
                  message: t("minValue")
                }
              }}
              control={control}
              error={errors.general?.DSO_days}
            />
          </Flex>

          {/* -----------------------------------Seguridad----------------------------------- */}
          <Title className="title" level={4}>
            {t("security")}
          </Title>
          <Flex component={"section"} className="generalProject" justify="flex-start">
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                {t("otpRequired")}
              </Title>
              <Controller
                name="general.otp_required"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      placeholder={t("yesNoPlaceholder")}
                      className={errors?.general?.otp_required ? "selectInputError" : "selectInput"}
                      loading={false}
                      variant="borderless"
                      optionLabelProp="label"
                      {...field}
                    >
                      <Option value={`Sí`} key={1} label={tCommon("status.yes")}>
                        {tCommon("status.yes")}
                      </Option>
                      <Option value={`No`} key={2} label={tCommon("status.no")}>
                        {tCommon("status.no")}
                      </Option>
                    </Select>
                  );
                }}
              />
              <Text className="textError">
                {errors?.general?.otp_required && t("requiredField")}
              </Text>
            </Flex>
            <InputForm
              disabled={otpRequired !== "Sí"}
              titleInput={t("otpRevalidationDays")}
              nameInput="general.otp_revalidation_days"
              typeInput="number"
              validationRules={{
                required: otpRequired === "Sí" ? t("requiredField") : false,
                min: {
                  value: 1,
                  message: t("minValue")
                }
              }}
              control={control}
              error={errors.general?.otp_revalidation_days}
            />
            <InputForm
              titleInput={t("passwordExpirationDays")}
              nameInput="general.password_expiration_days"
              typeInput="number"
              validationRules={{
                required: t("requiredField"),
                min: {
                  value: 1,
                  message: t("minValue")
                }
              }}
              control={control}
              error={errors.general?.password_expiration_days}
            />
          </Flex>
          <Flex component={"section"} className="generalProject" justify="flex-start">
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                {t("trustedDevicesEnabled")}
              </Title>
              <Controller
                name="general.trusted_devices_enabled"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      placeholder={t("yesNoPlaceholder")}
                      className={
                        errors?.general?.trusted_devices_enabled
                          ? "selectInputError"
                          : "selectInput"
                      }
                      loading={false}
                      variant="borderless"
                      optionLabelProp="label"
                      disabled={otpRequired !== "Sí"}
                      {...field}
                    >
                      <Option value={`Sí`} key={1} label={tCommon("status.yes")}>
                        {tCommon("status.yes")}
                      </Option>
                      <Option value={`No`} key={2} label={tCommon("status.no")}>
                        {tCommon("status.no")}
                      </Option>
                    </Select>
                  );
                }}
              />
              <Text className="textError">
                {errors?.general?.trusted_devices_enabled && t("requiredField")}
              </Text>
            </Flex>
            <InputForm
              disabled={otpRequired !== "Sí" || trustedDevicesEnabled !== "Sí"}
              titleInput={t("trustedDeviceDays")}
              nameInput="general.trusted_device_days"
              typeInput="number"
              validationRules={{
                required:
                  otpRequired === "Sí" && trustedDevicesEnabled === "Sí"
                    ? t("requiredField")
                    : false,
                min: {
                  value: 1,
                  message: t("minValue")
                }
              }}
              control={control}
              error={errors.general?.trusted_device_days}
            />
          </Flex>

          {/* -----------------------------------Contact----------------------------------- */}
          <Title className="title" level={4}>
            {t("contactInfo")}
          </Title>
          <Flex component={"section"} className="generalProject" justify="flex-start">
            <InputForm
              titleInput={tCommon("fields.name")}
              nameInput="contact.name"
              control={control}
              error={errors.contact?.name}
            />
            <InputForm
              typeInput="cargo"
              titleInput={t("position")}
              nameInput="contact.position_contact"
              control={control}
              error={errors.contact?.position_contact}
            />
            <InputForm
              typeInput="email"
              titleInput={t("email")}
              nameInput="contact.email"
              control={control}
              error={errors.contact?.email}
            />
            <InputForm
              typeInput="tel"
              titleInput={tCommon("fields.phone")}
              nameInput="contact.phone"
              control={control}
              error={errors.contact?.phone}
              validationRules={{
                pattern: {
                  value: /^\+?\d+$/,
                  message: t("phonePattern")
                }
              }}
            />
          </Flex>
          {/* -----------------------------------Project Config----------------------------------- */}
          <Title className="title" level={4}>
            {t("customizeProject")}
          </Title>
          <Flex component={"section"} className="generalProject" justify="flex-start">
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                {t("customColor")}
              </Title>
              <Controller
                name="personalization.color"
                rules={{ required: true, maxLength: 123 }}
                control={control}
                render={({ field }) => <ColorPicker format="rgb" showText {...field} />}
              />
              <Text className="textError">
                {errors?.personalization?.color && t("customColorRequired")}
              </Text>
            </Flex>
            <InputForm
              typeInput="personalization.description"
              titleInput={tCommon("fields.description")}
              nameInput="personalization.description"
              className="description"
              control={control}
              error={errors.personalization?.description}
            />
          </Flex>
          <Flex className="buttonNewProject">
            {["edit", "create"].includes(statusForm) && (
              <PrincipalButton disabled={loading} onClick={handleSubmit(onSubmit)}>
                {t(`submit.${validationButtonText(statusForm)}`)}
              </PrincipalButton>
            )}
          </Flex>
        </Flex>
      </div>
      <ModalBillingPeriod
        isOpen={isBillingPeriodOpen}
        setIsBillingPeriodOpen={setIsBillingPeriodOpen}
        setBillingPeriod={setBillingPeriod}
        billingPeriod={data.BILLING_PERIOD_CONFIG}
      />
      <ModalGenerateActionProjectForm
        isOpen={isOpenModal.selected === 1}
        onClose={() => setIsOpenModal({ selected: 0 })}
        handleOpenModal={handleOpenModal}
        handleEditProject={onEditProject}
        statusForm={statusForm}
      />
      <ModalChangeStatus
        isActiveStatus={data?.IS_ACTIVE!}
        isOpen={isOpenModal.selected === 2}
        onClose={() => setIsOpenModal({ selected: 0 })}
        onActive={onActiveProject}
        onDesactivate={onDesactivateProject}
      />
      <ModalMonthlyClosing
        isOpen={isOpenModal.selected === 3}
        onClose={() => setIsOpenModal({ selected: 0 })}
      />
    </>
  );
};
