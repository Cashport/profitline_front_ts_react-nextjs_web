import { Button, Flex, Radio, Spin, Typography } from "antd";
import { Controller, ControllerRenderProps, FieldError, useForm } from "react-hook-form";
import { CaretLeft } from "phosphor-react";

import styles from "./communicationProjectForm.module.scss";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { useEffect, useState } from "react";
import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import { SelectZone } from "@/components/molecules/selects/SelectZone/SelectZone";
import { SelectStructure } from "@/components/molecules/selects/SelectStructure/SelectStructure";
import { SelectClientsGroup } from "@/components/molecules/selects/SelectClientsGroup/SelectClientsGroup";
import GeneralSelect from "@/components/ui/general-select";
import GeneralSearchSelect from "@/components/ui/general-search-select";
import SelectOuterTags from "@/components/ui/select-outer-tags";
import InputClickable from "@/components/ui/input-clickable";
import { ModalPeriodicity } from "@/components/molecules/modals/ModalPeriodicity/ModalPeriodicity";
import {
  Iattachments,
  ICommunicationDetail,
  ICommunicationForm,
  IPeriodicityModalForm
} from "@/types/communications/ICommunications";
import { InputExpirationNoticeDays } from "@/components/atoms/inputs/InputExpirationNoticeDays/InputExpirationNoticeDays";
import { OptionType } from "@/components/ui/select-outer-tags/select-outer-tags";
import { CustomTextArea } from "@/components/atoms/CustomTextArea/CustomTextArea";
import {
  createCommunication,
  getActions,
  getCommunicationById,
  getForwardEvents,
  getSubActions,
  getTemplateTags,
  getAllAtachments
} from "@/services/communications/communications";
import { useAppStore } from "@/lib/store/store";
import { capitalize, stringFromArrayOfSelect } from "@/utils/utils";
import { useMessageApi } from "@/context/MessageContext";
import dayjs from "dayjs";
import { selectDayOptions } from "@/components/atoms/SelectDay/SelectDay";
import { getAllRoles } from "@/services/roles/roles";
import { getContactOptions } from "@/services/contacts/contacts";

const { Title } = Typography;

