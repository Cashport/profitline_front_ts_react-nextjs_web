"use client";
import React, { useEffect, useRef, useState } from "react";
import { Modal, Select, Upload, Flex, message } from "antd";
import { Paperclip, TextItalic, TextUnderline } from "phosphor-react";
import { TextB, LineVertical } from "@phosphor-icons/react";

import Editor from "draft-js-plugins-editor";
import { EditorState } from "draft-js";
import createToolbarPlugin from "draft-js-static-toolbar-plugin";
import "draft-js/dist/Draft.css";
import "draft-js-static-toolbar-plugin/lib/plugin.css";

import { useAppStore } from "@/lib/store/store";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import AttachmentList from "@/components/molecules/modals/SendEmailModal/components/AttachmentList";
import { Header } from "@/components/molecules/modals/SendEmailModal/components/Header";
import { CustomButton } from "@/components/molecules/modals/SendEmailModal/components/CustomButton";
import {
  addCommentHistoricAction,
  getManagementTypes,
  getManagementStatus,
  getContactsByClient
} from "@/services/accountingAdjustment/accountingAdjustment";

import "./modalEnterProcess.scss";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  clientId?: string;
}

type ViewMode = "default" | "minimized" | "maximized";

const ModalEnterProcess: React.FC<Props> = ({ isOpen, onClose, clientId }) => {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  /* -------------------- Header State -------------------- */
  const [modalSize, setModalSize] = useState({ width: 660, height: 520 });
  const [mask, setMask] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("default");

  /* -------------------- Form State -------------------- */
  const [managementType, setManagementType] = useState<number | null>(null);
  const [managementStatus, setManagementStatus] = useState<number | null>(null);
  const [contactId, setContactId] = useState<number | null>(null);

  const [managementTypes, setManagementTypes] = useState<any[]>([]);
  const [managementStatuses, setManagementStatuses] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);

  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const editorRef = useRef<any>(null);

  /* -------------------- Load data on open -------------------- */
  useEffect(() => {
    if (!isOpen || !clientId) return;

    setViewMode("default");
    setModalSize({ width: 660, height: 520 });
    setMask(false);

    setManagementType(null);
    setManagementStatus(null);
    setContactId(null);
    setEditorState(EditorState.createEmpty());
    setAttachments([]);

    const loadData = async () => {
      try {
        const [typesRes, statusRes, contactsRes] = await Promise.all([
          getManagementTypes(),
          getManagementStatus(),
          getContactsByClient(clientId, projectId)
        ]);

        setManagementTypes(typesRes.data || []);
        setManagementStatuses(statusRes.data || []);
        // concatenamos nombre, apellido, teléfono y correo
        const mappedContacts = (contactsRes.data || []).map(
          (c: {
            CONTACT_NAME: any;
            CONTACT_LASTNAME: any;
            CONTACT_PHONE: any;
            CONTACT_EMAIL: any;
          }) => ({
            ...c,
            label: `${c.CONTACT_NAME} ${c.CONTACT_LASTNAME} - ${c.CONTACT_PHONE} - ${c.CONTACT_EMAIL}`
          })
        );
        setContacts(mappedContacts);
      } catch (error) {
        message.error("Error cargando datos de gestión");
      }
    };

    loadData();
  }, [isOpen, clientId, projectId]);

  /* -------------------- Helpers -------------------- */
  const hasContent = () => editorState.getCurrentContent().getPlainText().trim().length > 0;

  const onUpload = (file: File) => {
    setAttachments((prev) => [...prev, file]);
    return false;
  };

  const handleRemoveFile = (file: File) => {
    setAttachments((prev) => prev.filter((f) => f !== file));
  };

  /* -------------------- Submit -------------------- */
  const handleSubmit = async () => {
    if (!clientId || !managementType || !managementStatus || !hasContent()) return;

    setLoading(true);
    try {
      await addCommentHistoricAction(
        clientId,
        projectId,
        editorState.getCurrentContent().getPlainText(),
        managementType,
        managementStatus,
        contactId ?? undefined,
        attachments[0] ?? undefined
      );

      message.success("Gestión registrada correctamente");
      onClose();
    } catch (error) {
      message.error("Error al registrar la gestión");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------- Toolbar -------------------- */
  const [{ plugins, Toolbar }] = useState(() => {
    const toolbarPlugin = createToolbarPlugin();
    return {
      plugins: [toolbarPlugin],
      Toolbar: toolbarPlugin.Toolbar
    };
  });

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      title={false}
      footer={null}
      closable={false}
      centered
      maskClosable={false}
      mask={mask}
      className="modalEnterProcess"
    >
      <Flex vertical gap={20}>
        <Header
          title="Ingresar gestión"
          onClose={onClose}
          showMinimize={false}
          showMaximize={false}
          showRestore={false}
          setViewMode={setViewMode}
          setModalSize={setModalSize}
          setMask={setMask}
        />

        <div className="modalEnterProcess__modalBody">
          {/* ----------- Selects ----------- */}
          <Flex gap={12}>
            <Select
              placeholder="Tipo de gestión"
              value={managementType}
              onChange={setManagementType}
              style={{ width: "100%" }}
              options={managementTypes.map((t) => ({
                value: t.id, // <- usar id en minúscula
                label: t.name // <- usar name en minúscula
              }))}
            />

            <Select
              placeholder="Estado de gestión"
              value={managementStatus}
              onChange={setManagementStatus}
              style={{ width: "100%" }}
              options={managementStatuses.map((s) => ({
                value: s.id, // <- usar id en minúscula
                label: s.name // <- usar name en minúscula
              }))}
            />

            <Select
              placeholder="Contacto (opcional)"
              value={contactId}
              onChange={setContactId}
              allowClear
              style={{ width: "100%" }}
              options={contacts.map((c) => {
                const mainText = `${c.CONTACT_NAME} ${c.CONTACT_LASTNAME} - ${c.CONTACT_PHONE}`;
                return {
                  value: c.ID,
                  label: mainText,
                  email: c.CONTACT_EMAIL
                };
              })}
              optionRender={(option) => (
                <div className="contact-dropdown">
                  <div className="contact-main">{option.label}</div>
                  <div className="contact-sub">{option.data.email}</div>
                </div>
              )}
            />
          </Flex>

          {/* ----------- Editor ----------- */}
          <div style={{ minHeight: 120 }} className="modalEnterProcess__textArea">
            <Editor
              editorState={editorState}
              onChange={setEditorState}
              plugins={plugins}
              ref={editorRef}
              placeholder="Escribe la gestión..."
            />
          </div>

          {/* ----------- Attachments ----------- */}
          <AttachmentList
            attachments={attachments}
            handleRemoveFile={handleRemoveFile}
            shortenFileName={(n) => n}
          />

          {/* ----------- Toolbar ----------- */}
          <Toolbar>
            {() => (
              <Flex gap={16} align="center">
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

                <LineVertical size={22} color="#DDD" />

                <Upload beforeUpload={onUpload} showUploadList={false}>
                  <Paperclip size={20} />
                </Upload>
              </Flex>
            )}
          </Toolbar>

          <hr />

          {/* ----------- Footer ----------- */}
          <FooterButtons
            handleOk={handleSubmit}
            onClose={onClose}
            titleConfirm="Ingresar gestión"
            isConfirmLoading={loading}
            isConfirmDisabled={!managementType || !managementStatus || !hasContent()}
          />
        </div>
      </Flex>
    </Modal>
  );
};

export default ModalEnterProcess;
