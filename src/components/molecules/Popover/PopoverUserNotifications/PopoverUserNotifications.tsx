import { Badge, List, Popover, Spin, Flex } from "antd";
import React, { useState, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "react-query";
import Link from "next/link";
import { BellSimpleRinging, Envelope, Eye } from "phosphor-react";

import { markNotificationAsRead } from "@/services/notifications/notification";
import { API } from "@/utils/api/api";
import { useModalDetail } from "@/context/ModalContext";
import { useNotificationStore } from "@/context/CountNotification";
import UiTab from "@/components/ui/ui-tab";

import "./popoverUserNotifications.scss";

interface Notification {
  create_at: string;
  notification_type_name: string;
  client_name: string;
  incident_id: number;
  is_client_change: number;
  client_update_changes: Record<string, any>;
  days: string;
  id: number;
  is_read: number;
  id_erp: string;
}

interface PopoverUserNotificationsProps {
  setIsPopoverVisible: React.Dispatch<React.SetStateAction<boolean>>;
  isPopoverVisible: boolean;
  projectId: number;
}

export const PopoverUserNotifications: React.FC<PopoverUserNotificationsProps> = ({
  setIsPopoverVisible,
  isPopoverVisible,
  projectId
}) => {
  const { notificationCount, updateNotificationCount, startPolling } =
    useNotificationStore();
  const { openModal } = useModalDetail();

  useEffect(() => {
    startPolling();
  }, [startPolling]);
  const queryClient = useQueryClient();
  const [shouldFetchData, setShouldFetchData] = useState(false);

  const fetchOpenNotifications = async (): Promise<Notification[]> => {
    const response = await API.get(`/notification/project/${projectId}/user`);
    return response.data;
  };

  const fetchRejectedNotifications = async (): Promise<Notification[]> => {
    const response = await API.get(`/notification/rejecteds/project/${projectId}/user`);

    return response.data;
  };

  const { data: openNotifications, isLoading: isLoadingOpen } = useQuery(
    ["openNotifications", projectId],
    fetchOpenNotifications,
    {
      enabled: shouldFetchData,
      staleTime: Infinity, // Prevent auto-refetching
      cacheTime: 0 // Don't cache the data
    }
  );

  const { data: rejectedNotifications, isLoading: isLoadingRejected } = useQuery(
    ["rejectedNotifications", projectId],
    fetchRejectedNotifications,
    {
      enabled: shouldFetchData,
      staleTime: Infinity, // Prevent auto-refetching
      cacheTime: 0 // Don't cache the data
    }
  );

  const handleVisibleChange = useCallback(
    async (visible: boolean) => {
      setIsPopoverVisible(visible);
      if (visible) {
        setShouldFetchData(true);
        updateNotificationCount();
        // Refetch notifications when popover opens
        queryClient.invalidateQueries(["openNotifications", projectId]);
        queryClient.invalidateQueries(["rejectedNotifications", projectId]);
      } else {
        setShouldFetchData(false);
      }
    },
    [setIsPopoverVisible, updateNotificationCount, queryClient, projectId]
  );

  const renderList = (data: Notification[] | undefined, isLoading: boolean) => {
    if (isLoading) return <Spin />;
    if (!data) return null;
    return (
      <List
        itemLayout="horizontal"
        dataSource={data}
        renderItem={(item) => {
          return (
            <List.Item>
              <div>
                <Flex gap={"8px"} align="center">
                  <p className="item__title">
                    {item.notification_type_name}
                    {item.id_erp && ` ${item.id_erp}`}
                  </p>
                  {item.is_read === 0 ? (
                    <div className="item__read">
                      <Envelope size={11} />
                    </div>
                  ) : null}
                </Flex>
                <p className="item__name">{item.client_name}</p>
                <p className="item__date">{item.days}</p>
              </div>
              <div
                className="eyeIcon"
                onClick={() => {
                  if (item.notification_type_name === "Novedad") {
                    openModal("novelty", { noveltyId: item.incident_id });
                  }
                  if (item.is_read === 0) {
                    markNotificationAsRead(item.id).then(() => {
                      setShouldFetchData(true);

                      queryClient.invalidateQueries(["openNotifications", projectId]);
                      queryClient.invalidateQueries(["rejectedNotifications", projectId]);
                    });
                  }
                  handleVisibleChange(false);
                }}
              >
                <Eye size={24} />
              </div>
            </List.Item>
          );
        }}
      />
    );
  };

  const items = [
    {
      key: "1",
      label: `Abiertos ${openNotifications && openNotifications.length > 0 ? `(${openNotifications.length})` : ""}`,
      children: renderList(openNotifications, isLoadingOpen)
    },
    {
      key: "2",
      label: `Cerradas ${rejectedNotifications && rejectedNotifications.length > 0 ? `(${rejectedNotifications.length})` : ""}`,
      children: renderList(rejectedNotifications, isLoadingRejected)
    }
  ];

  const content = (
    <div className="notificationsPopoverContent">
      <div className="modalTitle">
        <div className="title__text">
          <p>Notificaciones</p>
        </div>
        <div>
          <Link href="/notificaciones" passHref>
            Ver todo
          </Link>
        </div>
      </div>
      <UiTab tabs={items} />
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      open={isPopoverVisible}
      onOpenChange={handleVisibleChange}
      placement="bottomLeft"
      overlayClassName="notificationsPopover"
      arrow={false}
    >
      <div className="notificationsWrapper">
        <div className={`notifications ${notificationCount > 0 ? "notifications_active" : ""}`}>
          {notificationCount > 0 ? (
            <Badge size="small" color="black" count={notificationCount}>
              <BellSimpleRinging size={18} />
            </Badge>
          ) : (
            <BellSimpleRinging size={18} />
          )}
        </div>
      </div>
    </Popover>
  );
};
