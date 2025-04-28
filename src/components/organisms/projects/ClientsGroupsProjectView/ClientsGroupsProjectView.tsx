import { useState } from "react";
import { SelectedGroupView } from "@/components/organisms/projects/SelectedGroupView/SelectedGroupView";
import { ClientsGroupsTable } from "@/components/molecules/tables/ClientsGroupsTable/ClientsGroupsTable";

export type groupInfo = {
  groupId: number;
  groupName: string;
  clientsIds: string[];
};

type showGroupDetails = {
  groupId: number;
  showDetails: boolean;
};

export const ClientsGroupsProjectView = () => {
  const [showGroupDetails, setShowGroupDetails] = useState<showGroupDetails>(
    {} as showGroupDetails
  );

  const goBackToClientsGroups = () => {
    setShowGroupDetails({} as showGroupDetails);
  };

  return (
    <>
      {showGroupDetails.showDetails ? (
        <SelectedGroupView
          onClickBack={goBackToClientsGroups}
          showGroupDetails={showGroupDetails}
        />
      ) : (
        <ClientsGroupsTable setShowGroupDetails={setShowGroupDetails} />
      )}
    </>
  );
};
