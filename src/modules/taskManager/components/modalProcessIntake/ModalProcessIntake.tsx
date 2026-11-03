import { useEffect, useState } from "react";
import { Modal, Select as AntSelect, Typography } from "antd";
import { useTranslations } from "use-intl";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { getAllCountries } from "@/services/countries/countries";
import { useDataClients } from "@/modules/dataQuality/hooks/useDataClients";

import { Datum as ICountryOption } from "@/types/countries/IListCountries";
import { IntakeFilesTable } from "./IntakeFilesTable";

const { Title } = Typography;

interface IModalProcessIntakeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModalProcessIntake = ({ isOpen, onClose }: IModalProcessIntakeProps) => {
  const t = useTranslations("taskManager.intake");
  const tCommon = useTranslations("common");
  const [view, setView] = useState<"client" | "files">("client");
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [countries, setCountries] = useState<ICountryOption[]>([]);
  const [countriesLoading, setCountriesLoading] = useState(false);

  const { clients, isLoading: clientsLoading } = useDataClients(selectedCountryId);

  useEffect(() => {
    if (!isOpen || countries.length > 0) return;
    let cancelled = false;
    setCountriesLoading(true);
    getAllCountries()
      .then((res) => {
        if (!cancelled && Array.isArray(res)) setCountries(res);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setCountriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, countries.length]);

  const handleClose = () => {
    setView("client");
    setSelectedCountryId(null);
    setSelectedClientId(null);
    onClose();
  };

  const handleCountryChange = (value: number) => {
    setSelectedCountryId(value);
    setSelectedClientId(null);
  };

  const filterByLabel = (input: string, option?: { label?: unknown }) =>
    ((option?.label as string) ?? "").toLowerCase().includes(input.toLowerCase());

  return (
    <Modal
      open={isOpen}
      onCancel={handleClose}
      title={<Title level={4}>{t("title")}</Title>}
      width={480}
      centered
      footer={
        view === "client" ? (
          <FooterButtons
            titleConfirm={t("confirmClient")}
            titleCancel={tCommon("actions.cancel")}
            onClose={handleClose}
            handleOk={() => setView("files")}
            isConfirmDisabled={!selectedClientId}
          />
        ) : null
      }
      destroyOnClose
    >
      {view === "client" ? (
        <div className="flex flex-col gap-4 py-2">
          <div>
            <label className="text-sm font-medium text-gray-700">{t("country")}</label>
            <AntSelect
              showSearch
              value={selectedCountryId ?? undefined}
              onChange={handleCountryChange}
              options={countries.map((c) => ({ value: c.id, label: c.country_name }))}
              loading={countriesLoading}
              placeholder={countriesLoading ? t("loadingCountries") : t("selectCountry")}
              notFoundContent={t("noCountries")}
              filterOption={filterByLabel}
              className="mt-1 w-full [&_.ant-select-selector]:!h-[38px]"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">
              {tCommon("fields.customer")}
            </label>
            <AntSelect
              showSearch
              disabled={selectedCountryId === null}
              value={selectedClientId ?? undefined}
              onChange={(value) => setSelectedClientId(value)}
              options={(clients ?? []).map((c) => ({ value: c.id, label: c.client_name }))}
              loading={clientsLoading}
              placeholder={clientsLoading ? t("loadingClients") : t("selectClient")}
              notFoundContent={t("noClients")}
              filterOption={filterByLabel}
              className="mt-1 w-full [&_.ant-select-selector]:!h-[38px]"
            />
          </div>
        </div>
      ) : (
        selectedClientId && <IntakeFilesTable clientId={selectedClientId} />
      )}
    </Modal>
  );
};
