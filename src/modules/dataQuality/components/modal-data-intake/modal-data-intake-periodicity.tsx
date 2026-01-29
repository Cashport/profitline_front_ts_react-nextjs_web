import { Control, Controller, useFormState, useWatch } from "react-hook-form";
import { Label } from "@/modules/chat/ui/label";
import { Switch } from "@/modules/chat/ui/switch";
import { DataIntakeFormData } from "./modal-data-intake";

interface ModalDataIntakePeriodicityProps {
  control: Control<DataIntakeFormData>;
}

export function ModalDataIntakePeriodicity({ control }: ModalDataIntakePeriodicityProps) {
  // Use useFormState to access errors internally
  const { errors } = useFormState({ control });

  // Use useWatch to track periodicity for conditional rendering
  const periodicityValue = useWatch({ control, name: "periodicity" });

  return (
    <>
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
    </>
  );
}
