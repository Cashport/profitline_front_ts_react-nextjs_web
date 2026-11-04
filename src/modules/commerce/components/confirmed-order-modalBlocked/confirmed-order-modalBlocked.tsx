import { FC, useState } from "react";
import { useRouter } from "next/navigation";
import { Flex, message, Modal } from "antd";
import { CaretLeft } from "phosphor-react";
import { useTranslations } from "use-intl";

import { uploadNotificationEvidence } from "@/services/notifications/notification";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import ModalAttachEvidence from "@/components/molecules/modals/ModalEvidence/ModalAttachEvidence";

import "./confirmed-order-modalBlocked.scss";

export interface IConfirmedOrderModalBlocked {
  notificationId: number;
  customStyles?: React.CSSProperties;
}

const ConfirmedOrderModalBlocked: FC<IConfirmedOrderModalBlocked> = ({
  customStyles,
  notificationId
}) => {
  const t = useTranslations("commerce.blockedOrderModal");
  const tCommon = useTranslations("common");
  const [loadingRequest, setLoadingRequest] = useState(false);
  const [view, setView] = useState("blocked");
  const [selectedEvidence, setSelectedEvidence] = useState<File[]>([]);
  const router = useRouter();

  const handleSendToApproval = () => {
    router.push("/commerce");
    message.success(t("sentToApproval"));
  };

  const handleClientPaid = () => {
    // Logic to handle the case when the client pays
    setView("paid");
  };

  const handleAddSupport = async () => {
    setLoadingRequest(true);
    if (selectedEvidence.length === 0) {
      message.error(t("attachRemittance"));
      return;
    }
    try {
      await uploadNotificationEvidence(notificationId, selectedEvidence[0]);
      message.success(t("remittanceAdded"));
      router.push("/commerce");
    } catch (error) {
      message.error(t("remittanceError"));
    }
    setLoadingRequest(false);
  };

  const renderView = (view: string) => {
    switch (view) {
      case "blocked":
        return (
          <Flex vertical align="center" gap={"1.5rem"} className="blockedView">
            <h4 className="title">{t("title")}</h4>
            <p className="description">{t("description")}</p>
            <FooterButtons
              handleOk={handleSendToApproval}
              onClose={handleClientPaid}
              titleConfirm={t("sendToApproval")}
              titleCancel={t("cashOrder")}
            />
          </Flex>
        );
      case "paid":
        return (
          <Flex vertical align="flex-start" gap={"1.5rem"} className="paidView">
            <Flex
              align="center"
              gap={"0.5rem"}
              style={{ alignSelf: "flex-start" }}
              onClick={() => setView("blocked")}
            >
              <CaretLeft size={20} />
              <h4 className="title">{t("uploadRemittance")}</h4>
            </Flex>
            <p className="paidView__description" style={{ textAlign: "left" }}>
              {t("attachEvidence")}
            </p>

            <ModalAttachEvidence
              selectedEvidence={selectedEvidence}
              setSelectedEvidence={setSelectedEvidence}
              handleAttachEvidence={handleAddSupport}
              isOpen={true}
              handleCancel={() => setView("blocked")}
              customTexts={{
                title: t("uploadRemittance"),
                description: t("attachEvidence"),
                acceptButtonText: t("sendRemittance"),
                cancelButtonText: tCommon("actions.cancel")
              }}
              multipleFiles={false}
              noComment={true}
              noModal={true}
              noTitle={true}
              noDescription={true}
              isMandatory={{ evidence: true }}
              loading={loadingRequest}
            />
          </Flex>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      className="confirmedOrderModal"
      open={true}
      footer={null}
      title={null}
      style={customStyles}
      closable={false}
      width={686}
    >
      {renderView(view)}
    </Modal>
  );
};

export default ConfirmedOrderModalBlocked;
