"use client";
import { useEffect, useState } from "react";
import { Modal } from "antd";
import { Pencil, Users, Paperclip } from "lucide-react";

import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";
import { Button } from "@/modules/chat/ui/button";
import { CustomTextArea } from "@/components/atoms/CustomTextArea/CustomTextArea";
import { getTemplateTags } from "@/services/communications/communications";
import SelectOuterTags from "@/components/ui/select-outer-tags";
import { OptionType } from "@/components/ui/select-outer-tags/select-outer-tags";

interface ISelectTag {
  value: number;
  label: string;
}

interface ModalCreateEmailTemplateProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalCreateEmailTemplate({
  isOpen,
  onClose
}: ModalCreateEmailTemplateProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [activeField, setActiveField] = useState<"subject" | "body">("body");
  const [templateRoles, setTemplateRoles] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<Set<string>>(new Set());
  const [templateTags, setTemplateTags] = useState<ISelectTag[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setSubject("");
      setBody("");
      setActiveField("body");
      setTemplateRoles(new Set());
      setAttachments(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchTemplateTags = async () => {
      const tags = await getTemplateTags();
      setTemplateTags(tags.map((tag) => ({ value: tag.id, label: tag.name })));
    };
    fetchTemplateTags();
  }, []);

  const highlightWords = templateTags.map((tag) => `{{${tag.label}}}`);

  const handleAddTagToField = (value: OptionType[]) => {
    if (value.length === 0) return;
    const lastAddedTag = value[value.length - 1];
    const insertion = `{{${lastAddedTag?.label}}}`;

    if (activeField === "subject") {
      setSubject((prev) => `${prev}${insertion}`);
    } else {
      setBody((prev) => `${prev}${insertion}`);
    }
  };

  const handleSave = () => {
    console.log("Form data:", { name, subject, body });
    console.log("Selected roles:", Array.from(templateRoles));
    console.log("Selected attachments:", Array.from(attachments));
  };

  const renderedSubject = subject.replace(/\{\{(.+?)\}\}/g, (_, tag) => `[${tag}]`);
  const renderedBody = body.replace(/\{\{(.+?)\}\}/g, (_, tag) => `[${tag}]`);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
      title={
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#CBE71E]/20 flex items-center justify-center">
            <Pencil className="w-4 h-4 text-[#141414]" />
          </div>
          Crear template de email
        </div>
      }
    >
      <p className="text-sm text-gray-500 mb-5">
        Escribe el contenido del correo usando tags dinamicos. La vista previa se actualiza en
        tiempo real.
      </p>

      {/* Name */}
      <div className="mb-4">
        <Label className="text-sm text-[#141414] font-medium mb-1.5 block">
          Nombre del template
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Recordatorio mensual de cartera"
          className="border-[#DDDDDD] h-10"
        />
      </div>

      {/* Two columns: Editor + Preview */}
      <div className="grid grid-cols-2 gap-6 items-stretch">
        {/* Left: Editor */}
        <div className="flex flex-col gap-4">
          <div>
            <Label className="text-sm text-[#141414] font-medium mb-1.5 block">Asunto</Label>
            <CustomTextArea
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onFocus={() => setActiveField("subject")}
              placeholder="Ej: Reporte de {{Cartera}} - {{Nombre Cliente}}"
              highlightWords={highlightWords}
              customStyles={{
                height: "40px"
              }}
              customStyleTextArea={{
                height: "40px",
                minHeight: "40px",
                padding: "8px 12px",
                scrollbarWidth: "none",
                border: "1px solid #DDDDDD",
                borderRadius: "8px"
              }}
            />
          </div>
          <div className="flex flex-col flex-1">
            <Label className="text-sm text-[#141414] font-medium mb-1.5 block">
              Cuerpo del mensaje
            </Label>
            <CustomTextArea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => setActiveField("body")}
              placeholder="Estimado {{Nombre Cliente}},&#10;&#10;Le informamos que su cartera actual es de {{Cartera}}...&#10;&#10;Quedamos atentos,&#10;{{Firma}}"
              highlightWords={highlightWords}
              customStyles={{
                height: "200px",
                maxHeight: "200px",
                overflow: "hidden"
              }}
              customStyleTextArea={{
                height: "200px",
                minHeight: "200px",
                lineHeight: "1.625",
                border: "1px solid #DDDDDD",
                borderRadius: "8px"
              }}
            />
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex flex-col h-full">
          <Label className="text-sm text-[#141414] font-medium mb-1.5 block">Vista previa</Label>
          <div className="rounded-lg border border-[#DDDDDD] overflow-hidden flex flex-col flex-1 bg-[#FAFAFA]">
            <div className="bg-[#141414] px-4 py-2.5">
              <p className="text-[11px] text-gray-400 font-medium tracking-wide uppercase">
                Vista previa del correo
              </p>
            </div>
            <div className="p-4 flex flex-col bg-white m-2 rounded-md border border-[#EEEEEE]">
              <div className="border-b border-[#EEEEEE] pb-2.5 mb-3">
                <p className="text-[10px] text-gray-400 mb-0.5">Para: destinatario@ejemplo.com</p>
                <p className="text-sm font-semibold text-[#141414] leading-snug">
                  {renderedSubject || "Sin asunto"}
                </p>
              </div>
              <div className="text-[13px] text-[#141414] leading-relaxed whitespace-pre-wrap max-h-[200px] overflow-auto">
                {renderedBody || (
                  <span className="text-gray-400 italic">El contenido aparecera aqui...</span>
                )}
              </div>
              {attachments.size > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#EEEEEE]">
                  <p className="text-[10px] text-gray-400 font-medium mb-1.5 uppercase tracking-wide">
                    Adjuntos
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {predefinedAttachments
                      .filter((a) => attachments.has(a.name))
                      .map((att) => (
                        <span
                          key={att.name}
                          className="inline-flex items-center gap-1 text-[11px] bg-[#F5F5F5] text-gray-600 px-2 py-1 rounded-md border border-[#EEEEEE]"
                        >
                          <Paperclip className="w-2.5 h-2.5 text-gray-400" />
                          {att.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tag inserter */}
      <div className="flex items-center gap-3 mt-5">
        <SelectOuterTags
          title="Tags"
          placeholder="Seleccionar tag"
          options={templateTags}
          errors={undefined}
          field={{ value: [], onChange: () => {}, onBlur: () => {}, name: "tags", ref: () => {} }}
          hiddenTags
          addedOnchangeBehaviour={handleAddTagToField}
          disableValueRetention
          customStyleContainer={{ width: "200px" }}
        />
        <span className="text-xs text-gray-400">
          Se insertara en {activeField === "subject" ? "el asunto" : "el cuerpo"}
        </span>
      </div>

      {/* Roles selector */}
      <div className="mt-5">
        <Label className="text-sm text-[#141414] font-medium mb-2 block">
          Roles destinatarios
        </Label>
        <div className="flex flex-wrap gap-2">
          {predefinedRoles.map((role) => {
            const isSelected = templateRoles.has(role);
            return (
              <button
                key={role}
                type="button"
                onClick={() =>
                  setTemplateRoles((prev) => {
                    const next = new Set(prev);
                    if (next.has(role)) next.delete(role);
                    else next.add(role);
                    return next;
                  })
                }
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#CBE71E]/10 border-[#CBE71E] text-[#141414] font-medium shadow-sm"
                    : "bg-white border-[#DDDDDD] text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Users
                  className={`w-3 h-3 ${isSelected ? "text-[#141414]" : "text-gray-400"}`}
                />
                {role}
              </button>
            );
          })}
        </div>
      </div>

      {/* Attachments selector */}
      <div className="mt-5">
        <Label className="text-sm text-[#141414] font-medium mb-2 block">
          Adjuntos del template
        </Label>
        <div className="flex flex-wrap gap-2">
          {predefinedAttachments.map((att) => {
            const isSelected = attachments.has(att.name);
            return (
              <button
                key={att.name}
                type="button"
                onClick={() =>
                  setAttachments((prev) => {
                    const next = new Set(prev);
                    if (next.has(att.name)) next.delete(att.name);
                    else next.add(att.name);
                    return next;
                  })
                }
                className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#CBE71E]/10 border-[#CBE71E] text-[#141414] font-medium shadow-sm"
                    : "bg-white border-[#DDDDDD] text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Paperclip
                  className={`w-3 h-3 ${isSelected ? "text-[#141414]" : "text-gray-400"}`}
                />
                {att.name}
                <span
                  className={`text-[9px] ${isSelected ? "text-[#141414]/50" : "text-gray-400"}`}
                >
                  {att.type}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 mt-6">
        <Button variant="outline" onClick={onClose} className="border-[#DDDDDD] h-9">
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          disabled={!subject.trim() || !body.trim()}
          className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] font-semibold h-9"
        >
          Guardar template
        </Button>
      </div>
    </Modal>
  );
}

const predefinedRoles = [
  "Gerentes",
  "Tesoreros",
  "Analistas de pagos",
  "Directores financieros",
  "Contadores",
  "Asistentes administrativos"
];

const predefinedAttachments = [
  { name: "Estado de cuenta", type: "PDF" },
  { name: "Link de pago", type: "Link" },
  { name: "Reporte de cartera", type: "Excel" },
  { name: "Comprobante de pago", type: "PDF" },
  { name: "Carta pre-juridica", type: "PDF" },
  { name: "Catalogo de productos", type: "PDF" }
];
