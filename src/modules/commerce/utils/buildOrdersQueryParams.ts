export const buildOrdersQueryParams = (params: {
  sellers?: string[];
  status_id?: number;
  page?: number;
  search?: string;
}): string => {
  const queryParams: string[] = [];

  if (params.sellers && params.sellers.length > 0) {
    queryParams.push(`sellers=${params.sellers.join(",")}`);
  }

  if (params.status_id) {
    queryParams.push(`status_id=${params.status_id}`);
  }

  if (params.page) {
    queryParams.push(`page=${params.page}`);
  }

  if (params.search) {
    queryParams.push(`search=${encodeURIComponent(params.search)}`);
  }

  return queryParams.length > 0 ? `?${queryParams.join("&")}` : "";
};
