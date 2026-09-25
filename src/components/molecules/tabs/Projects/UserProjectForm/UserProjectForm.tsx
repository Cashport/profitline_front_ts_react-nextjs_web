import { useEffect, useState } from "react";
import { Button, Flex, Spin, Typography } from "antd";
import { Controller, useForm } from "react-hook-form";
import { ArrowsClockwise, CaretLeft, Pencil, Plus } from "phosphor-react";

import { SelectRoles } from "@/components/molecules/selects/SelectRoles/SelectRoles";
import { SelectZone } from "@/components/molecules/selects/SelectZone/SelectZone";
import { SelectStructure } from "@/components/molecules/selects/SelectStructure/SelectStructure";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { ModalChangeStatus } from "@/components/molecules/modals/ModalChangeStatus/ModalChangeStatus";

import {
  getGroupsByUser,
  getUserById,
  inviteUser,
  onChangeStatusById,
  onRemoveUserById,
  updateUser
} from "@/services/users/users";
import { useAppStore } from "@/lib/store/store";
import { ModalRemove } from "@/components/molecules/modals/ModalRemove/ModalRemove";
import { IUserData, IUserForm } from "@/types/users/IUser";

import { SelectClientsGroup } from "@/components/molecules/selects/SelectClientsGroup/SelectClientsGroup";

import { ISelectedBussinessRules } from "@/types/bre/IBRE";
import { IGroupByUser } from "@/types/clientsGroups/IClientsGroups";
import { useMessageApi } from "@/context/MessageContext";

import "./userprojectform.scss";
const { Title } = Typography;

