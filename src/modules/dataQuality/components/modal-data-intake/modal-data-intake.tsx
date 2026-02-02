import { Button } from "@/modules/chat/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/modules/chat/ui/dialog";
import { Label } from "@/modules/chat/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/modules/chat/ui/select";
import { Switch } from "@/modules/chat/ui/switch";
import { Input, message } from "antd";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store/store";
import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { updateClient } from "@/services/dataQuality/dataQuality";
import {
  IUpdateClientRequest,
  IArchiveRule,
  IPeriodicity,
  IParameterData,
  IParameterCatalogs
} from "@/types/dataQuality/IDataQuality";
import { transformParameterDataToFormData } from "../../utils/transformParameterData";
import { GenericResponse } from "@/types/global/IGlobal";
import { ModalDataIntakePeriodicity } from "./modal-data-intake-periodicity";

// Mode type definition
type ModalMode = "create" | "edit";

// Interface para el formulario
export interface DataIntakeFormData {
  clientName: string;
  fileType: string;
  periodicity: "Daily" | "Weekly" | "Monthly" | "";
  dailyDetails?: {
    diasHabiles: boolean;
    festivos: boolean;
  };
  weeklyDetails?: {
    acumulado: boolean;
    porRango: boolean;
  };
  ingestaSource: string;
  stakeholder: string;
  attachedFile: File | null;
  ingestaVariables: Array<{
    key: string;
    value: string;
  }>;
  existingFileName?: string; // For displaying current file in edit mode
}

