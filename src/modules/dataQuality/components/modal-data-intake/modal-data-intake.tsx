import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import { Label } from "@/modules/chat/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { Input, message, Modal } from "antd";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store/store";
import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IParameterData } from "@/types/dataQuality/IDataQuality";
import { transformParameterDataToFormData } from "../../utils/transformParameterData";
import { GenericResponse } from "@/types/global/IGlobal";
import { Edit } from "lucide-react";
import { InputClickableStyled } from "../input-clickable-styled/input-clickable-styled";
import { ModalPeriodicity } from "@/components/molecules/modals/ModalPeriodicity/ModalPeriodicity";
import { IPeriodicityModalForm } from "@/types/communications/ICommunications";
import { createIntake } from "@/services/dataQuality/dataQuality";

// Mode type definition
export type IModalMode = "create" | "view";

// Interface para el formulario
export interface DataIntakeFormData {
  clientName: string;
  fileType: string;
  ingestaSource: string;
  attachedFile: File | null;
  ingestaVariables: Array<{
    key: string;
    value: string;
  }>;
  existingFileName?: string;
}

// Schema de validación Yup
const validationSchema: yup.ObjectSchema<any> = yup.object({
  clientName: yup.string().required("El nombre del cliente es requerido"),
  fileType: yup.string().required("El tipo de archivo es requerido"),
  ingestaSource: yup.string().required("La fuente de ingesta es requerida"),
  attachedFile: yup
    .mixed<File>()
    .required("El archivo adjunto es requerido")
    .test("is-file", "El archivo adjunto es requerido", (value) => value instanceof File),
  ingestaVariables: yup
    .array()
    .of(
      yup.object({
        key: yup.string().defined(),
        value: yup.string().defined()
      })
    )
    .defined()
});

interface IModalDataIntakeProps {
  open: boolean;
  onOpenChange: () => void;
  mode: IModalMode;
  clientId: string;
  clientName: string;
  idCountry: number;
  onSuccess?: () => void;
}

// Default form values
const defaultFormValues: DataIntakeFormData = {
  clientName: "",
  fileType: "",
  ingestaSource: "",
  attachedFile: null,
  ingestaVariables: [{ key: "", value: "" }]
};

