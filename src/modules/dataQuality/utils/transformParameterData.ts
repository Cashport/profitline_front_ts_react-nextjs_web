import { IParameterData, IParameterVariable } from "@/types/dataQuality/IDataQuality";
import { DataIntakeFormData } from "../components/modal-data-intake/modal-data-intake";

export const transformParameterDataToFormData = (
  parameterData: IParameterData
): Partial<DataIntakeFormData> => {
  const { client_data, archive_rules, variables } = parameterData;

  // Get first archive rule (assuming single rule per client for now)
  const firstArchiveRule = archive_rules?.[0];

  // Get file type description from archive rule
  const fileType =
    parameterData.catalogs.archive_types.find(
      (t) => t.id === firstArchiveRule?.id_type_archive
    )?.description || "";

  // Transform variables array to key-value pairs
  const ingestaVariables =
    variables && variables.length > 0
      ? variables.map((v: IParameterVariable) => ({
          key: v.variable_key || "",
          value: v.variable_value || ""
        }))
      : [{ key: "", value: "" }];

  // Extract ingestaSource from first intake type as default
  const ingestaSource =
    parameterData.intake_types && parameterData.intake_types.length > 0
      ? parameterData.intake_types[0].description
      : "";

  return {
    clientName: client_data.client_name,
    fileType,
    ingestaVariables,
    ingestaSource,
    attachedFile: null
  };
};
