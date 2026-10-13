import { useEffect, useState } from "react";
import { Flex, Modal, Select, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { IBalanceRow } from "@/types/financialDiscounts/IFinancialDiscounts";
import { IUser } from "@/types/users/IUser";
import { getUsersByProject } from "@/services/users/users";
import { sendBalanceToApproval } from "@/services/balances/balances";
import { useAppStore } from "@/lib/store/store";
import { useMessageApi } from "@/context/MessageContext";

const { Title } = Typography;

interface ModalSendBalance2ApprovalProps {
  isOpen: boolean;
  onClose: () => void;
  record: IBalanceRow;
  onUploaded?: () => void;
}

export function ModalSendBalanceToApproval({
  isOpen,
  onClose,
  record,
  onUploaded
}: ModalSendBalance2ApprovalProps) {
  const { ID } = useAppStore((projects) => projects.selectedProject);
  const { showMessage } = useMessageApi();

  const [approvalUserId, setApprovalUserId] = useState<number | null>(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset local state whenever the modal closes
  useEffect(() => {
    if (!isOpen) {
      setApprovalUserId(null);
      setUsers([]);
    }
  }, [isOpen]);

  // Fetch project users whenever the modal opens
  useEffect(() => {
    if (!isOpen || !ID) return;
    let cancelled = false;

    const fetchUsers = async () => {
      setUsersLoading(true);
      try {
        const res = await getUsersByProject(ID);
        if (
          !cancelled &&
          res &&
          typeof res === "object" &&
          "data" in res &&
          Array.isArray(res.data)
        ) {
          setUsers(res.data as IUser[]);
        }
      } catch (error) {
        console.error("Error fetching users for project:", ID, error);
      } finally {
        if (!cancelled) setUsersLoading(false);
      }
    };

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [isOpen, ID]);

  const handleOk = async () => {
    if (!approvalUserId) return;

    setIsLoading(true);
    try {
      await sendBalanceToApproval(record.id, approvalUserId);
      showMessage("success", "Saldo enviado a aprobación correctamente");
      onUploaded?.();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error al enviar a aprobación";
      showMessage("error", message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      centered
      open={isOpen}
      width={600}
      onCancel={onClose}
      title={<Title level={4}>Enviar a aprobación</Title>}
      footer={
        <FooterButtons
          titleConfirm="Enviar a aprobación"
          onClose={onClose}
          handleOk={handleOk}
          isConfirmDisabled={!approvalUserId}
          isConfirmLoading={isLoading}
        />
      }
      destroyOnClose
    >
      <Flex vertical gap="0.25rem" style={{ marginBottom: "1rem" }}>
        <h4 className="inputTitle">Usuario aprobación</h4>
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="Selecciona el usuario de aprobación"
          style={{ width: "100%", height: 38 }}
          options={users.map((u) => ({ value: u.id, label: u.user_name }))}
          loading={usersLoading}
          value={approvalUserId}
          onChange={(value) => setApprovalUserId(value)}
        />
      </Flex>
    </Modal>
  );
}