export function ModalDataIntake({
  open,
  onOpenChange,
  mode,
  clientId,
  clientName,
  idCountry,
  onSuccess
}: IModalDataIntakeProps) {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [isEditing, setIsEditing] = useState(false);
  const [isPeriodicityModalOpen, setIsPeriodicityModalOpen] = useState(false);
  const [selectedPeriodicity, setSelectedPeriodicity] = useState<IPeriodicityModalForm | undefined>(
    undefined
  );
  const [periodicityError, setPeriodicityError] = useState(false);

  // Fetch parameter data with clientId using SWR
  const {
    data: parameterDataResponse,
    error: fetchError,
    isLoading
  } = useSWR<GenericResponse<IParameterData>>(
    open && clientId ? `/data/clients/${clientId}/parametrization/${projectId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const parameterData = parameterDataResponse?.data;

  // Compute form initial data based on available sources
  const formInitialData = useMemo(() => {
    if (mode === "view" && clientId && parameterData) {
      return transformParameterDataToFormData(parameterData);
    } else {
      return defaultFormValues;
    }
  }, [mode, clientId, parameterData]);

  // Setup react-hook-form
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting }
  } = useForm<DataIntakeFormData>({
    resolver: yupResolver(validationSchema),
    mode: "onChange",
    defaultValues: formInitialData
  });

  // useFieldArray for dynamic variables
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingestaVariables"
  });

  // Watch for attached file
  const attachedFileValue = watch("attachedFile");

  // Form reset logic when modal opens or data changes
  useEffect(() => {
    if (open) {
      setIsEditing(false);
      const resetData = {
        ...formInitialData,
        clientName,
        ingestaVariables: formInitialData.ingestaVariables?.length
          ? formInitialData.ingestaVariables
          : [{ key: "", value: "" }]
      };
      reset(resetData);
    }
  }, [open, formInitialData, reset, clientName]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      message.error("Error al cargar los datos del cliente");
    }
  }, [fetchError]);

  // useEffect to clear error when periodicity is selected
  useEffect(() => {
    if (selectedPeriodicity) {
      setPeriodicityError(false);
    }
  }, [selectedPeriodicity]);

  // Helper function to format days array
  const formatDaysArray = (days: Array<{ value: string; label: string }>) => {
    return days.map((day) => day.value).join(", ");
  };

  const onSubmit = async (data: DataIntakeFormData) => {
    // Validar periodicidad
    if (!selectedPeriodicity) {
      setPeriodicityError(true);
      return;
    }

    // Limpiar error si existe
    setPeriodicityError(false);

    if (mode === "create") {
      console.log({
        ...data,
        periodicity: selectedPeriodicity
      });

      const jsonFreq = {
        start_date: selectedPeriodicity?.init_date?.format("YYYY-MM-DD") || "",
        repeat: {
          interval: String(selectedPeriodicity?.frequency_number || 0),
          frequency: selectedPeriodicity?.frequency.value || "Mensual",
          day:
            selectedPeriodicity?.frequency.value.toLowerCase() === "semanal"
              ? selectedPeriodicity?.days.map((day) => Number(day.value))
              : [Number(selectedPeriodicity?.init_date?.format("YYYY-MM-DD").split("-")[2])]
        },
        end_date: selectedPeriodicity?.end_date?.format("YYYY-MM-DD") || ""
      };

      try {
        const modelData = {
          file: data.attachedFile as File,
          id_client_data: Number(clientId),
          id_type_archive: Number(data.fileType),
          id_status: 1, // Assuming '1' is the default status for new intake
          intake_type_id: Number(data.ingestaSource),
          periodicity_json: jsonFreq
        };
        await createIntake(modelData);
        message.success("Ingesta creada correctamente");
        onSuccess && onSuccess();
        onOpenChange();
      } catch (error) {
        message.error("Error al crear la ingesta");
      }
    } else if (mode === "view" && isEditing) {
      console.log("Edit mode - not implemented yet", {
        ...data,
        periodicity: selectedPeriodicity
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    const resetData = {
      ...formInitialData,
      ingestaVariables: formInitialData.ingestaVariables?.length
        ? formInitialData.ingestaVariables
        : [{ key: "", value: "" }]
    };
    reset(resetData);
  };

  const handleClose = () => {
    setIsEditing(false);
    setSelectedPeriodicity(undefined);
    setPeriodicityError(false);
    onOpenChange();
  };

  const fileTypeOptions = useMemo(() => {
    if (parameterData?.catalogs?.archive_types) {
      return parameterData.catalogs.archive_types.map((t) => ({
        id: t.id,
        value: String(t.id),
        label: t.description
      }));
    }
  }, [parameterData]);

  const ingestaOptions = useMemo(() => {
    if (parameterData?.intake_types && parameterData.intake_types.length > 0) {
      return parameterData.intake_types.map((type) => ({
        id: type.id,
        value: String(type.id),
        label: type.description
      }));
    }
    return [];
  }, [parameterData?.intake_types]);

  // Determine if we should show form fields
  const showForm = mode === "create" || (mode === "view" && isEditing);

  // Show loading state inside modal
  if (isLoading && open) {
    return (
      <Modal open={open} onCancel={handleClose} footer={null} width={600} destroyOnClose>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando datos...</p>
          </div>
        </div>
      </Modal>
    );
  }

  // --- Form fields (shared by create and edit modes) ---
  const renderFormFields = () => (
    <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
      {/* Tipo de Archivo Dropdown */}
      <div className="grid gap-2">
        <Label>Tipo de Archivo</Label>
        <Controller
          name="fileType"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full border-[#DDDDDD]">
                <SelectValue placeholder="Seleccionar tipo de archivo" />
              </SelectTrigger>
              <SelectContent className="!z-[10000]">
                {fileTypeOptions?.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.value}>
                    {tipo.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.fileType && <p className="text-xs text-red-600">{errors.fileType.message}</p>}
      </div>

      {/* Periodicidad */}
      <div className="grid gap-2">
        <Label>Periodicidad *</Label>
        <InputClickableStyled
          onClick={() => setIsPeriodicityModalOpen(true)}
          value={
            selectedPeriodicity
              ? selectedPeriodicity.frequency.value === "Mensual"
                ? `${selectedPeriodicity.frequency.value}, ${selectedPeriodicity.frequency_number} veces`
                : `Cada ${formatDaysArray(selectedPeriodicity.days)}, ${selectedPeriodicity.frequency.value}`
              : ""
          }
          error={periodicityError}
          placeholder="Seleccionar frecuencia"
        />
        {periodicityError && (
          <p className="text-xs text-red-600">La periodicidad es obligatoria *</p>
        )}
      </div>

      {/* Fuente de Ingesta */}
      <div className="grid gap-2">
        <Label>Fuente de Ingesta</Label>
        <Controller
          name="ingestaSource"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full border-[#DDDDDD]">
                <SelectValue placeholder="Seleccionar fuente de ingesta" />
              </SelectTrigger>
              <SelectContent className="!z-[10000]">
                {ingestaOptions.map((ingesta) => (
                  <SelectItem key={ingesta.id} value={ingesta.value}>
                    {ingesta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.ingestaSource && (
          <p className="text-xs text-red-600">{errors.ingestaSource.message}</p>
        )}
      </div>

      {/* Adjunto */}
      <div className="grid gap-2">
        <Label>Adjunto *</Label>
        <Controller
          name="attachedFile"
          control={control}
          render={({ field: { onChange, value, ...field } }) => (
            <div className="space-y-2">
              {mode === "view" && formInitialData?.existingFileName && !attachedFileValue && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Archivo actual: {formInitialData.existingFileName}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {}}
                    className="text-red-600 h-6 px-2"
                  >
                    Eliminar
                  </Button>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Input
                  {...field}
                  id="file-attachment"
                  type="file"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    onChange(file);
                  }}
                  className="border-[#DDDDDD]"
                />
                {attachedFileValue && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(null)}
                    className="text-red-600"
                  >
                    Eliminar
                  </Button>
                )}
              </div>
              {attachedFileValue && (
                <p className="text-xs text-gray-600">Nuevo archivo: {attachedFileValue.name}</p>
              )}
            </div>
          )}
        />
        {errors.attachedFile && (
          <p className="text-xs text-red-600">{errors.attachedFile.message}</p>
        )}
      </div>

      {/* Variables de configuración */}
      {/* <div className="grid gap-2">
        <div className="flex items-center justify-between">
          <Label>Variables de configuración</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ key: "", value: "" })}
            className="text-xs bg-transparent"
          >
            + Agregar variable
          </Button>
        </div>
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Controller
                name={`ingestaVariables.${index}.key`}
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Nombre (ej: EMAIL, API_URL)"
                    className="border-[#DDDDDD] flex-1 font-mono text-sm"
                  />
                )}
              />
              <Controller
                name={`ingestaVariables.${index}.value`}
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Valor" className="border-[#DDDDDD] flex-1" />
                )}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  className="text-red-600 hover:text-red-700 px-2"
                >
                  ✕
                </Button>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500">
          Agregue variables como EMAIL, API_URL, PASSWORD, etc.
        </p>
      </div> */}
    </div>
  );

  // --- View-only fields (for view mode without editing) ---
  const renderViewFields = () => (
    <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
      {/* Tipo de Archivo */}
      <div className="grid gap-2">
        <Label>Tipo de Archivo</Label>
        <Badge variant="outline" className="w-fit">
          {formInitialData.fileType || "Sin tipo"}
        </Badge>
      </div>

      {/* Fuente de Ingesta */}
      <div className="grid gap-2">
        <Label>Fuente de Ingesta</Label>
        <p className="text-sm" style={{ color: "#141414" }}>
          {formInitialData.ingestaSource || "Sin fuente"}
        </p>
      </div>

      {/* Adjunto */}
      <div className="grid gap-2">
        <Label>Adjunto</Label>
        <p className="text-sm" style={{ color: "#141414" }}>
          {formInitialData.existingFileName || "Sin archivo adjunto"}
        </p>
      </div>

      {/* Variables de configuración */}
      <div className="grid gap-2">
        <Label>Variables de configuración</Label>
        <div className="space-y-1">
          {formInitialData.ingestaVariables
            ?.filter((v) => v.key && v.value)
            .map((variable, index) => (
              <div key={index} className="flex items-center gap-1 bg-gray-100 rounded px-2 py-1">
                <span className="text-xs font-mono font-semibold text-gray-700">
                  {variable.key}:
                </span>
                <span className="text-xs text-gray-600">{variable.value}</span>
              </div>
            ))}
          {(!formInitialData.ingestaVariables ||
            formInitialData.ingestaVariables.filter((v) => v.key && v.value).length === 0) && (
            <p className="text-sm text-gray-500">Sin variables configuradas</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Modal
        open={open}
        onCancel={handleClose}
        footer={null}
        width={600}
        destroyOnClose
        title={
          mode === "create"
            ? "Crear Nueva Ingesta"
            : isEditing
              ? "Editar Ingesta"
              : "Detalle de Ingesta"
        }
      >
        <p className="text-sm text-gray-500 mb-4">
          {mode === "create"
            ? "Configure los detalles de la nueva ingesta"
            : isEditing
              ? "Modifica los detalles de la ingesta"
              : `Información de la ingesta de ${formInitialData.fileType || clientName}`}
        </p>

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderFormFields()}

            <div className="flex justify-end gap-2 pt-4">
              {mode === "create" ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting || !selectedPeriodicity}
                    className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
                  >
                    {isSubmitting ? "Creando..." : "Crear Ingesta"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancelEdit}
                    className="bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isValid || isSubmitting || !selectedPeriodicity}
                    className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </>
              )}
            </div>
          </form>
        ) : (
          <>
            {renderViewFields()}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={handleClose} className="bg-transparent">
                Cerrar
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </>
        )}
      </Modal>

      <ModalPeriodicity
        isOpen={isPeriodicityModalOpen}
        onClose={() => setIsPeriodicityModalOpen(false)}
        selectedPeriodicity={selectedPeriodicity}
        setSelectedPeriodicity={setSelectedPeriodicity}
        isEditAvailable={true}
        showCommunicationDetails={{ communicationId: 0, active: false }}
      />
    </>
  );
}
