import { useEffect, useState } from "react";
import { Button, ColorPicker, Flex, Input, Select, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, CaretRight, Pencil } from "phosphor-react";
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
  const [isOpenModal, setIsOpenModal] = useState({
    selected: 0
  });
  const [isBillingPeriodOpen, setIsBillingPeriodOpen] = useState(false);
  const [imageFile, setImageFile] = useState(data.LOGO);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState<IBillingPeriodForm | undefined>();
  const defaultValues = statusForm === "create" ? {} : dataToProjectFormData(data);
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
              Ver Proyectos
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
          {imageError && <Text className="textError">{"Logo del proyecto es obligatorio *"}</Text>}
          {/* -----------------------------------General--------------------------------------- */}
          <Title className="title" level={4}>
            Informacion General
          </Title>
          <Flex component={"section"} className="generalProject" justify="flex-start">
            <InputForm
              titleInput="Nombre del Proyecto"
              nameInput="general.name"
              control={control}
              error={errors.general?.name}
            />
            <InputForm
              titleInput="NIT"
              nameInput="general.nit"
              control={control}
              error={errors.general?.nit}
            />
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                Divisas
              </Title>
              <Controller
                name="general.currencies"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <SelectCurrencies errors={errors} field={field} />}
              />
              <Text className="textError">
                {errors?.general?.currencies && "Divisa es obligatorio *"}
              </Text>
            </Flex>
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                País
              </Title>
              <Controller
                name="general.country"
                control={control}
                rules={{ required: true }}
                render={({ field }) => <SelectCountries errors={errors} field={field} />}
              />
              <Text className="textError">
                {errors?.general?.country && "Pais es obligatorio *"}
              </Text>
            </Flex>
            <InputForm
              titleInput="Direccion"
              nameInput="general.address"
              control={control}
              error={errors.general?.address}
            />
            <Flex className="containerInput" vertical style={{ width: "24.5%" }} justify="center">
              <Title className="title" level={5}>
                Período de facturación
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
                      placeholder="Segundo miércoles del mes"
                      onClick={() => setIsBillingPeriodOpen(true)}
                      {...field}
                      value={
                        billingPeriod
                          ? billingPeriod.day_flag === "true"
                            ? `El dia ${billingPeriod.day} del mes`
                            : `El ${billingPeriod.order} ${billingPeriod.day_of_week} del mes`
                          : data.BILLING_PERIOD
                            ? data.BILLING_PERIOD
                            : undefined
                      }
                    />
                    {error && (
                      <Typography.Text className="textError">
                        El Periodo de facturacion es obligatorio *
                      </Typography.Text>
                    )}
                  </>
                )}
              />
            </Flex>

            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                Fecha de vigencia de factura
              </Title>
              <Controller
                name="general.accept_date"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      placeholder="Fecha de aceptación"
                      className={errors?.general?.accept_date ? "selectInputError" : "selectInput"}
                      loading={false}
                      variant="borderless"
                      optionLabelProp="label"
                      {...field}
                    >
                      <Option value={`Fecha de aceptación`} key={1}>
                        Fecha de aceptación
                      </Option>
                      <Option value={`Fecha de emisión`} key={2}>
                        Fecha de emisión
                      </Option>
                    </Select>
                  );
                }}
              />
              <Text className="textError">
                {errors?.general?.accept_date && "Campo obligatorio *"}
              </Text>
            </Flex>
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                DSO - Calculo solo del año actual
              </Title>
              <Controller
                name="general.DSO_currenly_year"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  return (
                    <Select
                      placeholder="Si | No"
                      className={
                        errors?.general?.DSO_currenly_year ? "selectInputError" : "selectInput"
                      }
                      loading={false}
                      variant="borderless"
                      optionLabelProp="label"
                      {...field}
                    >
                      <Option value={`Sí`} key={1}>
                        {`Sí`}
                      </Option>
                      <Option value={`No`} key={2}>
                        {`No`}
                      </Option>
                    </Select>
                  );
                }}
              />
              <Text className="textError">
                {errors?.general?.DSO_currenly_year && "Campo obligatorio *"}
              </Text>
            </Flex>
            <InputForm
              disabled={generalDSOCurrentlyYear === "Sí"}
              titleInput="DSO - Días de ventas para el cálculo"
              nameInput="general.DSO_days"
              typeInput="number"
              validationRules={{
                required: generalDSOCurrentlyYear === "Sí" ? false : "Campo obligatorio *",
                min: {
                  value: 1,
                  message: "El valor debe ser mayor que 1"
                }
              }}
              control={control}
              error={errors.general?.DSO_days}
            />
          </Flex>

          {/* -----------------------------------Contact----------------------------------- */}
          <Title className="title" level={4}>
            Informacion de Contacto
          </Title>
          <Flex component={"section"} className="generalProject" justify="flex-start">
            <InputForm
              titleInput="Nombre"
              nameInput="contact.name"
              control={control}
              error={errors.contact?.name}
            />
            <InputForm
              typeInput="cargo"
              titleInput="Cargo"
              nameInput="contact.position_contact"
              control={control}
              error={errors.contact?.position_contact}
            />
            <InputForm
              typeInput="email"
              titleInput="Correo"
              nameInput="contact.email"
              control={control}
              error={errors.contact?.email}
            />
            <InputForm
              typeInput="tel"
              titleInput="Telefono"
              nameInput="contact.phone"
              control={control}
              error={errors.contact?.phone}
              validationRules={{
                pattern: {
                  value: /^\+?\d+$/,
                  message: "Solo se permiten números y un signo '+' al comienzo"
                }
              }}
            />
          </Flex>
          {/* -----------------------------------Project Config----------------------------------- */}
          <Title className="title" level={4}>
            Personalizar Proyecto
          </Title>
          <Flex component={"section"} className="generalProject" justify="flex-start">
            <Flex vertical className="containerInput">
              <Title className="title" level={5}>
                Color Personalizado
              </Title>
              <Controller
                name="personalization.color"
                rules={{ required: true, maxLength: 123 }}
                control={control}
                render={({ field }) => <ColorPicker format="rgb" showText {...field} />}
              />
              <Text className="textError">
                {errors?.personalization?.color && "Color Personalizado es obligatorio *"}
              </Text>
            </Flex>
            <InputForm
              typeInput="personalization.description"
              titleInput="Descripción"
              nameInput="personalization.description"
              className="description"
              control={control}
              error={errors.personalization?.description}
            />
          </Flex>
          <Flex className="buttonNewProject">
            {["edit", "create"].includes(statusForm) && (
              <PrincipalButton disabled={loading} onClick={handleSubmit(onSubmit)}>
                {validationButtonText(statusForm)}
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
    </>
  );
};