interface ICommunicationDatatState {
  data: ICommunicationDetail | undefined;
  isLoading: boolean;
}
interface ISelect {
  value: number;
  label: string;
}
interface Props {
  showCommunicationDetails: {
    communicationId: number;
    active: boolean;
  };
  onGoBackTable: () => void;
}
export const CommunicationProjectForm = ({ onGoBackTable, showCommunicationDetails }: Props) => {
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [isEditAvailable] = useState(false);
  const [radioValue, setRadioValue] = useState<any>();
  const [zones, setZones] = useState([] as number[]);
  const [selectedPeriodicity, setSelectedPeriodicity] = useState<IPeriodicityModalForm>();
  const [selectedBusinessRules, setSelectedBusinessRules] = useState<ISelectedBussinessRules>(
    initDatSelectedBusinessRules
  );
  const [communicationData, setCommunicationData] = useState<ICommunicationDatatState>({
    data: undefined,
    isLoading: false
  });
  const [customFieldsError, setCustomFieldsError] = useState({
    zone: false,
    channel: false,
    frequency: false
  });
  const [assignedGroups, setAssignedGroups] = useState<number[]>([]);
  const [isFrequencyModalOpen, setIsFrequencyModalOpen] = useState(false);
  const [events, setEvents] = useState<ISelect[]>([]);
  const [actions, setActions] = useState<ISelect[]>([]);
  const [subActions, setSubActions] = useState<ISelect[]>([]);
  const [templateTags, setTemplateTags] = useState<ISelect[]>([]);
  const [attachments, setAttachments] = useState<{ value: number; label: string }[]>([]);
  const [forwardTo, setForwardTo] = useState<
    {
      value: string;
      label: string;
    }[]
  >([]);
  const [lastFocusedTextArea, setLastFocusedTextArea] = useState<"subject" | "message">("message");

  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const { showMessage } = useMessageApi();

  const handleChangeRadio = (
    value: any,
    field: ControllerRenderProps<ICommunicationForm, "trigger.type">
  ) => {
    setRadioValue(value);
    field.onChange(value);
  };

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<ICommunicationForm>({
    values:
      showCommunicationDetails.active && communicationData.data
        ? dataToDataForm(communicationData.data)
        : undefined
  });

  const watchTemplateTagsLabels = templateTags?.map((tag) => `\{{${tag.label}\}}`);
  const watchSelectedAction = watch("trigger.settings.actions");
  useEffect(() => {
    //set values for selects
    const fecthEvents = async () => {
      const events = await getForwardEvents();
      setEvents(events.map((event) => ({ value: event.id, label: event.name })));
    };
    fecthEvents();
    const fetchActions = async () => {
      const actions = await getActions();
      setActions(actions.map((action) => ({ value: action.id, label: action.name })));
    };
    fetchActions();
    const fetchTemplateTags = async () => {
      const tags = await getTemplateTags();
      setTemplateTags(tags.map((tag) => ({ value: tag.id, label: tag.name })));
    };
    fetchTemplateTags();
    const fetchForwardOptions = async () => {
      // const rolesData = await getAllRoles();
      // const roles = rolesData.data.data.map((role) => ({
      //   value: `1_${role.ID}`,
      //   label: `Rol - ${role.ROL_NAME}`
      // }));

      const contactPositionsData = await getContactOptions();
      const contactPositions = contactPositionsData.contact_position.map((position) => ({
        value: `0_${position.id}`,
        label: `Cliente - ${position.name}`
      }));
      setForwardTo([...contactPositions]);
    };
    fetchForwardOptions();

    // set values for communication detail
    const fetchSingleCommunication = async () => {
      if (!showCommunicationDetails.communicationId) return;
      setCommunicationData({ data: undefined, isLoading: true });
      const res = await getCommunicationById(showCommunicationDetails.communicationId);

      if (res) {
        setCommunicationData({ data: res, isLoading: false });
        setRadioValue(res.id_comunication_type.id);

        setAttachments(
          res.attachment_ids.map((attachment: { id: number; name: string }) => ({
            value: attachment.id,
            label: attachment.name
          }))
        );

        // setSelectedBusinessRules({
        //   channels: res.rules.channel,
        //   lines: res.rules.line,
        //   sublines: res.rules.subline
        // });
        // setZones(res.rules.zone);
        setAssignedGroups(res.client_group_id.map((group) => group.id));

        const { repeat, end_date, start_date } = res.JSON_frecuency;
        if (Object.keys(res.JSON_frecuency).length === 0) return;
        setSelectedPeriodicity({
          init_date: dayjs(new Date(start_date)).add(1, "day"),
          frequency_number: repeat.interval,
          frequency: { value: capitalize(repeat.frequency), label: capitalize(repeat.frequency) },
          days: [{ value: repeat.day, label: dayToLabel(repeat.day) }],
          end_date: dayjs(new Date(end_date)).add(1, "day")
        });
      }
    };
    fetchSingleCommunication();
  }, [showCommunicationDetails.communicationId]);

  useEffect(() => {
    const action_ids = watchSelectedAction?.map((action) => action.value);
    if (!action_ids) return;

    if (action_ids.length === 0) {
      setSubActions([]);
      return;
    }
    const fetchSubActions = async () => {
      const subActions = await getSubActions(action_ids);
      setSubActions(subActions.map((action) => ({ value: action.id, label: action.name })));
    };
    fetchSubActions();
  }, [watchSelectedAction]);

  const dayToLabel = (day: string) => {
    const dayObj = selectDayOptions.find((option) => option.value === day);
    if (!dayObj) return day;
    return dayObj.label;
  };

  const handleAddTagToBodyAndSubject = (value: OptionType[]) => {
    const valueBody = getValues("template.message");
    const valueSubject = getValues("template.subject");

    if (value.length === 0) return;

    const lastAddedTag = value.length > 0 ? value[value.length - 1] : undefined;

    if (lastFocusedTextArea === "subject") {
      setValue("template.subject", `${valueSubject ? valueSubject : ""}{{${lastAddedTag?.label}}}`);
      return;
    } else if (lastFocusedTextArea === "message") {
      setValue("template.message", `${valueBody ? valueBody : ""}{{${lastAddedTag?.label}}}`);
      return;
    }
  };

  const handleCreateCommunication = async (data: any) => {
    setLoadingRequest(true);
    if (
      zones.length === 0 ||
      selectedBusinessRules?.channels.length === 0 ||
      (selectedPeriodicity?.frequency === undefined && radioValue === "frecuencia")
    ) {
      setCustomFieldsError({
        zone: zones.length === 0,
        channel: selectedBusinessRules?.channels.length === 0,
        frequency: selectedPeriodicity?.frequency === undefined && radioValue === "frecuencia"
      });
      setLoadingRequest(false);
      return;
    }
    setCustomFieldsError({
      zone: false,
      channel: false,
      frequency: false
    });

    try {
      data.attachment_ids = data.template.files.map(
        (file: { value: number; label: string }) => file.value
      );

      await createCommunication({
        data,
        selectedPeriodicity,
        zones,
        selectedBusinessRules,
        assignedGroups,
        projectId,
        showMessage
      });

      onGoBackTable();
    } catch (error) {
      console.error(error);
    }
    setLoadingRequest(false);
  };

  useEffect(() => {
    //useEffect to clean values from otherRadioButtons when clicked
    if (radioValue === "frecuencia") {
      setValue("trigger.settings.days", undefined);
      setValue("trigger.settings.actions", undefined);
      setValue("trigger.settings.subActions", undefined);
      setValue("trigger.settings.event_type", undefined);
      setValue("trigger.settings.noticeDaysEvent", undefined);
    } else if (radioValue === "evento") {
      setValue("trigger.settings.days", undefined);
      setValue("trigger.settings.actions", undefined);
      setValue("trigger.settings.subActions", undefined);
      setValue("trigger.settings.noticeDaysEvent", undefined);
      setSelectedPeriodicity(undefined);
    } else if (radioValue === "accion") {
      setValue("trigger.settings.days", undefined);
      setValue("trigger.settings.event_type", undefined);
      setValue("trigger.settings.noticeDaysEvent", undefined);
      setSelectedPeriodicity(undefined);
    }
  }, [radioValue]);

  useEffect(() => {
    fetchAttachments();
  }, []);

  const fetchAttachments = async () => {
    try {
      const response = await getAllAtachments(); // Llamada al servicio
      const formattedAttachments = response.map((attachment: { id: number; name: string }) => ({
        value: attachment.id, // Mapeo de `id` a `value`
        label: attachment.name // Mapeo de `name` a `label`
      }));
      setAttachments(formattedAttachments); // Actualizar el estado con los datos formateados
    } catch (error) {
      console.error("Error fetching attachments", error);
    }
  };

  return (
    <main className={styles.communicationProjectForm}>
      <Flex>
        <Button
          className={styles.goBackButton}
          type="text"
          size="large"
          onClick={onGoBackTable}
          icon={<CaretLeft size={"1.45rem"} />}
        >
          Información de la comunicación
        </Button>
      </Flex>

      {communicationData.isLoading ? (
        <Spin size="large" />
      ) : (
        <>
          <div className={styles.generalInfo}>
            <InputForm
              titleInput="Nombre"
              control={control}
              nameInput="name"
              error={errors.name}
              readOnly={!showCommunicationDetails.communicationId ? false : !isEditAvailable}
            />
            <InputForm
              titleInput="Descripción"
              control={control}
              nameInput="description"
              error={errors.description}
              readOnly={!showCommunicationDetails.communicationId ? false : !isEditAvailable}
            />
          </div>

          <div
            className={styles.forwardType}
            style={errors.trigger?.type && { border: "1px dashed red" }}
          >
            <Title className={styles.forwardType__title} level={5}>
              Tipo de envio
            </Title>

            <Controller
              name="trigger.type"
              control={control}
              rules={{
                validate: (value) => {
                  if (!value) {
                    return "Seleccione al menos 1 tipo de envio *";
                  }
                  return true;
                }
              }}
              render={({ field }) => (
                <div className={styles.radioGroup}>
                  <div className={styles.radioGroup__frequency}>
                    <Radio
                      checked={radioValue === 1}
                      onChange={() => handleChangeRadio(1, field)}
                      className={styles.radioGroup__frequency__radio}
                      value={1}
                      disabled={!!showCommunicationDetails.communicationId && !isEditAvailable}
                    >
                      <InputClickable
                        title="Frecuencia"
                        error={customFieldsError.frequency}
                        disabled={radioValue !== 1}
                        callBackFunction={() => setIsFrequencyModalOpen(true)}
                        customStyles={
                          customFieldsError.frequency ? { border: "1px dashed red" } : undefined
                        }
                        value={
                          selectedPeriodicity
                            ? `${selectedPeriodicity.frequency.value === "Mensual" ? `${selectedPeriodicity.frequency.value}, ${selectedPeriodicity.frequency_number} veces` : `Cada ${stringFromArrayOfSelect(selectedPeriodicity.days)}, ${selectedPeriodicity.frequency.value}`}`
                            : ""
                        }
                      />
                      <p className={styles.textError}>
                        {customFieldsError.frequency && `La Frecuencia es obligatoria *`}
                      </p>
                    </Radio>
                  </div>

                  <div className={styles.radioGroup__event}>
                    <div className={styles.radioGroup__event__left}>
                      <Radio
                        checked={radioValue === 2}
                        onChange={() => handleChangeRadio(2, field)}
                        name="test"
                        className={styles.radioGroup__event__radio}
                        value={2}
                        disabled={!!showCommunicationDetails.communicationId && !isEditAvailable}
                      />
                      <Controller
                        disabled={
                          radioValue !== 2 ||
                          (!isEditAvailable && !!showCommunicationDetails.communicationId)
                        }
                        name="trigger.settings.event_type"
                        control={control}
                        rules={{ required: radioValue === 2 }}
                        render={({ field }) => (
                          <GeneralSelect
                            errors={errors.trigger?.settings?.event_type}
                            field={field}
                            title="Tipo de evento"
                            placeholder="Seleccionar tipo de evento"
                            options={events}
                            titleAbsolute
                          />
                        )}
                      />
                    </div>
                    {radioValue === 2 && (
                      <Controller
                        name="trigger.settings.noticeDaysEvent"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <InputExpirationNoticeDays
                            nameInput="trigger.settings.noticeDaysEvent"
                            setValue={setValue}
                            error={errors.trigger?.settings?.noticeDaysEvent}
                            field={field}
                            // Event days before is a prop that comes from the backend to set the value when showing the communication details
                            event_days_before={
                              showCommunicationDetails.communicationId ? 0 : undefined
                            }
                            disabled={
                              !isEditAvailable && !!showCommunicationDetails.communicationId
                            }
                          />
                        )}
                      />
                    )}
                  </div>

                  <div className={styles.radioGroup__actions}>
                    <div className={styles.radioGroup__actions__left}>
                      <Radio
                        className={styles.radioGroup__actions__radio}
                        checked={radioValue === 3}
                        onChange={() => handleChangeRadio(3, field)}
                        value={3}
                        disabled={!!showCommunicationDetails.communicationId && !isEditAvailable}
                      />
                      <Controller
                        disabled={radioValue !== 3 && !isEditAvailable}
                        name="trigger.settings.actions"
                        control={control}
                        rules={{ required: radioValue === 3 }}
                        render={({ field }) => (
                          <SelectOuterTags
                            title="Tipo de acción"
                            placeholder="Seleccionar tipo de acción"
                            options={actions}
                            errors={errors.trigger?.settings?.actions}
                            field={field}
                            titleAbsolute
                          />
                        )}
                      />
                    </div>

                    <Controller
                      disabled={radioValue !== 3 && !isEditAvailable}
                      name="trigger.settings.subActions"
                      control={control}
                      rules={{ required: false }}
                      render={({ field }) => (
                        <SelectOuterTags
                          title="Subtipo de acción"
                          placeholder="Seleccionar subtipo de acción"
                          options={subActions}
                          errors={errors.trigger?.settings?.subActions}
                          field={field}
                          titleAbsolute
                        />
                      )}
                    />
                  </div>
                  {errors.trigger?.type && (
                    <p className={styles.radioGroup__error}>
                      {(errors.trigger.type as FieldError).message}
                    </p>
                  )}
                </div>
              )}
            />
          </div>

          <div className={styles.businessRules}>
            <Title className={styles.businessRules__title} level={5}>
              Reglas de negocio
            </Title>
            <Flex
              vertical
              style={
                customFieldsError.zone
                  ? { border: "1px dashed red", borderRadius: "4px" }
                  : undefined
              }
            >
              <SelectZone
                zones={zones}
                setZones={setZones}
                disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
              />
              <p className={styles.textError}>
                {customFieldsError.zone && `La Zona es obligatoria *`}
              </p>
            </Flex>
            <Flex
              vertical
              style={
                customFieldsError.channel
                  ? { border: "1px dashed red", borderRadius: "4px" }
                  : undefined
              }
            >
              <SelectStructure
                selectedBusinessRules={selectedBusinessRules}
                setSelectedBusinessRules={setSelectedBusinessRules}
                disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
              />
              <p className={styles.textError}>
                {customFieldsError.channel && `Las Reglas de negocio  son obligatorias *`}
              </p>
            </Flex>
            <SelectClientsGroup
              assignedGroups={assignedGroups}
              setAssignedGroups={setAssignedGroups}
              disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
            />
          </div>

          <div className={styles.communicationTemplate}>
            <Title className={styles.communicationTemplate__title} level={5}>
              Plantilla comunicado
            </Title>
            <Controller
              name="template.via"
              control={control}
              disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
              rules={{ required: true }}
              render={({ field }) => (
                <GeneralSelect
                  errors={errors.template?.via}
                  field={field}
                  title="Via"
                  placeholder="Seleccionar via"
                  options={viasSelectOption}
                  customStyleContainer={{ width: "25%", paddingRight: "0.25rem" }}
                />
              )}
            />
            <Controller
              name="template.send_to"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <GeneralSearchSelect
                  errors={errors.template?.send_to}
                  field={field}
                  title="Para"
                  placeholder="Enviar a"
                  options={forwardTo}
                  suffixIcon={null}
                  disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
                />
              )}
            />
            <Controller
              name="template.copy_to"
              control={control}
              rules={{ required: false }}
              render={({ field }) => (
                <GeneralSearchSelect
                  errors={errors.template?.copy_to}
                  field={field}
                  title="Copia"
                  placeholder="Copia a"
                  options={forwardTo}
                  suffixIcon={null}
                  disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
                />
              )}
            />

            <Flex gap={"1rem"} align="flex-start">
              <Controller
                name="template.tags"
                control={control}
                rules={{ required: false }}
                disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
                render={({ field }) => (
                  <SelectOuterTags
                    title="Tags"
                    placeholder="Seleccionar tag"
                    options={templateTags}
                    errors={errors.template?.tags}
                    field={field}
                    customStyleContainer={{ width: "25%" }}
                    hiddenTags
                    addedOnchangeBehaviour={handleAddTagToBodyAndSubject}
                    disableValueRetention
                  />
                )}
              />

              <Controller
                name="template.subject"
                control={control}
                rules={{ required: true }}
                disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
                render={({ field }) => (
                  <div className={styles.textArea}>
                    <p className={styles.textArea__label}>Asunto</p>
                    <CustomTextArea
                      {...field}
                      onFocus={() => setLastFocusedTextArea("subject")}
                      onChange={field.onChange}
                      placeholder="Asunto"
                      customStyles={
                        errors.template?.subject ? { borderColor: "red" } : { height: "48px" }
                      }
                      customStyleTextArea={{
                        height: "48px",
                        minHeight: "48px",
                        padding: "12px 1rem",
                        scrollbarWidth: "none"
                      }}
                      value={field.value}
                      highlightWords={templateTags?.map((tag) => `\{{${tag.label}\}}`)}
                      disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
                    />
                  </div>
                )}
              />
            </Flex>
            <Controller
              name="template.message"
              control={control}
              rules={{ required: true }}
              disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
              render={({ field }) => (
                <div className={styles.textArea}>
                  <p className={styles.textArea__label}>Cuerpo</p>
                  <CustomTextArea
                    {...field}
                    onFocus={() => setLastFocusedTextArea("message")}
                    onChange={field.onChange}
                    placeholder="Ingresar cuerpo del correo"
                    customStyles={errors.template?.message ? { borderColor: "red" } : {}}
                    value={field.value}
                    highlightWords={watchTemplateTagsLabels}
                    disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
                  />
                </div>
              )}
            />
            <Controller
              name="template.files"
              control={control}
              rules={{ required: true }}
              disabled={!isEditAvailable && !!showCommunicationDetails.communicationId}
              render={({ field }) => (
                <SelectOuterTags
                  title="Adjunto"
                  placeholder="Seleccionar adjunto"
                  options={attachments}
                  errors={errors.template?.files}
                  field={field}
                  customStyleContainer={{ marginTop: "1rem" }}
                  titleAbsolute
                />
              )}
            />
          </div>

          {!showCommunicationDetails.active && (
            <Flex justify="end">
              <PrincipalButton
                loading={loadingRequest}
                onClick={handleSubmit(handleCreateCommunication)}
              >
                Crear comunicación
              </PrincipalButton>
            </Flex>
          )}
        </>
      )}

      <ModalPeriodicity
        isOpen={isFrequencyModalOpen}
        onClose={() => setIsFrequencyModalOpen(false)}
        selectedPeriodicity={selectedPeriodicity}
        setSelectedPeriodicity={setSelectedPeriodicity}
        isEditAvailable={isEditAvailable}
        showCommunicationDetails={showCommunicationDetails}
      />
    </main>
  );
};

