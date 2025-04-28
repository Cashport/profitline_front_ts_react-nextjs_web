import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button, Flex, Input, Spin, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, Pencil, Plus } from "phosphor-react";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import { DividerCustom } from "@/components/atoms/DividerCustom/DividerCustom";
import { ShipToProjectTable } from "@/components/molecules/tables/ShipToProjectTable/ShipToProjectTable";

import { ModalUploadDocument } from "@/components/molecules/modals/ModalUploadDocument/ModalUploadDocument";
import { ModalBillingPeriod } from "@/components/molecules/modals/ModalBillingPeriod/ModalBillingPeriod";
import { ModalStatusClient } from "@/components/molecules/modals/ModalStatusClient/ModalStatusClient";
import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";
import {
  createClient,
  deleteClientById,
  getClientById,
  updateClient
} from "@/services/clients/clients";
import { ClientFormType, IClient } from "@/types/clients/IClients";
import { SelectRisks } from "@/components/molecules/selects/clients/SelectRisks/SelectRisks";
import { SelectDocumentTypes } from "@/components/molecules/selects/clients/SelectDocumentTypes/SelectDocumentTypes";
import { SelectClientTypes } from "@/components/molecules/selects/clients/SelectClientTypes/SelectClientTypes";
import { SelectRadicationTypes } from "@/components/molecules/selects/clients/SelectRadicationTypes/SelectRadicationTypes";
import { SelectPaymentConditions } from "@/components/molecules/selects/clients/SelectPaymentConditions/SelectPaymentCondition";
import { SelectHoldings } from "@/components/molecules/selects/clients/SelectHoldings/SelectHoldings";
import { IBillingPeriodForm } from "@/types/billingPeriod/IBillingPeriod";
import { addAddressToLocation } from "@/services/locations/locations";
import { docTypeIdBasedOnDocType, isNonEmptyObject, stringToBoolean } from "@/utils/utils";
import { useCheckLocationFields, useGetClientValues } from "./clientProjectFormHooks";
import { SelectLocations } from "@/components/molecules/selects/clients/SelectLocations/SelectLocations";
import { useMessageApi } from "@/context/MessageContext";

import "./clientprojectform.scss";
import { DocumentButtonAction } from "@/components/atoms/DocumentButtonAction/DocumentButtonAction";

const { Title } = Typography;

