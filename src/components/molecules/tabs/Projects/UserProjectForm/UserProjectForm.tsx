import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button, Flex, Spin, Typography, message } from "antd";
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
import { IUserData } from "@/types/users/IUser";

import { SelectClientsGroup } from "@/components/molecules/selects/SelectClientsGroup/SelectClientsGroup";

import "./userprojectform.scss";
import { IGroupByUser } from "@/types/clientsGroups/IClientsGroups";
const { Title } = Typography;

export type UserType = {
  info: {
    name: string;
    cargo: string;
    email: string;
    phone: string;
    rol: string;
  };
};

interface Props {
  isViewDetailsUser: {
    active: boolean;
    id: number;
  };
  onGoBackTable: () => void;
  setIsCreateUser: Dispatch<SetStateAction<boolean>>;
  setIsViewDetailsUser: Dispatch<
    SetStateAction<{
      active: boolean;
      id: number;
    }>
  >;
}
export const UserProjectForm = ({
  isViewDetailsUser,
  onGoBackTable,
  setIsCreateUser,
  setIsViewDetailsUser
}: Props) => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isEditAvailable, setIsEditAvailable] = useState(false);
  const [dataUser, setDataUser] = useState({
    data: {},
    isLoading: false
  } as { data: IUserData; isLoading: boolean });
  const [selectedSublines, setSelectedSublines] = useState<
    { idChannel: number; idLine: number; subline: { id: number; description: string } }[]
  >([]);
  const [zones, setZones] = useState([] as number[]);
  const [customFieldsError, setCustomFieldsError] = useState({
    zone: false,
    channel: false
  });
  const [isOpenModalStatus, setIsOpenModalStatus] = useState(initDataOpenModalStatus);
  const [assignedGroups, setAssignedGroups] = useState([] as any[]);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<UserType>({
    defaultValues: isViewDetailsUser?.active ? dataToDataForm(dataUser.data) : initialData,
    disabled: !isEditAvailable,
    values: isViewDetailsUser?.active ? dataToDataForm(dataUser.data) : ({} as UserType)
  });
  const { ID } = useAppStore((state) => state.selectProject);

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
      const finalData = response.data.data;
      console.log("arrivingData: ", finalData);
      const zonesFinalData =
        finalData.USER_ZONES?.map(
          (zone: { ZONE_ID: number; ZONE_DESCRIPTION: string }) => zone.ZONE_ID
        ) ?? [];
      setDataUser({
        isLoading: false,
        data: finalData
      });
      setZones(zonesFinalData);

      const groupsByUserResponse = await getGroupsByUser(isViewDetailsUser?.id, ID);
      if (groupsByUserResponse.data) {
        console.log("Grupos asignados.data: ", groupsByUserResponse.data);
        setAssignedGroups(groupsByUserResponse.data.map((group: IGroupByUser) => group.group_id));
      }
    })();
  }, [ID, isViewDetailsUser, messageApi]);

  const onSubmitHandler = async (data: UserType) => {
    setCustomFieldsError({
      zone: zones.length === 0,
      channel: selectedSublines.length === 0
    });
    if (zones.length === 0 || selectedSublines.length === 0) return;

    console.log("Aca van los grupos: ", assignedGroups);
    const response = isViewDetailsUser?.id
      ? await updateUser(
          data,
          selectedSublines,
          zones,
          isViewDetailsUser?.id,
          ID,
          dataUser.data?.ACTIVE === 1
        )
      : await inviteUser(data, selectedSublines, zones, ID);
    if (response.status === 200 || response.status === 202) {
      const isEdit = isViewDetailsUser?.id ? "editado" : "creado";
      messageApi.open({
        type: "success",
        content: `El usuario fue ${isEdit} exitosamente.`
      });
      !isViewDetailsUser?.id && setIsCreateUser(false);
    } else if (response.response.status === 409) {
      messageApi.open({
        type: "error",
        content: "Este emaiil esta en uso, prueba otro."
      });
    } else {
      messageApi.open({
        type: "error",
        content: "Oops ocurrio un error."
      });
    }
  };
  const onRemoveUser = async () =>
    await onRemoveUserById(dataUser.data.ID, ID, messageApi, () =>
      setIsViewDetailsUser({ active: false, id: 0 })
    );
  const onActiveUser = async () =>
    await onChangeStatusById(dataUser.data, 1, messageApi, () =>
      setIsOpenModalStatus(initDataOpenModalStatus)
    );
  const onInactiveUser = async () =>
    await onChangeStatusById(dataUser.data, 0, messageApi, () =>
      setIsOpenModalStatus(initDataOpenModalStatus)
    );

  return (
    <>
      {contextHolder}
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
                <Flex vertical className="inputContainer">
                  <Title className="inputContainer__title" level={5}>
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
                      selectedSublines={selectedSublines}
                      setSelectedSublines={setSelectedSublines}
                      sublinesUser={dataUser?.data?.USER_SUBLINES?.map((item) => item.ID)}
                      disabled={!isEditAvailable}
                    />
                  )}
                  <Typography.Text className="textError">
                    {customFieldsError.channel && `Las Reglas de negocio  son obligatorias *`}
                  </Typography.Text>
                </Flex>
                <Flex vertical style={{ width: "30%" }}>
                  <SelectClientsGroup
                    userID={dataUser?.data?.ID}
                    projectID={ID}
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
              type="primary"
              className="buttonNewProject"
              htmlType="submit"
              size="large"
              icon={<Plus weight="bold" size={15} />}
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

const initialData: UserType = {
  info: {
    name: "",
    rol: "",
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
      rol: `${data.ROL_ID}-${data.ROL_NAME}`,
      cargo: data.POSITION,
      email: data.EMAIL,
      phone: data.PHONE
    }
  };
};
