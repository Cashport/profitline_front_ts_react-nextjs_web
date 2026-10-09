import { IResponseContactOptions } from "@/types/contacts/IContacts";
import { fetcher } from "@/utils/api/api";
import useSWR from "swr";

export const useContactModalOptions = () => {
  const { data, isLoading } = useSWR<IResponseContactOptions>(
    "/client/contact/options",
    fetcher,
    {}
  );

  const callingCodeOptions =
    data?.data && typeof data.data === "object"
      ? "country_calling_code" in data.data
        ? data?.data?.country_calling_code?.map((option) => {
            return {
              value: option.id,
              label: `${option.code} ${option.country_name}`,
              className: "selectOptions"
            };
          })
        : []
      : [];

  const roleOptions =
    data?.data && typeof data.data === "object"
      ? "contact_position" in data.data
        ? data?.data?.contact_position?.map((option) => {
            return {
              value: option.id,
              label: option.name,
              className: "selectOptions"
            };
          })
        : []
      : [];

  return { callingCodeOptions, roleOptions, isLoading };
};