interface Props {
  isViewDetailsClient: {
    active: boolean;
    id: string;
  };
  onGoBackTable: () => void;
}
export const ClientProjectForm = ({ onGoBackTable, isViewDetailsClient }: Props) => {
  const [isUploadDocument, setIsUploadDocument] = useState(false);
  const [isBillingPeriodOpen, setIsBillingPeriodOpen] = useState(false);
  const [isModalStatus, setIsModalStatus] = useState({ status: false, remove: false });
  const [isEditAvailable, setIsEditAvailable] = useState(false);
  const [dataClient, setDataClient] = useState({
    data: {},
    isLoading: false
  } as { data: IClient; isLoading: boolean });
  const [billingPeriod, setBillingPeriod] = useState<IBillingPeriodForm | undefined>();
  const [clientDocuments, setClientDocuments] = useState<File[] | any[]>([]);
  const [isCreateLoading, setIsCreateLoading] = useState(false);
  const [documentReplaced, setDocumentReplaced] = useState(false);
  const { showMessage } = useMessageApi();

  const { id: idProject } = useParams<{ id: string }>();

  const dataToDataForm = (data: IClient) => {
    return {
      infoClient: {
        address:
          Array.isArray(data?.locations) && data.locations.length > 0
            ? data?.locations[0]?.address
            : undefined,
        city:
          data?.locations && data.locations.length > 0 && data?.locations[0] !== null
            ? {
                value: data.locations[0].location_id,
                label: data.locations[0].city
              }
            : {
                value: undefined,
                label: undefined
              },
        document_type: {
          value: docTypeIdBasedOnDocType(data.document_type),
          label: data.document_type
        },
        nit: data.nit,
        client_name: data.client_name,
        business_name: data.business_name,
        client_type: {
          value: data.client_type_id,
          label: data.cliet_type
        },
        holding_id: {
          value: data.holding_id === null ? 0 : data.holding_id,
          label: data.holding_name === null ? "- Sin Asignar -" : data.holding_name
        },
        phone: data.phone,
        email: data.email,
        locations: data.locations,
        risk: data.risk,
        radication_type: {
          value: data.radication_type,
          label: data.radication_type_name
        },
        condition_payment: {
          value: data.condition_payment_id,
          label: `A ${data.condition_payment} días`
        },
        billing_period: data.billing_period,
        documents: data.documents
      }
    };
  };
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    getValues,
    watch
  } = useForm<ClientFormType>({
    disabled: !isEditAvailable,
    values: isViewDetailsClient?.active ? dataToDataForm(dataClient.data) : ({} as any)
  });

  const getClientValues = useGetClientValues(getValues);

  const watchClientType = watch("infoClient.client_type");
  const hasLocationChanged = useCheckLocationFields(
    getValues,
    watch,
    isNonEmptyObject(dataClient.data)
  );

  useEffect(() => {
    // UseEffect tu update billingPeriod Value in the form
    // so react-hook-form can validate the field
    const formattedBillingPeriod = billingPeriod?.day_flag
      ? `El dia ${billingPeriod?.day} del mes`
      : `El ${billingPeriod?.order} ${billingPeriod?.day_of_week} del mes`;

    setValue("infoClient.billing_period", formattedBillingPeriod, { shouldValidate: true });
  }, [billingPeriod, setValue, dataClient.data.billing_period]);

  useEffect(() => {
    // UseEffect para dar un valor a dataClient, para pintar el form
    const fetchClientData = async () => {
      if (isViewDetailsClient?.id === "") {
        setIsEditAvailable(true);
        return;
      }
      setDataClient({
        isLoading: true,
        data: {} as IClient
      });
      const response = await getClientById(isViewDetailsClient.id.toString(), idProject);
      const finalData = response;

      setDataClient({
        isLoading: false,
        data: finalData
      });

      setClientDocuments(finalData.documents || []);
      setBillingPeriod(finalData.billing_period_config || undefined);
    };
    fetchClientData();

    if (documentReplaced) {
      fetchClientData();
      setDocumentReplaced(false);
    }
  }, [isViewDetailsClient, idProject, documentReplaced]);

  const onSubmitHandler = async (data: any) => {
    if (isViewDetailsClient?.id) {
      // Update Client

      if (hasLocationChanged) {
        const locationResponse = await addAddressToLocation(
          {
            address: data.infoClient.address,
            id: data.infoClient.city.value,
            complement: "."
          },
          parseInt(idProject),
          showMessage
        );

        const formattedLocations = locationResponse?.data?.data;

        if (!formattedLocations) return;

        await updateClient(
          idProject,
          isViewDetailsClient?.id,
          data,
          formattedLocations[0],
          hasLocationChanged,
          showMessage,
          billingPeriod
        );
        setIsEditAvailable(false);
      } else {
        //Location did not change
        await updateClient(
          idProject,
          isViewDetailsClient?.id,
          data,
          dataClient.data.locations,
          hasLocationChanged,
          showMessage,
          billingPeriod
        );
        setIsEditAvailable(false);
      }
    } else {
      // Create New Client
      setIsCreateLoading(true);
      const locationResponse = await addAddressToLocation(
        {
          address: data.infoClient.address,
          id: data.infoClient.city.value,
          complement: "Burned complement"
        },
        parseInt(idProject),
        showMessage
      );

      if (billingPeriod) {
        await createClient(
          idProject,
          data,
          billingPeriod,
          clientDocuments,
          locationResponse.data.data[0],
          showMessage
        );
        onGoBackTable();
      }
      setIsCreateLoading(false);
    }
  };

  const onDeleteClient = async () => {
    if (isViewDetailsClient?.id) {
      await deleteClientById(isViewDetailsClient?.id, idProject, showMessage, () =>
        onGoBackTable()
      );
    }
  };

  return (
    <>
      <form className="newClientProjectForm" onSubmit={handleSubmit(onSubmitHandler)}>
        <Flex vertical style={{ height: "100%" }}>
          <Flex component={"header"} className="headerNewUserProyectsForm">
            {/* -------------------left buttons------------------------ */}
            <Button
              type="text"
              size="large"
              onClick={onGoBackTable}
              className="buttonGoBack"
              icon={<CaretLeft size={"1.45rem"} />}
            >
              Ver Clientes
            </Button>
            {isViewDetailsClient?.id !== "" && (
              <Flex gap="1.5rem">
                <Button
                  size="large"
                  htmlType="button"
                  className="buttonOutlined"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsModalStatus({ status: true, remove: false });
                  }}
                  icon={<ArrowsClockwise size={"1.45rem"} />}
                >
                  Cambiar Estado
                </Button>
                <Button
                  size="large"
                  onClick={() => {
                    setIsEditAvailable(!isEditAvailable);
                  }}
                  className="buttonOutlined"
                  htmlType="button"
                  icon={<Pencil size={"1.45rem"} />}
                >
                  {isEditAvailable ? "Cancelar" : "Editar Cliente"}
                </Button>
              </Flex>
            )}
          </Flex>
          {dataClient.isLoading ? (
            <Spin />
          ) : (
            <Flex vertical component={"main"} className="mainClientForm">
              <Title level={4}>Información del Cliente</Title>
              {/* -----------------------------------Informacion del Cliente--------------------------------------- */}
              <div className="generalProject">
                <Flex vertical className="inputContainer">
                  <Title className="inputContainer__title" level={5}>
                    Tipo de documento
                  </Title>
                  <Controller
                    name="infoClient.document_type"
                    control={control}
                    rules={{ required: true, minLength: 1 }}
                    render={({ field }) => (
                      <SelectDocumentTypes
                        errors={errors.infoClient?.document_type}
                        field={field}
                      />
                    )}
                  />
                </Flex>
                <InputForm
                  titleInput="No. de documento"
                  control={control}
                  nameInput="infoClient.nit"
                  error={errors.infoClient?.nit}
                  disabled={isViewDetailsClient.id && isEditAvailable ? true : false}
                />
                <InputForm
                  titleInput="Razon Social"
                  control={control}
                  nameInput="infoClient.client_name"
                  error={errors.infoClient?.client_name}
                  disabled={isViewDetailsClient.id && isEditAvailable ? true : false}
                />
                <InputForm
                  titleInput="Nombre de la compañía"
                  control={control}
                  nameInput="infoClient.business_name"
                  error={errors.infoClient?.business_name}
                  disabled={isViewDetailsClient.id && !isEditAvailable ? true : false}
                />
                <Flex vertical className="inputContainer">
                  <Title className="inputContainer__title" level={5}>
                    Tipo de cliente
                  </Title>
                  <Controller
                    name="infoClient.client_type"
                    control={control}
                    rules={{ required: true, minLength: 1 }}
                    disabled={isViewDetailsClient.active && isEditAvailable ? true : false}
                    render={({ field }) => {
                      return (
                        <SelectClientTypes errors={errors.infoClient?.client_type} field={field} />
                      );
                    }}
                  />
                </Flex>
                <Flex vertical className="inputContainer">
                  <Title className="inputContainer__title" level={5}>
                    Holding
                  </Title>
                  <Controller
                    name="infoClient.holding_id"
                    control={control}
                    rules={{ required: false, minLength: 1 }}
                    render={({ field }) => (
                      <SelectHoldings errors={errors.infoClient?.holding_id} field={field} />
                    )}
                  />
                </Flex>
                <InputForm
                  titleInput="Teléfono"
                  control={control}
                  nameInput="infoClient.phone"
                  error={errors.infoClient?.phone}
                />
                <InputForm
                  titleInput="Correo electrónico"
                  control={control}
                  nameInput="infoClient.email"
                  error={errors.infoClient?.email}
                />
                <Controller
                  name="infoClient.city"
                  control={control}
                  rules={{ required: true, minLength: 1 }}
                  render={({ field }) => (
                    <SelectLocations errors={errors.infoClient?.city} field={field} />
                  )}
                />
                <InputForm
                  titleInput="Dirección"
                  control={control}
                  nameInput="infoClient.address"
                  error={errors.infoClient?.address}
                />
                <Flex vertical className="inputContainer">
                  <Title className="inputContainer__title" level={5}>
                    Riesgo
                  </Title>
                  <Controller
                    name="infoClient.risk"
                    control={control}
                    rules={{ required: true, minLength: 1 }}
                    disabled={isViewDetailsClient.id && isEditAvailable ? true : false}
                    render={({ field }) => (
                      <SelectRisks errors={errors.infoClient?.risk} field={field} />
                    )}
                  />
                </Flex>
                <Flex
                  className="inputContainer"
                  vertical
                  style={{ width: "24.5%" }}
                  justify="center"
                >
                  <Title className="inputContainer__title" level={5}>
                    Período de facturación
                  </Title>
                  <Controller
                    name="infoClient.billing_period"
                    control={control}
                    rules={{ required: true, minLength: 1 }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <Input
                          disabled={!isEditAvailable}
                          variant="borderless"
                          className={error ? "inputError" : "input"}
                          placeholder="Segundo miércoles del mes"
                          onClick={() => setIsBillingPeriodOpen(true)}
                          {...field}
                          value={
                            billingPeriod
                              ? stringToBoolean(billingPeriod.day_flag)
                                ? `El dia ${billingPeriod.day} del mes`
                                : `El ${billingPeriod?.order} ${billingPeriod?.day_of_week} del mes`
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
                <Flex vertical className="inputContainer">
                  <Title className="inputContainer__title" level={5}>
                    Tipo de radicación
                  </Title>
                  <Controller
                    name="infoClient.radication_type"
                    control={control}
                    rules={{ required: true, minLength: 1 }}
                    render={({ field }) => (
                      <SelectRadicationTypes<ClientFormType>
                        errors={errors.infoClient?.radication_type}
                        field={field}
                      />
                    )}
                  />
                </Flex>
                <Flex vertical className="inputContainer">
                  <Title className="inputContainer__title" level={5}>
                    Condición de pago
                  </Title>
                  <Controller
                    name="infoClient.condition_payment"
                    control={control}
                    rules={{ required: true, minLength: 1 }}
                    render={({ field }) => {
                      return (
                        <SelectPaymentConditions<ClientFormType>
                          errors={errors.infoClient?.condition_payment}
                          field={field}
                        />
                      );
                    }}
                  />
                </Flex>
              </div>
              {/* -----------------------------------Experiencia----------------------------------- */}
              <Title level={4}>Documentos</Title>
              <Flex className="clientDocuments">
                <div className="clientDocuments__docs">
                  {clientDocuments?.map((document, index) => (
                    <div key={`${index}${document.name}`} style={{ marginBottom: "1rem" }}>
                      <DocumentButtonAction
                        renderedDocument={document}
                        clientId={isViewDetailsClient?.id}
                        editable={isViewDetailsClient?.active && isEditAvailable}
                        setDocumentReplaced={setDocumentReplaced}
                      />
                    </div>
                  ))}
                </div>
                {!isViewDetailsClient?.active && isEditAvailable ? (
                  <Button
                    size="large"
                    type="text"
                    className="buttonUploadDocument"
                    disabled={!isViewDetailsClient?.active && watchClientType === undefined}
                    onClick={() => setIsUploadDocument(true)}
                    icon={<Plus weight="bold" size={15} />}
                  >
                    {isViewDetailsClient?.active && isEditAvailable
                      ? "Editar documentos"
                      : "Cargar Documentos"}
                  </Button>
                ) : null}
              </Flex>
              <DividerCustom />
              {isViewDetailsClient?.id === "" ? null : (
                <>
                  <ShipToProjectTable
                    clientId={isViewDetailsClient.id}
                    projectId={parseInt(idProject)}
                    getClientValues={getClientValues}
                    clientBillingPeriod={billingPeriod}
                  />
                  <DividerCustom />
                </>
              )}

              {isEditAvailable && (
                <Flex gap={"1rem"} justify="flex-end">
                  <Button
                    disabled={isCreateLoading}
                    type="primary"
                    className="buttonNewProject"
                    htmlType={isEditAvailable ? "submit" : "button"}
                    size="large"
                    icon={isCreateLoading ? <Spin /> : <Plus weight="bold" size={15} />}
                  >
                    {isViewDetailsClient?.id ? "Actualizar cliente" : "Registrar cliente"}
                  </Button>
                </Flex>
              )}
            </Flex>
          )}
        </Flex>
      </form>
      <ModalUploadDocument
        isOpen={isUploadDocument}
        setIsOpenUpload={setIsUploadDocument}
        setClientDocuments={setClientDocuments}
        clientTypeId={
          isViewDetailsClient?.active
            ? {
                value: dataClient?.data?.client_type_id,
                label: dataClient?.data?.cliet_type
              }
            : watchClientType
        }
        editing={isEditAvailable && isViewDetailsClient?.active}
      />
      <ModalBillingPeriod
        isOpen={isBillingPeriodOpen}
        setIsBillingPeriodOpen={setIsBillingPeriodOpen}
        setBillingPeriod={setBillingPeriod}
        billingPeriod={billingPeriod}
      />
      <ModalStatusClient
        isOpen={isModalStatus.status}
        setIsStatusClient={setIsModalStatus}
        showMessage={showMessage}
        clientId={isViewDetailsClient?.id?.toString()}
        initialStatus={dataClient.data.status}
      />
      <ModalRemove
        name="cliente"
        isOpen={isModalStatus.remove}
        onClose={() => setIsModalStatus((s) => ({ ...s, remove: false }))}
        onRemove={onDeleteClient}
      />
    </>
  );
};
