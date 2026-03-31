"use client";
import { useEffect, useRef, useState } from "react";
import { Modal } from "antd";
import { Pencil, Users, Paperclip, Plus, Tag } from "lucide-react";
import { Spin } from "antd";

import { getAllAtachments } from "@/services/communications/communications";
import { getContactOptions } from "@/services/contacts/contacts";
import { Input } from "@/modules/chat/ui/input";
import { Textarea } from "@/modules/chat/ui/textarea";
import { Label } from "@/modules/chat/ui/label";
import { Button } from "@/modules/chat/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/modules/chat/ui/popover";

interface ModalCreateEmailTemplateProps {
  isOpen: boolean;
  onClose: () => void;
}

const emailTags = ["Nombre Cliente", "Cartera", "Firma", "Fecha", "Empresa"];

export default function ModalCreateEmailTemplate({
  isOpen,
  onClose
}: ModalCreateEmailTemplateProps) {
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [activeField, setActiveField] = useState<"subject" | "body">("body");
  const [templateRoles, setTemplateRoles] = useState<Set<string>>(new Set());
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<Set<number>>(new Set());
  const [attachmentOptions, setAttachmentOptions] = useState<{ value: number; label: string }[]>(
    []
  );
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);

  const subjectInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setSubject("");
      setBody("");
      setActiveField("body");
      setTemplateRoles(new Set());
      setSelectedAttachments(new Set());
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchAttachments = async () => {
      setLoadingAttachments(true);
      try {
        const response = await getAllAtachments();
        setAttachmentOptions(
          response.map((att: { id: number; name: string }) => ({
            value: att.id,
            label: att.name
          }))
        );
      } catch (error) {
        console.error("Error fetching attachments", error);
      }
      setLoadingAttachments(false);
    };
    fetchAttachments();

    const fetchRoles = async () => {
      setLoadingRoles(true);
      try {
        const contactPositionsData = await getContactOptions();
        const contactPositions = contactPositionsData.contact_position.map((position) => ({
          value: `0_${position.id}`,
          label: `Cliente - ${position.name}`
        }));
        setRoleOptions(contactPositions);
      } catch (error) {
        console.error("Error fetching contact options", error);
      }
      setLoadingRoles(false);
    };
    fetchRoles();
  }, []);

  const handleInsertTag = (tag: string) => {
    const insertion = `{{${tag}}}`;
    if (activeField === "subject") {
      const el = subjectInputRef.current;
      if (el) {
        const start = el.selectionStart ?? subject.length;
        const end = el.selectionEnd ?? subject.length;
        const newValue = subject.slice(0, start) + insertion + subject.slice(end);
        setSubject(newValue);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + insertion.length, start + insertion.length);
        });
      }
    } else {
      const el = bodyInputRef.current;
      if (el) {
        const start = el.selectionStart ?? body.length;
        const end = el.selectionEnd ?? body.length;
        const newValue = body.slice(0, start) + insertion + body.slice(end);
        setBody(newValue);
        requestAnimationFrame(() => {
          el.focus();
          el.setSelectionRange(start + insertion.length, start + insertion.length);
        });
      }
    }
    setTagPopoverOpen(false);
  };

  const handleSave = () => {
    console.log("Form data:", { name, subject, body });
    console.log("Selected roles:", Array.from(templateRoles));
    console.log("Selected attachments:", Array.from(selectedAttachments));
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
            <Input
              ref={subjectInputRef}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              onFocus={() => setActiveField("subject")}
              placeholder="Ej: Reporte de {{Cartera}} - {{Nombre Cliente}}"
              className="border-[#DDDDDD] h-10"
            />
          </div>
          <div className="flex flex-col flex-1">
            <Label className="text-sm text-[#141414] font-medium mb-1.5 block">
              Cuerpo del mensaje
            </Label>
            <Textarea
              ref={bodyInputRef}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onFocus={() => setActiveField("body")}
              placeholder={
                "Estimado {{Nombre Cliente}},\n\nLe informamos que su cartera actual es de {{Cartera}}...\n\nQuedamos atentos,\n{{Firma}}"
              }
              className="flex-1 border-[#DDDDDD] min-h-[200px] resize-none leading-relaxed"
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
              <div className="text-[13px] text-[#141414] leading-relaxed whitespace-pre-wrap">
                {renderedBody || (
                  <span className="text-gray-400 italic">El contenido aparecera aqui...</span>
                )}
              </div>
              {selectedAttachments.size > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#EEEEEE]">
                  <p className="text-[10px] text-gray-400 font-medium mb-1.5 uppercase tracking-wide">
                    Adjuntos
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {attachmentOptions
                      .filter((a) => selectedAttachments.has(a.value))
                      .map((att) => (
                        <span
                          key={att.value}
                          className="inline-flex items-center gap-1 text-[11px] bg-[#F5F5F5] text-gray-600 px-2 py-1 rounded-md border border-[#EEEEEE]"
                        >
                          <Paperclip className="w-2.5 h-2.5 text-gray-400" />
                          {att.label}
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
        <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-[#DDDDDD] bg-white text-[#141414] hover:bg-gray-50 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <Tag className="w-3.5 h-3.5" />
              Insertar tag
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-48 p-1">
            <div className="flex flex-col">
              {emailTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleInsertTag(tag)}
                  className="text-left text-sm px-3 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  {`{{${tag}}}`}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <span className="text-xs text-gray-400">
          Se insertara en {activeField === "subject" ? "el asunto" : "el cuerpo"}
        </span>
      </div>

      {/* Roles selector */}
      <div className="mt-5">
        <Label className="text-sm text-[#141414] font-medium mb-2 block">
          Roles destinatarios
        </Label>
        {loadingRoles ? (
          <Spin size="small" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {roleOptions.map((role) => {
              const isSelected = templateRoles.has(role.value);
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() =>
                    setTemplateRoles((prev) => {
                      const next = new Set(prev);
                      if (next.has(role.value)) next.delete(role.value);
                      else next.add(role.value);
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
                  {role.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Attachments selector */}
      <div className="mt-5">
        <Label className="text-sm text-[#141414] font-medium mb-2 block">
          Adjuntos del template
        </Label>
        {loadingAttachments ? (
          <Spin size="small" />
        ) : (
          <div className="flex flex-wrap gap-2">
            {attachmentOptions.map((att) => {
              const isSelected = selectedAttachments.has(att.value);
              return (
                <button
                  key={att.value}
                  type="button"
                  onClick={() =>
                    setSelectedAttachments((prev) => {
                      const next = new Set(prev);
                      if (next.has(att.value)) next.delete(att.value);
                      else next.add(att.value);
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
                  {att.label}
                </button>
              );
            })}
          </div>
        )}
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