// Schema de validación Yup
const validationSchema: yup.ObjectSchema<any> = yup.object({
  clientName: yup.string().required("El nombre del cliente es requerido"),
  fileType: yup.string().required("El tipo de archivo es requerido"),
  periodicity: yup
    .mixed<"Daily" | "Weekly" | "Monthly" | "">()
    .oneOf(["Daily", "Weekly", "Monthly", ""], "Debe seleccionar una periodicidad")
    .test("is-not-empty", "La periodicidad es requerida", (value) => value !== "")
    .required(),
  dailyDetails: yup
    .object({
      diasHabiles: yup.boolean().required(),
      festivos: yup.boolean().required()
    })
    .optional(),
  weeklyDetails: yup
    .object({
      acumulado: yup.boolean().required(),
      porRango: yup.boolean().required()
    })
    .optional(),
  ingestaSource: yup.string().required("La fuente de ingesta es requerida"),
  stakeholder: yup.string().required("El stakeholder es requerido"),
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
  clientId: string; // Always required (we're in client detail view)
  clientName: string; // To display in the modal
  idCountry: number; // For API calls
}

// Default form values
const defaultFormValues: DataIntakeFormData = {
  clientName: "",
  fileType: "",
  periodicity: "",
  dailyDetails: { diasHabiles: false, festivos: false },
  weeklyDetails: { acumulado: false, porRango: false },
  ingestaSource: "",
  stakeholder: "",
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

  // Fetch parameter data when in edit mode with clientId using SWR
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
    if (mode === "edit" && clientId && parameterData) {
      // Use API data transformed to form data
      return transformParameterDataToFormData(parameterData);
    } else {
      // Create mode - use default values
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
      // Ensure ingestaVariables always has at least one row
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

  // Utility functions for data transformation
  const getArchiveTypeId = (fileType: string, catalogs?: IParameterCatalogs): number => {
    if (!catalogs?.archive_types) {
      // Fallback to mock mapping
      return fileType === "Sales" ? 1 : fileType === "Stock" ? 2 : 3;
    }
    return catalogs.archive_types.find((t) => t.description === fileType)?.id || 0;
  };

  const buildPeriodicityJson = (formData: DataIntakeFormData): IPeriodicity => {
    const frequency = formData.periodicity.toLowerCase();

    // Determine days array based on periodicity and details
    let days: number[] = [];
    if (formData.periodicity === "Daily") {
      // If diasHabiles is true, use weekdays [1,2,3,4,5], else all days
      days = formData.dailyDetails?.diasHabiles ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6, 7];
    } else if (formData.periodicity === "Weekly") {
      days = [1]; // Default to Monday
    } else if (formData.periodicity === "Monthly") {
      days = [1]; // Default to first day of month
    }

    return {
      repeat: {
        frequency,
        interval: "1",
        day: days
      },
      start_date: new Date().toISOString()
    };
  };

  // Handler for creating ingestion
  const handleCreateIngestion = async (formData: DataIntakeFormData) => {
    try {
      const archiveRules: IArchiveRule[] = [
        {
          id_type_archive: getArchiveTypeId(formData.fileType, parameterData?.catalogs),
          periodicity_json: buildPeriodicityJson(formData)
        }
      ];

      // Call updateClient API to add/update archive rules
      const requestData: IUpdateClientRequest = {
        client_name: clientName, // Keep current name
        id_country: idCountry, // From props
        archive_rules: archiveRules
      };

      await updateClient(parseInt(clientId), requestData);

      message.success("Ingesta creada exitosamente");
      onOpenChange();
      reset(defaultFormValues);
    } catch (error) {
      console.error("Error creating ingestion:", error);
      message.error("Error al crear la ingesta");
    }
  };

  const onSubmit = async (data: DataIntakeFormData) => {
    if (mode === "create") {
      await handleCreateIngestion(data);
    } else if (mode === "edit") {
      console.log("Edit mode - not implemented yet");
    }
  };

  // Compute dropdown options from catalogs or fallback to mocks
  const stakeholderOptions = useMemo(() => {
    if (parameterData?.catalogs?.stakeholders) {
      return parameterData.catalogs.stakeholders.map((s) => ({
        id: s.id,
        name: s.name
      }));
    }
  }, [parameterData]);

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

  // Show loading state inside modal
  if (isLoading && open) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Dialog Header */}
          <DialogHeader>
            <DialogTitle>
              {mode === "create" ? "Crear Nueva Ingesta" : "Editar Parametrización"}
            </DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Configure los detalles de la nueva ingesta"
                : `Modifica la configuración de ingesta ${clientName ? ` para ${clientName}` : ""}`}
            </DialogDescription>
          </DialogHeader>

          {/* Dialog Content */}
          <div className="grid gap-6 py-4">
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

            {/* Periodicidad */}
            <ModalDataIntakePeriodicity control={control} />

            {/* Ingesta Source */}
            <div className="grid gap-2">
              <Label htmlFor="ingesta">Ingesta</Label>
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

            {/* Stakeholder */}
            <div className="grid gap-2">
              <Label htmlFor="stakeholder">Stakeholder</Label>
              <Controller
                name="stakeholder"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full border-[#DDDDDD]">
                      <SelectValue placeholder="Seleccionar responsable" />
                    </SelectTrigger>
                    <SelectContent className="!z-[10000]">
                      {stakeholderOptions?.map((stakeholder) => (
                        <SelectItem key={stakeholder.id} value={stakeholder.name}>
                          {stakeholder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.stakeholder && (
                <p className="text-xs text-red-600">{errors.stakeholder.message}</p>
              )}
            </div>

            {/* File Attachment Field */}
            <div className="grid gap-2">
              <Label htmlFor="file-attachment">Adjunto (opcional)</Label>
              <Controller
                name="attachedFile"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
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
                )}
              />
              {attachedFileValue && (
                <p className="text-xs text-gray-600">
                  Archivo seleccionado: {attachedFileValue.name}
                </p>
              )}
              {mode === "edit" && formInitialData?.existingFileName && !attachedFileValue && (
                <p className="text-xs text-gray-600">
                  Archivo actual: {formInitialData.existingFileName}
                </p>
              )}
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

          {/* Dialog Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onOpenChange} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] border-none"
            >
              {isSubmitting || isLoading
                ? mode === "create"
                  ? "Creando..."
                  : "Guardando..."
                : mode === "create"
                  ? "Crear Ingesta"
                  : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

