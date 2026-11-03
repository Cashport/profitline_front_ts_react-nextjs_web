import React, { useEffect, useRef, useState } from "react";
import { Modal, Input, Button, Upload, Dropdown, Flex } from "antd";
import { DownOutlined } from "@ant-design/icons";
import { useTranslations } from "use-intl";
import type { MenuProps } from "antd";
import styles from "./EmailModal.module.scss";
import {
  Paperclip,
  TextAlignCenter,
  TextAlignLeft,
  TextAlignRight,
  TextItalic,
  TextUnderline
} from "phosphor-react";
import Editor from "draft-js-plugins-editor";
import { EditorState, ContentState } from "draft-js";
import { stateToHTML } from "draft-js-export-html";
import "draft-js/dist/Draft.css";
import createToolbarPlugin from "draft-js-static-toolbar-plugin";
import "draft-js-static-toolbar-plugin/lib/plugin.css";
import { Header } from "./components/Header";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import MultiSelect from "./components/MultiSelect";
import { LineVertical, TextB } from "@phosphor-icons/react";
import { CustomButton } from "./components/CustomButton";
import { sendEmail } from "@/services/sendEmail/sendEmail";
import { emailSuggestions, selectTemplateItems, templates } from "./mocked-data";
import AttachmentList from "./components/AttachmentList";
import { EmailData, EmailOption, ITemplateName } from "@/types/sendEmail";

