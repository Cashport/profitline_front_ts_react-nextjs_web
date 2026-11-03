import { getTranslator } from "@/i18n/translator";
import useSWR from "swr";

import { IProjects } from "@/types/projects/IProjects";
import { fetcher } from "@/utils/api/api";
import { useRouter } from "next/navigation";
import { logOut } from "../../firebase-utils";

interface Props {
  page?: number;
  countryId: string[];
  currencyId: string[];
  searchQuery: string;
}

export const useProjects = ({ page, countryId, currencyId, searchQuery }: Props) => {
  const router = useRouter();
  const pathKey = `/project?page=${page}${countryId.length > 0 ? `&country_id=${countryId.join(",")}` : ""}${currencyId.length > 0 ? `${`&currency_id=${currencyId.join(",")}`}` : ""}${searchQuery ? `&searchQuery=${searchQuery}` : ""}`;

  const { data, error, isLoading, mutate } = useSWR<IProjects>(pathKey, fetcher, {
    revalidateOnMount: true,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });
  if (error?.message && error.message === "Request failed with status code 401") {
    alert(getTranslator("shared")("session.unauthorized"));
    logOut(router);
    mutate(undefined, false);
  }
  return {
    data: (data as IProjects) || ({ pagination: { totalRows: 1 } } as IProjects),
    loading: isLoading,
    error
  };
};
