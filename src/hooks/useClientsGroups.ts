import useSWR from "swr";
import { fetcher } from "@/utils/api/api";
import { IClientsGroupsFull } from "@/types/clientsGroups/IClientsGroups";
import { useAppStore } from "@/lib/store/store";
import { changeGroupState, createGroup, deleteGroups } from "@/services/groupClients/groupClients";

interface Props {
  page?: number;
  clients?: string[];
  subscribers?: string[];
  activeUsers?: "all" | "active" | "inactive";
  noLimit?: boolean;
  searchQuery?: string;
}

export const useClientsGroups = ({
  page,
  clients,
  subscribers,
  activeUsers,
  noLimit,
  searchQuery
}: Props) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const clientsQuery = clients && clients.length > 0 ? `&clients=${clients.join(",")}` : "";
  const subsQuery =
    subscribers && subscribers.length > 0 ? `&subscribers=${subscribers.join(",")}` : "";
  const statusQuery =
    activeUsers === "active" || activeUsers === "inactive"
      ? `&status=${activeUsers === "active" ? 1 : 0}`
      : "";
  const pageQuery = page ? `&page=${page}` : "";
  const limitQuery = noLimit ? "&noLimit=true" : "";
  const searchQueryParam = searchQuery
    ? `&searchQuery=${encodeURIComponent(searchQuery.toLowerCase().trim())}`
    : "";

  const pathKey = `/group-client/?project_id=${projectId}${pageQuery}${clientsQuery}${subsQuery}${statusQuery}${limitQuery}${searchQueryParam}`;

  const { data, error, isLoading, mutate } = useSWR<IClientsGroupsFull>(pathKey, fetcher, {});

  const deleteSelectedGroups = async (selectedGroups: number[]) => {
    await deleteGroups(selectedGroups, projectId);
    mutate();
  };

  const changeGroupsState = async (groups_id: number[], status: 0 | 1) => {
    await changeGroupState(groups_id, status, projectId);
    mutate();
  };

  const addGroup = async (group: { name: string; clients: React.Key[] }) => {
    await createGroup(group, projectId);
    mutate();
  };

  return {
    clients: data?.data || [],
    data: data,
    loading: isLoading,
    error,
    deleteSelectedGroups,
    changeGroupsState,
    addGroup
  };
};