interface SendEmailModalProps {
  visible: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSend: (emailData: EmailData) => void;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({ visible, onClose }) => {
  const t = useTranslations("modals.sendEmail");
  const tCommon = useTranslations("common");
  const [modalSize, setModalSize] = useState({ width: 660, height: 520 });
  const [mask, setMask] = useState(false);
  type ViewMode = "default" | "minimized" | "maximized";
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [emailData, setEmailData] = useState<EmailData>({
    to: "",
    cc: "",
    subject: "",
    body: "",
    attachments: []
  });

  const [recipients, setRecipients] = useState<EmailOption[]>([]);
  const [ccRecipients, setCcRecipients] = useState<EmailOption[]>([]);
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("left");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

  console.log("EditorState", editorState);
  const getHTML = (): string => {
    const contentState: ContentState = editorState.getCurrentContent();
    return stateToHTML(contentState);
  };

  const onUpload = (file: File) => {
    setEmailData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, file]
    }));
    return false; // Evita la carga automática
  };

  useEffect(() => {
    if (visible) {
      setEmailData({
        to: "",
        cc: "",
        subject: "",
        body: "",
        attachments: []
      });
      setEditorState(EditorState.createEmpty());
    }
  }, [visible]);

  const handleAlignChange = (align: "left" | "center" | "right") => {
    setTextAlignment(align);
  };
  const handleRemoveFile = (file: File) => {
    setEmailData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((attachment) => attachment !== file)
    }));
  };

  const handleTemplateSelect = (templateName: ITemplateName) => {
    const selectedTemplate = templates[templateName];

    if (selectedTemplate) {
      setEmailData((prev) => ({
        ...prev,
        subject: selectedTemplate.subject,
        body: selectedTemplate.body,
        attachments: selectedTemplate.attachments
      }));
      const contentState = ContentState.createFromText(selectedTemplate.body);
      setEditorState(EditorState.createWithContent(contentState));
    }
  };

  useEffect(() => {
    if (visible) {
      setViewMode("default");
      setModalSize({ width: 660, height: 520 });
      setMask(false);
    }
  }, [visible]);

  const applyAlignment = (html: string, alignment: "left" | "center" | "right") => {
    return html.replace(/<p(.*?)>/g, `<p$1 style="text-align: ${alignment};">`);
  };

  const submit = async () => {
    setLoadingSubmit(true);
    const alignedHTML = applyAlignment(getHTML(), textAlignment);
    const createEmailData = {
      forward_to: recipients.map((recipient) => ({
        value: recipient.email,
        label: recipient.name
      })),
      copy_to: ccRecipients.map((recipient) => ({ value: recipient.email, label: recipient.name })),
      subject: emailData.subject,
      body: alignedHTML,
      attachments: emailData.attachments
    };
    await sendEmail(createEmailData);
    setLoadingSubmit(false);
  };

  // Función para verificar si el editor tiene contenido
  const hasContent = () => {
    const contentState = editorState.getCurrentContent();
    const plainText = contentState.getPlainText(); // Obtiene el texto en formato plano
    return plainText.trim().length > 0; // Si el texto no está vacío, retorna true
  };

  const shortenFileName = (fileName: string, maxLength: number = 20): string => {
    if (fileName.length <= maxLength) return fileName;

    // Obtener la extensión del archivo
    const fileParts = fileName.split(".");
    const extension = fileParts.length > 1 ? `.${fileParts.pop()}` : "";
    const nameWithoutExt = fileParts.join(".");

    // Recortar el nombre y agregar puntos suspensivos
    const shortName = nameWithoutExt.substring(0, maxLength - 3) + "...";

    return shortName + extension;
  };

  // Definir estilos personalizados
  const customTheme = {
    toolbarStyles: {
      toolbar: styles.customToolbar
    }
  };

  const [{ plugins, Toolbar }] = useState(() => {
    const toolbarPlugin = createToolbarPlugin({
      theme: customTheme
    });
    const { Toolbar } = toolbarPlugin;

    const plugins = [toolbarPlugin];
    return {
      plugins,
      Toolbar
    };
  });
  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <TextAlignLeft
          onClick={() => handleAlignChange("left")}
          size={20}
          weight={textAlignment === "left" ? "bold" : "thin"}
        />
      )
    },
    {
      key: "2",
      label: (
        <TextAlignCenter
          onClick={() => handleAlignChange("center")}
          size={20}
          weight={textAlignment === "center" ? "bold" : "thin"}
        />
      )
    },
    {
      key: "3",
      label: (
        <TextAlignRight
          onClick={() => handleAlignChange("right")}
          size={20}
          weight={textAlignment === "right" ? "bold" : "thin"}
        />
      )
    }
  ];

  const menuStyle: React.CSSProperties = {
    backgroundColor: "white",
    boxShadow: "none",
    border: "#141414 1px solid"
  };
  const editorRef = useRef(null);

  if (viewMode === "minimized" && visible) {
    return (
      <div
        style={{
          position: "absolute",
          bottom: 0,
          cursor: "default",
          zIndex: 1000, //
          pointerEvents: "all",
          borderTopRightRadius: 8,
          borderTopLeftRadius: 8,
          width: 660
        }}
      >
        <Header
          setViewMode={setViewMode}
          setModalSize={setModalSize}
          setMask={setMask}
          onClose={onClose}
          showMinimize={true}
          showMaximize={true}
          showRestore={true}
          title={t("title")}
        />
      </div>
    );
  } else
    return (
      <Modal
        open={visible}
        onCancel={onClose}
        title={false}
        maskClosable={false}
        closable={false}
        centered
        modalRender={(node) => (
          <div
            style={{
              height: modalSize.height,
              width: modalSize.width,
              cursor: "default",
              zIndex: 1000, //
              pointerEvents: "all",
              borderRadius: 8
            }}
          >
            <Header
              setViewMode={setViewMode}
              setModalSize={setModalSize}
              setMask={setMask}
              onClose={onClose}
              showMinimize={true}
              showMaximize={viewMode !== "maximized"}
              showRestore={viewMode !== "default"}
              title={t("title")}
            />
            {node}
          </div>
        )}
        footer={null}
        closeIcon={false}
        mask={mask}
      >
        <Flex vertical gap={20} className={styles.container}>
          <MultiSelect
            label={t("to")}
            value={recipients}
            onChange={setRecipients}
            options={emailSuggestions}
          />
          <MultiSelect
            label={t("cc")}
            value={ccRecipients}
            onChange={setCcRecipients}
            options={emailSuggestions}
          />
          <Input
            placeholder={t("subjectPlaceholder")}
            value={emailData.subject}
            onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
            className={styles.textArea}
            style={{
              backgroundColor: "#F7F7F7",
              color: "#9c9c9c",
              fontSize: "16px",
              fontWeight: 300,
              border: "none"
            }}
          />
          <div className={styles.textArea} style={{ minHeight: 110 }}>
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              plugins={plugins}
              ref={(editor: any) => (editorRef.current = editor)}
              textAlignment={textAlignment}
              placeholder={t("bodyPlaceholder")}
            />
          </div>
          <AttachmentList
            attachments={emailData.attachments}
            shortenFileName={shortenFileName}
            handleRemoveFile={handleRemoveFile}
          />
          <Toolbar>
            {() => (
              <Flex gap={20} align="center">
                <Flex gap={12} align="center">
                  <CustomButton
                    editorState={editorState}
                    onChange={setEditorState}
                    style="BOLD"
                    icon={TextB as any}
                  />
                  <CustomButton
                    editorState={editorState}
                    onChange={setEditorState}
                    style="ITALIC"
                    icon={TextItalic as any}
                  />
                  <CustomButton
                    editorState={editorState}
                    onChange={setEditorState}
                    style="UNDERLINE"
                    icon={TextUnderline as any}
                  />
                  <Dropdown
                    menu={{ items }}
                    className={styles.select}
                    dropdownRender={(menu) => (
                      <div>
                        {React.cloneElement(
                          menu as React.ReactElement<{
                            style: React.CSSProperties;
                          }>,
                          { style: menuStyle }
                        )}
                      </div>
                    )}
                  >
                    <TextAlignLeft size={20} onClick={(e) => e.preventDefault()} />
                  </Dropdown>
                  <LineVertical size={24} weight="light" color="#DDDDDD" />
                  <Upload
                    multiple
                    showUploadList={false}
                    beforeUpload={(file) => {
                      onUpload(file);
                      return false; // Evita la carga automática
                    }}
                    style={{ alignItems: "center" }}
                  >
                    <Paperclip size={20} />
                  </Upload>
                  <LineVertical size={24} weight="light" color="#DDDDDD" />
                </Flex>
                <Dropdown
                  menu={{
                    items: selectTemplateItems({
                      handleTemplateSelect,
                      label: (key) => t(`templates.${key}`)
                    })
                  }}
                  dropdownRender={(menu) => (
                    <div>
                      {React.cloneElement(
                        menu as React.ReactElement<{
                          style: React.CSSProperties;
                        }>,
                        { style: menuStyle }
                      )}
                    </div>
                  )}
                >
                  <Button style={{ border: "none", fontSize: 16, fontWeight: 600 }}>
                    {t("selectTemplate")} <DownOutlined />
                  </Button>
                </Dropdown>
              </Flex>
            )}
          </Toolbar>
          <hr style={{ borderTop: "1px solid #DDDDDD" }} />
          <Flex>
            <PrincipalButton
              onClick={submit}
              disabled={!recipients.length || !emailData.subject || !hasContent()}
              customStyles={{ width: 200, height: 48 }}
              loading={loadingSubmit}
            >
              {tCommon("actions.send")}
            </PrincipalButton>
          </Flex>
        </Flex>
      </Modal>
    );
};

export default SendEmailModal;
