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
import { useEffect } from "react";

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
  mode: ModalMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (data: DataIntakeFormData) => Promise<void>;
  initialData?: Partial<DataIntakeFormData>;
  isLoading?: boolean;
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
  mode,
  open,
  onOpenChange,
  onSuccess,
  initialData,
  isLoading
}: IModalDataIntakeProps) {
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
    defaultValues:
      mode === "edit" && initialData ? { ...defaultFormValues, ...initialData } : defaultFormValues
  });

  // useFieldArray for dynamic variables
  const { fields, append, remove } = useFieldArray({
    control,
    name: "ingestaVariables"
  });

  // Watch periodicity for conditional rendering
  const periodicityValue = watch("periodicity");
  const attachedFileValue = watch("attachedFile");

  // Form reset logic when modal opens or data changes
  useEffect(() => {
    if (open && mode === "edit" && initialData) {
      // Handle ingestaVariables specially to ensure at least one row
      const resetData = {
        ...defaultFormValues,
        ...initialData,
        ingestaVariables: initialData.ingestaVariables?.length
          ? initialData.ingestaVariables
          : [{ key: "", value: "" }]
      };
      reset(resetData);
    } else if (open && mode === "create") {
      reset(defaultFormValues);
    }
  }, [open, mode, initialData, reset]);

  // Submit handler
  const onSubmit = async (data: DataIntakeFormData) => {
    if (mode === "create") {
      try {
        console.log("Creating ingesta:", data);
        // Pass data to parent through onSuccess callback
        await onSuccess?.(data);

        message.success("Ingesta creada exitosamente");
        reset(defaultFormValues); // Resetear formulario
        onOpenChange(false); // Cerrar modal
      } catch (error) {
        message.error("Error al crear la ingesta");
      }
    } else if (mode === "edit") {
      console.log("Updating ingesta:", data);
      // TODO: await updateIngesta(data);
    }
  };

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
                : `Modifica la configuración de ingesta${initialData?.clientName ? ` para ${initialData.clientName}` : ""}`}
            </DialogDescription>
          </DialogHeader>

          {/* Dialog Content */}
          <div className="grid gap-6 py-4">
            {/* Cliente Input */}
            <div className="grid gap-2">
              <Label htmlFor="client-name">Cliente</Label>
              <Controller
                name="clientName"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="client-name"
                    placeholder="Nombre del cliente"
                    className="border-[#DDDDDD]"
                  />
                )}
              />
              {errors.clientName && (
                <p className="text-xs text-red-600">{errors.clientName.message}</p>
              )}
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
                      {mockTipoArchivo.map((tipo) => (
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

            {/* Periodicidad Toggles */}
            <div className="grid gap-2">
              <Label>Periodicidad</Label>
              <Controller
                name="periodicity"
                control={control}
                render={({ field }) => (
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value === "Daily"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "Daily" : "");
                        }}
                      />
                      <span className="text-sm">Daily</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value === "Weekly"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "Weekly" : "");
                        }}
                      />
                      <span className="text-sm">Weekly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={field.value === "Monthly"}
                        onCheckedChange={(checked) => {
                          field.onChange(checked ? "Monthly" : "");
                        }}
                      />
                      <span className="text-sm">Monthly</span>
                    </div>
                  </div>
                )}
              />
              {errors.periodicity && (
                <p className="text-xs text-red-600">{errors.periodicity.message}</p>
              )}
            </div>

            {/* Daily Details - Conditional */}
            {periodicityValue === "Daily" && (
              <div className="grid gap-2">
                <Label>Detalle</Label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Controller
                      name="dailyDetails.diasHabiles"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <span className="text-sm">Días hábiles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="dailyDetails.festivos"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <span className="text-sm">Festivos</span>
                  </div>
                </div>
              </div>
            )}

            {/* Weekly Details - Conditional */}
            {periodicityValue === "Weekly" && (
              <div className="grid gap-2">
                <Label>Detalle</Label>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Controller
                      name="weeklyDetails.acumulado"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <span className="text-sm">Acumulado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Controller
                      name="weeklyDetails.porRango"
                      control={control}
                      render={({ field }) => (
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      )}
                    />
                    <span className="text-sm">Por rango</span>
                  </div>
                </div>
              </div>
            )}

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
                      {mockIngesta.map((ingesta) => (
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
                      {mockStakeholders.map((stakeholder) => (
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
              {mode === "edit" && initialData?.existingFileName && !attachedFileValue && (
                <p className="text-xs text-gray-600">
                  Archivo actual: {initialData.existingFileName}
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
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting || isLoading}
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

const mockStakeholders = [
  { id: 1, name: "Juan Pérez" },
  { id: 2, name: "María García" },
  { id: 3, name: "Carlos Rodríguez" },
  { id: 4, name: "Ana Martínez" }
];

const mockIngesta = [
  { id: 1, value: "email", label: "Email" },
  { id: 2, value: "b2b-web", label: "B2B Web" },
  { id: 3, value: "api", label: "API" },
  { id: 4, value: "app", label: "App" },
  { id: 5, value: "teamcorp", label: "Teamcorp" }
];

const mockTipoArchivo = [
  { id: 1, value: "Sales", label: "Sales" },
  { id: 2, value: "Stock", label: "Stock" },
  { id: 3, value: "In transit", label: "In transit" }
];
