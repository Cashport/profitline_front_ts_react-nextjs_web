import React, { useEffect, useRef, useState } from "react";
import { Modal, Button, Upload, Dropdown, Flex } from "antd";
import { DownOutlined } from "@ant-design/icons";
import type { MenuProps } from "antd";
import styles from "./MakeCallModal.module.scss";
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
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import { LineVertical, TextB } from "@phosphor-icons/react";
import { EmailData } from "@/types/sendEmail";
import { Header } from "../SendEmailModal/components/Header";
import AttachmentList from "../SendEmailModal/components/AttachmentList";
import { CustomButton } from "../SendEmailModal/components/CustomButton";
import { PhonecallData, UserPhoneOption } from "@/types/makeCall";
import { phoneSuggestions } from "./mocked-data";
import CustomSelect from "./components/CustomSelect";

interface MakeCallModalProps {
  visible: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSend: (emailData: EmailData) => void;
}

const MakeCallModal: React.FC<MakeCallModalProps> = ({ visible, onClose }) => {
  const [modalSize, setModalSize] = useState({ width: 660, height: 520 });
  const [mask, setMask] = useState(false);
  type ViewMode = "default" | "minimized" | "maximized";
  const [viewMode, setViewMode] = useState<ViewMode>("default");
  const [phoneCallData, setPhoneCallData] = useState<PhonecallData>({
    call_to: "",
    body: "",
    state: undefined,
    attachments: []
  });

  const [userToCall, setUserToCall] = useState<UserPhoneOption | null>(null);
  // #UNUSED REACT STATE
  const [_callInProgress, setCallInProgress] = useState(false);
  const [textAlignment, setTextAlignment] = useState<"left" | "center" | "right">("left");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());

  console.log("EditorState", editorState);
  const getHTML = (): string => {
    const contentState: ContentState = editorState.getCurrentContent();
    return stateToHTML(contentState);
  };

  const onUpload = (file: File) => {
    setPhoneCallData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, file]
    }));
    return false; // Evita la carga automática
  };

  useEffect(() => {
    if (visible) {
      setPhoneCallData({
        call_to: "",
        body: "",
        state: "",
        attachments: []
      });
      setEditorState(EditorState.createEmpty());
    }
  }, [visible]);

  const handleAlignChange = (align: "left" | "center" | "right") => {
    setTextAlignment(align);
  };
  const handleRemoveFile = (file: File) => {
    setPhoneCallData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((attachment) => attachment !== file)
    }));
  };

  const callStateOptions = [
    {
      value: "NO_ANSWER",
      label: "No contestó"
    },
    {
      value: "WRONG_PHONE",
      label: "Teléfono equivocado"
    },
    {
      value: "CALL_BACK_LATER",
      label: "Llamar luego"
    },
    {
      value: "SUCCESS",
      label: "Llamada exitosa"
    }
  ];
  const handleCallStateChange = (state: string) => {
    setPhoneCallData((prev) => ({
      ...prev,
      state
    }));
  };
  const callStateItems: MenuProps["items"] = callStateOptions.map(({ value, label }) => ({
    key: value,
    label: (
      <span
        onClick={() => handleCallStateChange(value)}
        style={{ fontWeight: phoneCallData.state === value ? "bold" : "normal" }}
      >
        {label}
      </span>
    )
  }));
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

  const makeCall = async () => {
    setCallInProgress(true);
    console.log("LLAMANDO");
    //await makeCallService(phoneCallData);
    setCallInProgress(false);
  };
  const phoneCallStateLabel = (state: string) => {
    switch (state) {
      case "NO_ANSWER":
        return "No contestó";
      case "WRONG_PHONE":
        return "Teléfono equivocado";
      case "CALL_BACK_LATER":
        return "Llamar luego";
      case "SUCCESS":
        return "Llamada exitosa";
      default:
        return "Estado de la llamada";
    }
  };

  const submit = async () => {
    setLoadingSubmit(true);
    applyAlignment(getHTML(), textAlignment);
    // await sendEmail({ forward_to: userToCall, body: alignedHTML, attachments: phoneCallData.attachments });
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
  console.log("phoneCallData", phoneCallData);
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
          title="Llamada"
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
              title="Llamada"
            />
            {node}
          </div>
        )}
        footer={null}
        closeIcon={false}
        mask={mask}
      >
        <Flex vertical gap={20} className={styles.container}>
          <CustomSelect
            label="Llamar a"
            value={userToCall}
            onChange={setUserToCall}
            options={phoneSuggestions}
            onClickIcon={makeCall}
          />
          <div className={styles.textArea} style={{ minHeight: 110 }}>
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              plugins={plugins}
              ref={(editor: any) => (editorRef.current = editor)}
              textAlignment={textAlignment}
              placeholder="Resumen de la llamada"
            />
          </div>
          <AttachmentList
            attachments={phoneCallData.attachments}
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
                  menu={{ items: callStateItems }}
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
                    {phoneCallData.state
                      ? phoneCallStateLabel(phoneCallData.state)
                      : "Estado de la llamada"}{" "}
                    <DownOutlined />
                  </Button>
                </Dropdown>
              </Flex>
            )}
          </Toolbar>
          <hr style={{ borderTop: "1px solid #DDDDDD" }} />
          <Flex>
            <PrincipalButton
              onClick={submit}
              disabled={!userToCall || !phoneCallData.body || !hasContent()}
              customStyles={{ width: 200, height: 48 }}
              loading={loadingSubmit}
            >
              Enviar
            </PrincipalButton>
          </Flex>
        </Flex>
      </Modal>
    );
};

export default MakeCallModal;
