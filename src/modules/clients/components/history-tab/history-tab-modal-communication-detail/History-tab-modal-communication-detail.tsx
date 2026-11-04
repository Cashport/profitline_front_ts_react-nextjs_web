import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Flex, Modal } from "antd";
import { FileArrowUp } from "phosphor-react";
import { useTranslations } from "use-intl";

import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import GeneralSearchSelect from "@/components/ui/general-search-select";

import "./history-tab-modal-communication-detail.scss";
import { getCommunicationDetail } from "@/services/history/history";

interface DigitalRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  mongoID?: string;
}

interface ISelect {
  value: string;
  label: string;
}
export interface IFormDigitalRecordModal {
  forward_to: ISelect[];
  copy_to?: ISelect[];
  subject: string;
  body: string;
  attachments: File[];
}

const ModalCommunicationDetail = ({ isOpen, onClose, mongoID }: DigitalRecordModalProps) => {
  const t = useTranslations("clients.history.communicationDetail");
  const { control, setValue, watch, reset } = useForm<IFormDigitalRecordModal>({
    defaultValues: {
      attachments: []
    }
  });

  useEffect(() => {
    const fetchFormInfo = async () => {
      if (mongoID === undefined) return;
      try {
        const response = await getCommunicationDetail(mongoID);
        setValue(
          "forward_to",
          response.email_send.map((email) => ({ value: email, label: email }))
        );
        setValue(
          "copy_to",
          response.email_copy.map((email) => ({ value: email, label: email }))
        );
        setValue("subject", response.subject);
        setValue("body", response.body);
        // TODO: uncomment when attachments are available
        // setValue("attachments", response.attachments as unknown as File[]);
      } catch (error) {
        console.error("Error getting communication detail", error);
      }
    };
    fetchFormInfo();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const attachments = watch("attachments");

  return (
    <Modal
      className="modalCommunicationDetail"
      width="690px"
      footer={null}
      open={isOpen}
      onCancel={onClose}
    >
      <h2 className="modalCommunicationDetail__title">{t("title")}</h2>

      <Flex vertical gap="1.5rem">
        <Controller
          name="forward_to"
          control={control}
          render={({ field }) => (
            <GeneralSearchSelect
              field={field}
              title={t("to")}
              placeholder=""
              suffixIcon={null}
              disabled
              showLabelAndValue
            />
          )}
        />

        <Controller
          name="copy_to"
          control={control}
          rules={{ required: false }}
          render={({ field }) => (
            <GeneralSearchSelect
              field={field}
              title={t("cc")}
              placeholder=""
              suffixIcon={null}
              disabled
              showLabelAndValue
            />
          )}
        />

        <InputForm
          validationRules={{ required: true }}
          titleInput={t("subject")}
          control={control}
          nameInput="subject"
          readOnly
        />

        <Controller
          name="body"
          control={control}
          rules={{ required: true }}
          disabled
          render={({ field }) => (
            <div className="modalCommunicationDetail__textArea">
              <textarea {...field} placeholder="" />
            </div>
          )}
        />

        <div>
          <div className="modalCommunicationDetail__files">
            {attachments.map((file) => (
              <div className="modalCommunicationDetail__files__file" key={file.name}>
                <FileArrowUp size={"25px"} />
                <p className="nameFile">{file.name}</p>
                <p className="sizeFile">{file.size}</p>
              </div>
            ))}
          </div>
        </div>
      </Flex>
    </Modal>
  );
};

export default ModalCommunicationDetail;
