import { IParameterData, IParameterVariable } from "@/types/dataQuality/IDataQuality";
import { DataIntakeFormData } from "../components/modal-data-intake/modal-data-intake";

export const transformParameterDataToFormData = (
  parameterData: IParameterData
): Partial<DataIntakeFormData> => {
  const { client_data, archive_rules, variables, catalogs } = parameterData;

  // Get first archive rule (assuming single rule per client for now)
  const firstArchiveRule = archive_rules?.[0];

  // Extract periodicity from repeat.frequency
  const frequency = firstArchiveRule?.periodicity_json?.repeat?.frequency?.toLowerCase();
  let periodicity: "Daily" | "Weekly" | "Monthly" | "" = "";

  if (frequency === "daily") periodicity = "Daily";
  else if (frequency === "weekly") periodicity = "Weekly";
  else if (frequency === "monthly") periodicity = "Monthly";

  // Transform stakeholder ID to name for display
  const stakeholderName =
    catalogs.stakeholders.find((s) => s.id === client_data.stakeholder)?.name || "";

  // Get file type description from archive rule
  const fileType =
    catalogs.archive_types.find((t) => t.id === firstArchiveRule?.id_type_archive)?.description ||
    "";

  // Transform variables array to key-value pairs
  const ingestaVariables =
    variables && variables.length > 0
      ? variables.map((v: IParameterVariable) => ({
          key: v.variable_key || "",
          value: v.variable_value || ""
        }))
      : [{ key: "", value: "" }];

  // Extract ingestaSource from first intake type as default
  // Note: Edit mode is not yet implemented, so this is only used for initial form state
  const ingestaSource =
    parameterData.intake_types && parameterData.intake_types.length > 0
      ? parameterData.intake_types[0].description
      : "";

  // Extract daily/weekly details from periodicity_json if structure allows
  // For now, use defaults - can be refined later based on actual structure
  const dailyDetails = { diasHabiles: false, festivos: false };
  const weeklyDetails = { acumulado: false, porRango: false };

  return {
    clientName: client_data.client_name,
    fileType,
    periodicity,
    stakeholder: stakeholderName,
    ingestaVariables,
    ingestaSource,
    dailyDetails,
    weeklyDetails,
    attachedFile: null
  };
};