const viasSelectOption = ["Email", "SMS", "WhatsApp"];

const initDatSelectedBusinessRules: ISelectedBussinessRules = {
  channels: [],
  lines: [],
  sublines: []
};

const dataToDataForm = (data: ICommunicationDetail | undefined): ICommunicationForm | undefined => {
  if (!data || Object.keys(data).length === 0) return undefined;

  const roles = data.user_roles?.map((role) => ({
    value: `1_${role.id}`,
    label: `Rol - ${role.name}`
  }));

  const contactPositions = data.contact_roles?.map((position) => ({
    value: `0_${position.id}`,
    label: `Cliente - ${position.name}`
  }));
  const send_to = [...roles, ...contactPositions];

  const files = data.attachment_ids.map((attachment: { id: number; name: string }) => ({
    value: attachment.id,
    label: attachment.name
  }));

  return {
    name: data.name,
    description: data.description,
    attachment_ids: data.attachment_ids,
    trigger: {
      type: data.id_comunication_type.id,
      settings: {
        days: ["test"],
        actions: data.action_type_ids.map((action) => ({
          value: action.id.toString(),
          label: action.name
        })),
        subActions: data.sub_action_type_ids.map((action) => ({
          value: action.id.toString(),
          label: action.name
        })),
        event_type: undefined
      }
    },
    template: {
      via: { value: data.via, label: data.via },
      send_to: send_to,
      copy_to: [],
      tags: [{ value: "1", label: "Quemado" }],
      message: data.message,
      subject: data.subject,
      files: files
    }
  };
};