interface Props {
  isViewDetailsUser: {
    active: boolean;
    id: number;
  };
  onGoBackTable: () => void;
}
export const UserProjectForm = ({ isViewDetailsUser, onGoBackTable }: Props) => {
  const { showMessage } = useMessageApi();
  const [isEditAvailable, setIsEditAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dataUser, setDataUser] = useState({
    data: {},
    isLoading: false
  } as { data: IUserData; isLoading: boolean });
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<IUserForm>({
    defaultValues: isViewDetailsUser?.active ? dataToDataForm(dataUser.data) : initialData,
    disabled: !isEditAvailable,
    values: isViewDetailsUser?.active ? dataToDataForm(dataUser.data) : ({} as IUserForm)
  });
  const { ID } = useAppStore((state) => state.selectedProject);

  const [selectedBusinessRules, setSelectedBusinessRules] = useState<ISelectedBussinessRules>(
    initDatSelectedBusinessRules
  );
  const [zones, setZones] = useState([] as number[]);
  const [customFieldsError, setCustomFieldsError] = useState({
    zone: false,
    channel: false
  });
  const [isOpenModalStatus, setIsOpenModalStatus] = useState(initDataOpenModalStatus);
  const [assignedGroups, setAssignedGroups] = useState([] as any[]);

  useEffect(() => {
    (async () => {
      if (isViewDetailsUser?.id === 0) {
        setIsEditAvailable(true);
        return;
      }
      setDataUser({
        isLoading: true,
        data: {} as IUserData
      });
      const response = await getUserById(`${isViewDetailsUser?.id}`);
      const finalData = response.data;

      const zonesFinalData =
        finalData.USER_ZONES?.map(
          (zone: { ZONE_ID: number; ZONE_DESCRIPTION: string }) => zone.ZONE_ID
        ) ?? [];
      setDataUser({
        isLoading: false,
        data: finalData
      });
      setZones(zonesFinalData);

      setSelectedBusinessRules({
        channels: finalData.USER_CHANNELS?.map((channel) => channel.ID),
        lines: finalData.USER_LINES?.map((line) => line.ID),
        sublines: finalData.USER_SUBLINES?.map((subline) => subline.ID)
      });

      const groupsByUserResponse = await getGroupsByUser(isViewDetailsUser?.id, ID);
      if (groupsByUserResponse.data) {
        setAssignedGroups(groupsByUserResponse.data.map((group: IGroupByUser) => group.group_id));
      }
    })();
  }, [ID, isViewDetailsUser]);

  const onSubmitHandler = async (data: IUserForm) => {
    setLoading(true);
    setCustomFieldsError({
      zone: zones.length === 0,
      channel: selectedBusinessRules?.channels.length === 0
    });
    if (zones.length === 0 || selectedBusinessRules?.channels.length === 0)
      return setLoading(false);

    try {
      const response = isViewDetailsUser?.id
        ? await updateUser(isViewDetailsUser?.id, ID, {
            data,
            selectedBusinessRules,
            selectedGroups: assignedGroups,
            zones,
            isActive: dataUser.data?.ACTIVE === 1
          })
        : await inviteUser(data, ID, {
            selectedBusinessRules,
            selectedGroups: assignedGroups,
            zones
          });

      if (response.status === 200 || response.status === 202) {
        const isEdit = isViewDetailsUser?.id ? "editado" : "creado";
        showMessage("success", `El usuario fue ${isEdit} exitosamente.`);
        !isViewDetailsUser?.id && onGoBackTable();
      } else if (response.response.status === 409) {
        showMessage("error", "Este email ya esta en uso, prueba otro.");
      }

      setIsEditAvailable(false);
    } catch (error) {
      showMessage("error", "Oops ocurrio un error.");
    }
    setLoading(false);
  };
  const onRemoveUser = async () =>
    await onRemoveUserById(dataUser.data.ID, ID, showMessage, () => onGoBackTable());
  const onActiveUser = async () =>
    await onChangeStatusById(dataUser.data.ID, 1, showMessage, () => {
      setIsOpenModalStatus(initDataOpenModalStatus);
      onGoBackTable();
    });
  const onInactiveUser = async () =>
    await onChangeStatusById(dataUser.data.ID, 0, showMessage, () => {
      setIsOpenModalStatus(initDataOpenModalStatus);
      onGoBackTable();
    });

  return (
    <>
      <form className="newUserProjectForm" onSubmit={handleSubmit(onSubmitHandler)}>
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
              Ver Usuarios
            </Button>
            {/* -----------right buttons--------------- */}
            {isViewDetailsUser?.id > 0 && (
              <Flex gap={"1.5rem"}>
                <Button
                  size="large"
                  htmlType="button"
                  className="buttonOutlined"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsOpenModalStatus({ status: true, remove: false });
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
                  {isEditAvailable ? "Cancelar" : "Editar Usuario"}
                </Button>
              </Flex>
            )}
          </Flex>
          {!dataUser.isLoading ? (
            <Flex vertical component={"main"} className="mainUserForm">
              <Title level={4}>Información del usuario</Title>
              {/* -----------------------------------Informacion del Usuario--------------------------------------- */}
              <div className="generalProject">
                <InputForm
                  titleInput="Nombre del Contacto"
                  control={control}
                  nameInput="info.name"
                  error={errors.info?.name}
                />
                <InputForm
                  titleInput="Cargo"
                  control={control}
                  nameInput="info.cargo"
                  error={errors.info?.cargo}
                />
                <InputForm
                  typeInput="email"
                  titleInput="Correo electrónico"
                  control={control}
                  nameInput="info.email"
                  error={errors.info?.email}
                />
                <InputForm
                  typeInput="phone"
                  titleInput="Telefono"
                  control={control}
                  nameInput="info.phone"
                  error={errors.info?.phone}
                />
                <Flex vertical className="containerInput">
                  <Title className="containerInput__title" level={5}>
                    Rol
                  </Title>
                  <Controller
                    name="info.rol"
                    control={control}
                    rules={{ required: true, minLength: 1 }}
                    render={({ field }) => <SelectRoles errors={errors.info?.rol} field={field} />}
                  />
                </Flex>
              </div>
              {/* -----------------------------------Experiencia----------------------------------- */}
              <Title level={4}>Reglas de Proyecto</Title>
              <Flex component={"section"} gap={"1rem"} className="breRules">
                <Flex vertical style={{ width: "30%" }}>
                  <SelectZone zones={zones} setZones={setZones} disabled={!isEditAvailable} />
                  <Typography.Text className="textError">
                    {customFieldsError.zone && `La Zona es obligatorio *`}
                  </Typography.Text>
                </Flex>
                <Flex vertical style={{ width: "37%" }}>
                  {dataUser?.data && (
                    <SelectStructure
                      selectedBusinessRules={selectedBusinessRules}
                      setSelectedBusinessRules={setSelectedBusinessRules}
                      disabled={!isEditAvailable}
                    />
                  )}
                  <Typography.Text className="textError">
                    {customFieldsError.channel && `Las Reglas de negocio  son obligatorias *`}
                  </Typography.Text>
                </Flex>
                <Flex vertical style={{ width: "30%" }}>
                  <SelectClientsGroup
                    disabled={!isEditAvailable}
                    assignedGroups={assignedGroups}
                    setAssignedGroups={setAssignedGroups}
                  />
                </Flex>
              </Flex>
            </Flex>
          ) : (
            <Spin />
          )}
        </Flex>
        {isEditAvailable && (
          <Flex gap={"1rem"} justify="flex-end">
            <Button
              loading={loading}
              type="primary"
              className="buttonNewProject"
              htmlType="submit"
              disabled={loading}
              size="large"
              icon={loading ? null : <Plus weight="bold" size={15} />}
            >
              {isViewDetailsUser?.id ? "Actualizar usuario" : "Registrar usuario"}
            </Button>
          </Flex>
        )}
      </form>
      {dataUser.data?.ID >= 0 && (
        <>
          <ModalChangeStatus
            isActiveStatus={dataUser.data?.ACTIVE === 1}
            isOpen={isOpenModalStatus.status}
            onActive={onActiveUser}
            onDesactivate={onInactiveUser}
            onRemove={() => setIsOpenModalStatus({ remove: true, status: false })}
            onClose={() => setIsOpenModalStatus(initDataOpenModalStatus)}
          />
          <ModalRemove
            name="usuario"
            isOpen={isOpenModalStatus.remove}
            onClose={() => setIsOpenModalStatus(initDataOpenModalStatus)}
            onRemove={onRemoveUser}
          />
        </>
      )}
    </>
  );
};

const initialData: IUserForm = {
  info: {
    name: "",
    rol: undefined,
    cargo: "",
    email: "",
    phone: ""
  }
};
const initDataOpenModalStatus = { status: false, remove: false };
const dataToDataForm = (data: any) => {
  return {
    info: {
      name: data.USER_NAME,
      rol: { value: data.ROL_ID, label: data.ROL_NAME },
      cargo: data.POSITION,
      email: data.EMAIL,
      phone: data.PHONE
    }
  };
};

const initDatSelectedBusinessRules: ISelectedBussinessRules = {
  channels: [],
  lines: [],
  sublines: []
};
