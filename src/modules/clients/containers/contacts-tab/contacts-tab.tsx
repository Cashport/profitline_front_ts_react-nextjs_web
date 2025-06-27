import { useState } from "react";
import { useParams } from "next/navigation";
import { Button, Flex, MenuProps, Spin } from "antd";
import { Plus } from "phosphor-react";
import UiSearchInput from "@/components/ui/search-input";
import { extractSingleParam } from "@/utils/utils";
import { DotsDropdown } from "@/components/atoms/DotsDropdown/DotsDropdown";
import UiFilterDropdown from "@/components/ui/ui-filter-dropdown";
import ContactsTable from "../../components/contacts-tab-table";
import { IContact } from "@/types/contacts/IContacts";
import { useClientContacts } from "@/hooks/useClientContacts";
import ContactsModal from "../../components/contacts-tab-modal";

import "./contacts-tab.scss";
import { useMessageApi } from "@/context/MessageContext";

type showContactModalType = {
  isOpen: boolean;
  contactId: number;
};

const ContactsTab = () => {
  const [selectedRows, setSelectedRows] = useState<IContact[] | undefined>(undefined);
  const [showContactModal, setShowContactModal] = useState<showContactModalType>(
    {} as showContactModalType
  );
  const [search, setSearch] = useState("");
  const { showMessage } = useMessageApi();
  const params = useParams();
  const clientIdParam = extractSingleParam(params.clientId);
  const clientId = clientIdParam || "";
  const { data, isLoading, createContact, updateContact, deleteSelectedContacts } =
    useClientContacts(clientId);

  const handleDeleteClients = () => {
    if (selectedRows) {
      const selectedContactIds = selectedRows.map((contact) => contact.id);
      deleteSelectedContacts(selectedContactIds, showMessage);
    }
  };

  const handleCreateNewContact = () => {
    setShowContactModal({ isOpen: true, contactId: 0 });
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Button className="buttonOutlined" onClick={handleDeleteClients}>
          Eliminar
        </Button>
      )
    }
  ];

  return (
    <>
      {isLoading ? (
        <Flex justify="center" align="center" style={{ height: "3rem" }}>
          <Spin />
        </Flex>
      ) : (
        <div className="contactsTab">
          <Flex justify="space-between" className="contactsTab__header">
            <Flex gap={"0.5rem"}>
              <UiSearchInput
                className="standardSearch"
                placeholder="Buscar"
                onChange={(event) => {
                  setTimeout(() => {
                    setSearch(event.target.value);
                  }, 1000);
                }}
              />
              <UiFilterDropdown />
              <DotsDropdown items={items} />
            </Flex>

            <Button type="primary" className="newContactButton" onClick={handleCreateNewContact}>
              Nuevo Contacto
              <Plus size={16} style={{ marginLeft: "0.5rem" }} />
            </Button>
          </Flex>

          <ContactsTable
            dataAllContacts={data ? data.data : []}
            setSelectedRows={setSelectedRows}
            setShowContactModal={setShowContactModal}
          />

          {showContactModal.isOpen && (
            <ContactsModal
              setShowContactModal={setShowContactModal}
              showContactModal={showContactModal}
              createContact={createContact}
              updateContact={updateContact}
              clientId={clientId}
            />
          )}
        </div>
      )}
    </>
  );
};

export default ContactsTab;
