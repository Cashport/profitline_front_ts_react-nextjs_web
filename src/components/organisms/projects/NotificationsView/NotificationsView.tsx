"use client";
import React, { useState, useEffect } from "react";
import { Flex, Tabs, Spin } from "antd";
import { Eye } from "phosphor-react";
import { useTranslations } from "use-intl";

import { useAppStore } from "@/lib/store/store";
import { useModalDetail } from "@/context/ModalContext";
import { useNotificationOpen } from "@/hooks/useNotificationOpen";
import { useRejectedNotifications } from "@/hooks/useNotificationReject";
import UiSearchInput from "@/components/ui/search-input/search-input";
import FiltersNotifications, {
  ISelectFilterNotifications
} from "@/components/atoms/Filters/FiltersNotifications/FiltersNotifications";

import { INotification } from "@/types/notifications/INotifications";

import "./notificationsView.scss";

const ListPanel = [{ key: "opened" }, { key: "closed" }] as const;

export const NotificationsView = () => {
  const t = useTranslations("projects.notifications");
  const tCommon = useTranslations("common");
  const { openModal, modalType } = useModalDetail();
  const { ID: projectId } = useAppStore((state) => state.selectedProject);
  const [filters, setFilters] = useState<ISelectFilterNotifications>({
    lines: [],
    sublines: [],
    notificationTypes: []
  });

  const {
    data: openNotifications,
    isLoading: isLoadingOpen,
    isError: isErrorOpen,
    mutate: mutateOpen
  } = useNotificationOpen({ projectId, filters });
  const {
    data: closedNotifications,
    isLoading: isLoadingClosed,
    isError: isErrorClosed,
    mutate: mutateClosed
  } = useRejectedNotifications(projectId);
  const [filteredOpenNotifications, setFilteredOpenNotifications] = useState<INotification[]>([]);
  const [filteredClosedNotifications, setFilteredClosedNotifications] = useState<INotification[]>(
    []
  );

  useEffect(() => {
    if (openNotifications) setFilteredOpenNotifications(openNotifications);
    if (closedNotifications) setFilteredClosedNotifications(closedNotifications);
  }, [openNotifications, closedNotifications]);

  const handleSearch = (searchTerm: string) => {
    if (openNotifications) {
      setFilteredOpenNotifications(
        openNotifications.filter(
          (notification) =>
            notification.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.notification_type_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
    if (closedNotifications) {
      setFilteredClosedNotifications(
        closedNotifications.filter(
          (notification) =>
            notification.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            notification.notification_type_name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }
  };
  useEffect(() => {
    if (modalType === null) {
      mutateClosed();
      mutateOpen();
    }
  }, [modalType]);

  const renderNotifications = (type: "opened" | "closed") => {
    const currentNotifications =
      type === "opened" ? filteredOpenNotifications : filteredClosedNotifications;
    const isLoading = type === "opened" ? isLoadingOpen : isLoadingClosed;
    const isError = type === "opened" ? isErrorOpen : isErrorClosed;

    if (isLoading) return <Spin size="large" />;
    if (isError) return <div>{t("loadError")}</div>;

    return currentNotifications.map((item, index) => (
      <Flex className="notifications__container" key={index}>
        <div className="notifications__list">
          <div className="list-item">
            <div>
              <Flex gap="1rem">
                <p className="item__title">
                  {item.notification_type_name} - {item.id_erp}
                </p>
                <p className="item__name">{item.client_name}</p>
                <p className="item__date">{item.days}</p>
              </Flex>
              <p className="item__description">{item.incident_motive}</p>
            </div>
            <Flex gap="1rem">
              {/* {type === "closed" && (
                <>
                  <div className="label__status">
                    <Check size={14} />
                    Aprobar
                  </div>
                  <div className="label__status">
                    <X size={14} />
                    Rechazar
                  </div>
                </>
              )} */}
              <div
                className="eyeIcon"
                role="button"
                aria-label={t("viewDetail")}
                onClick={() => {
                  if (item.notification_type_name === "Novedad") {
                    openModal("novelty", { noveltyId: item.incident_id ?? 0 });
                  }
                }}
              >
                <Eye size={28} />
              </div>
            </Flex>
          </div>
        </div>
      </Flex>
    ));
  };

  return (
    <div className="notificationView">
      <Tabs
        defaultActiveKey="0"
        style={{ width: "100%", height: "100%" }}
        items={ListPanel.map((item, i) => {
          return {
            label: t(item.key, {
              count:
                item.key === "opened"
                  ? filteredOpenNotifications.length
                  : filteredClosedNotifications.length
            }),
            key: String(i),
            children: (
              <Flex vertical>
                <Flex className="searchBar__container">
                  <UiSearchInput
                    placeholder={tCommon("placeholders.search")}
                    onChange={(event) => {
                      setTimeout(() => {
                        handleSearch(event.target.value);
                      }, 300);
                    }}
                  />
                  <FiltersNotifications setSelectedFilters={setFilters} />
                </Flex>
                {renderNotifications(item.key)}
              </Flex>
            )
          };
        })}
      />
    </div>
  );
};
