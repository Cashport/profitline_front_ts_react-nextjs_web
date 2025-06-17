import { Button, Flex, MenuProps, Spin } from "antd";
import { useState } from "react";
import { Bank, CaretLeft } from "phosphor-react";

import { useBankRules } from "@/hooks/useBankRules";
import { useBankPayments } from "@/hooks/useBankPayments";
import { useDebounce } from "@/hooks/useDeabouce";

import UiSearchInput from "@/components/ui/search-input";
import FilterDiscounts from "@/components/atoms/Filters/FilterDiscounts/FilterDiscounts";
import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import BanksRulesTable from "../../components/banks-rules-table/Banks-rules-table";
import { BankRuleModal } from "../../components/bank-rule-modal/Bank-rule-modal";

import styles from "./banks-rules.module.scss";

import { deleteManyBankRules } from "@/services/banksRules/banksRules";
import { useMessageApi } from "@/context/MessageContext";

interface PropsBanksRules {
  onClickBack: () => void;
}

export const BanksRules = ({ onClickBack }: PropsBanksRules) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showBankRuleModal, setShowBankRuleModal] = useState({
    isOpen: false,
    ruleId: 0
  });

  const { showMessage } = useMessageApi();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { data, isLoading, mutate } = useBankRules({
    page,
    search: debouncedSearchQuery
  });
  const { mutate: mutatePayments } = useBankPayments({});

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const onChangePage = (pagePagination: number) => {
    setPage(pagePagination);
  };

  const handleDeleteRules = async () => {
    if (!selectedRowKeys.length) return;

    setIsDeleting(true);
    try {
      await deleteManyBankRules(selectedRowKeys);
      showMessage("success", `${selectedRowKeys.length} regla(s) eliminada(s) exitosamente`);
      setSelectedRowKeys([]);
      mutate();
    } catch (error) {
      showMessage("error", "Error al eliminar las reglas");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateNewRule = () => {
    setShowBankRuleModal({
      isOpen: true,
      ruleId: 0
    });
  };

  const items: MenuProps["items"] = [
    {
      key: "discount-option-1",
      label: (
        <Button
          className="buttonOutlined"
          onClick={handleDeleteRules}
          loading={isDeleting}
          disabled={selectedRowKeys.length === 0}
        >
          Eliminar
        </Button>
      )
    }
  ];

  return (
    <div className={styles.banksRules}>
      <Flex justify="space-between" style={{ height: "3rem" }} align="center">
        <Button
          type="text"
          size="large"
          style={{ paddingLeft: 0, fontWeight: 600 }}
          onClick={onClickBack}
          icon={<CaretLeft size={"1.45rem"} />}
        >
          Reglas de bancos
        </Button>

        <PrincipalButton
          onClick={handleCreateNewRule}
          customStyles={{ marginLeft: "auto", height: "3rem" }}
        >
          Crear nueva regla <Bank size={16} />
        </PrincipalButton>
      </Flex>

      <div className={styles.tableHeaderButtons}>
        <UiSearchInput placeholder="Buscar" onChange={(e) => handleSearch(e.target.value)} />
        <FilterDiscounts />
        <DotsDropdown items={items} />
      </div>

      {isLoading ? (
        <Flex justify="center" align="center" style={{ margin: "3rem 0" }}>
          <Spin />
        </Flex>
      ) : (
        <BanksRulesTable
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          rules={data}
          setShowBankRuleModal={setShowBankRuleModal}
          page={page}
          onChangePage={onChangePage}
        />
      )}

      <BankRuleModal
        showBankRuleModal={showBankRuleModal}
        onClose={() =>
          setShowBankRuleModal({
            isOpen: false,
            ruleId: 0
          })
        }
        mutate={() => {
          mutate();
          mutatePayments();
        }}
      />
    </div>
  );
};

export default BanksRules;
