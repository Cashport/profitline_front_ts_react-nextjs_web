import { Button } from "@/modules/chat/ui/button";
import { Badge } from "@/modules/chat/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/modules/chat/ui/dialog";
import { Label } from "@/modules/chat/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { Input, message } from "antd";
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

// Mode type definition
type ModalMode = "create" | "view";

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
  attachedFile: yup.mixed().nullable(),
  ingestaVariables: yup
    .array()
    .of(
      yup
        .object({
          key: yup.string().required(),
          value: yup.string().required()
        })
        .required()
    )
    .required()
});

interface IModalDataIntakeProps {
  open: boolean;
  onOpenChange: () => void;
  mode: ModalMode;
  clientId: string;
  clientName: string;
  idCountry: number;
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
  idCountry
}: IModalDataIntakeProps) {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [isEditing, setIsEditing] = useState(false);

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
        ingestaVariables: formInitialData.ingestaVariables?.length
          ? formInitialData.ingestaVariables
          : [{ key: "", value: "" }]
      };
      reset(resetData);
    }
  }, [open, formInitialData, reset]);

  // Handle fetch errors
  useEffect(() => {
    if (fetchError) {
      message.error("Error al cargar los datos del cliente");
    }
  }, [fetchError]);

  const onSubmit = async (data: DataIntakeFormData) => {
    if (mode === "create") {
      console.log(data);
    } else if (mode === "view" && isEditing) {
      console.log("Edit mode - not implemented yet");
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
    onOpenChange();
  };

  const fileTypeOptions = useMemo(() => {
    if (parameterData?.catalogs?.archive_types) {
      return parameterData.catalogs.archive_types.map((t) => ({
        id: t.id,
        value: t.description,
        label: t.description
      }));
    }
  }, [parameterData]);

  const ingestaOptions = useMemo(() => {
    if (parameterData?.intake_types && parameterData.intake_types.length > 0) {
      return parameterData.intake_types.map((type) => ({
        id: type.id,
        value: type.description,
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
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando datos...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // --- Form fields (shared by create and edit modes) ---
  const renderFormFields = () => (
    <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
      {/* Cliente - Read-only display */}
      <div className="grid gap-2">
        <Label>Cliente</Label>
        <div className="px-3 py-2 border border-[#DDDDDD] rounded-md bg-gray-50 text-gray-700">
          {clientName}
        </div>
      </div>

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
        <Label>Adjunto (opcional)</Label>
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
                <p className="text-xs text-gray-600">
                  Nuevo archivo: {attachedFileValue.name}
                </p>
              )}
            </div>
          )}
        />
      </div>

      {/* Variables de configuración */}
      <div className="grid gap-2">
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
      </div>
    </div>
  );

  // --- View-only fields (for view mode without editing) ---
  const renderViewFields = () => (
    <div className="grid gap-6 py-4 max-h-[60vh] overflow-y-auto">
      {/* Tipo de Archivo */}
      <div className="grid gap-2">
        <Label>Tipo de Archivo</Label>
        <Badge variant="outline" className="w-fit">{formInitialData.fileType || "Sin tipo"}</Badge>
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
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Crear Nueva Ingesta"
              : isEditing
                ? "Editar Ingesta"
                : "Detalle de Ingesta"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Configure los detalles de la nueva ingesta"
              : isEditing
                ? "Modifica los detalles de la ingesta"
                : `Información de la ingesta de ${formInitialData.fileType || clientName}`}
          </DialogDescription>
        </DialogHeader>

        {showForm ? (
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderFormFields()}

            <DialogFooter>
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
                    disabled={!isValid || isSubmitting}
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
                    disabled={!isValid || isSubmitting}
                    className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
                  >
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </form>
        ) : (
          <>
            {renderViewFields()}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={handleClose}
                className="bg-transparent"
              >
                Cerrar
              </Button>
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
              >
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
