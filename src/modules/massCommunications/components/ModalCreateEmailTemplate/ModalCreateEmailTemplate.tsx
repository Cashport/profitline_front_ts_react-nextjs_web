"use client";
import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { message, Modal, Spin } from "antd";
import { Pencil, Users, Paperclip } from "lucide-react";

import {
  createCommunicationTemplate,
  getAllAtachments
} from "@/services/communications/communications";
import { useAppStore } from "@/lib/store/store";
import { getContactOptions } from "@/services/contacts/contacts";
import { Input } from "@/modules/chat/ui/input";
import { Label } from "@/modules/chat/ui/label";
import { Button } from "@/modules/chat/ui/button";
import { CustomTextArea } from "@/components/atoms/CustomTextArea/CustomTextArea";
import SelectOuterTags from "@/components/ui/select-outer-tags";
import { OptionType } from "@/components/ui/select-outer-tags/select-outer-tags";

interface ISelectTag {
  value: number;
  label: string;
}

interface IEmailTemplateForm {
  name: string;
  subject: string;
  body: string;
  templateRoles: Set<string>;
  selectedAttachments: Set<number>;
}

interface ModalCreateEmailTemplateProps {
  isOpen: boolean;
  onClose: () => void;
  templateTags: ISelectTag[];
  onSuccess?: () => void;
}

export default function ModalCreateEmailTemplate({
  isOpen,
  onClose,
  templateTags,
  onSuccess
}: ModalCreateEmailTemplateProps) {
  const { ID: projectId } = useAppStore((state) => state.selectedProject);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    register,
    formState: { isSubmitting, isValid }
  } = useForm<IEmailTemplateForm>({
    mode: "onChange",
    defaultValues: {
      name: "",
      subject: "",
      body: "",
      templateRoles: new Set(),
      selectedAttachments: new Set()
    }
  });

  register("templateRoles", {
    validate: (value) => value.size > 0 || "Debe seleccionar al menos un rol"
  });

  const [activeField, setActiveField] = useState<"subject" | "body">("body");
  const [roleOptions, setRoleOptions] = useState<{ value: string; label: string }[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [attachmentOptions, setAttachmentOptions] = useState<{ value: number; label: string }[]>(
    []
  );
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const subjectValue = watch("subject");
  const bodyValue = watch("body");
  const templateRoles = watch("templateRoles");
  const selectedAttachments = watch("selectedAttachments");

  useEffect(() => {
    if (!isOpen) {
      reset();
      setActiveField("body");
    }
  }, [isOpen, reset]);

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

  const highlightWords = templateTags.map((tag) => `{{${tag.label}}}`);

  const handleAddTagToField = (value: OptionType[]) => {
    if (value.length === 0) return;
    const lastAddedTag = value[value.length - 1];
    const insertion = `{{${lastAddedTag?.label}}}`;

    if (activeField === "subject") {
      setValue("subject", `${subjectValue}${insertion}`);
    } else {
      setValue("body", `${bodyValue}${insertion}`);
    }
  };

  const onSubmit = async (data: IEmailTemplateForm) => {
    try {
      await createCommunicationTemplate({
        project_id: projectId,
        name: data.name,
        description: data.name,
        subject: data.subject,
        message: data.body,
        via: "email",
        contact_roles: Array.from(data.templateRoles).map((role) => Number(role.split("_")[1])),
        other_mails: [],
        comunication_type: 3,
        action_type_ids: [17]
      });
      message.success("Template creado exitosamente");
      onSuccess?.();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Ocurrió un error al crear el template";
      message.error(errorMessage);
    }
  };

  const renderedSubject = subjectValue.replace(
    /\{\{(.+?)\}\}/g,
    (_: string, tag: string) => `[${tag}]`
  );
  const renderedBody = bodyValue.replace(/\{\{(.+?)\}\}/g, (_: string, tag: string) => `[${tag}]`);

  return (
    <Modal
      open={isOpen}
      onCancel={onClose}
      footer={null}
      width={900}
      centered
      destroyOnClose
      styles={{
        body: {
          maxHeight: "calc(90vh - 110px)",
          overflowY: "auto",
          scrollbarWidth: "thin"
        }
      }}
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
        <Controller
          name="name"
          control={control}
          rules={{ required: "El nombre es obligatorio" }}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="Ej: Recordatorio mensual de cartera"
              className="border-[#DDDDDD] h-10 placeholder:text-[#DDDDDD] font-light"
            />
          )}
        />
      </div>

      {/* Two columns: Editor + Preview */}
      <div className="grid grid-cols-2 gap-6 items-stretch">
        {/* Left: Editor */}
        <div className="flex flex-col gap-4">
          <div>
            <Label className="text-sm text-[#141414] font-medium mb-1.5 block">Asunto</Label>
            <Controller
              name="subject"
              control={control}
              rules={{ required: "El asunto es obligatorio" }}
              render={({ field }) => (
                <CustomTextArea
                  {...field}
                  onFocus={() => setActiveField("subject")}
                  placeholder="Ej: Reporte de {{Cartera}} - {{Nombre Cliente}}"
                  highlightWords={highlightWords}
                  customStyles={{
                    height: "40px",
                    background: "transparent"
                  }}
                  customStyleTextArea={{
                    height: "40px",
                    minHeight: "40px",
                    padding: "8px 12px",
                    scrollbarWidth: "none",
                    border: "1px solid #DDDDDD",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              )}
            />
          </div>
          <div className="flex flex-col flex-1">
            <Label className="text-sm text-[#141414] font-medium mb-1.5 block">
              Cuerpo del mensaje
            </Label>
            <Controller
              name="body"
              control={control}
              rules={{ required: "El cuerpo es obligatorio" }}
              render={({ field }) => (
                <CustomTextArea
                  {...field}
                  onFocus={() => setActiveField("body")}
                  placeholder="Estimado {{Nombre Cliente}},&#10;&#10;Le informamos que su cartera actual es de {{Cartera}}...&#10;&#10;Quedamos atentos,&#10;{{Firma}}"
                  highlightWords={highlightWords}
                  customStyles={{
                    height: "200px",
                    maxHeight: "200px",
                    overflow: "hidden",
                    background: "transparent"
                  }}
                  customStyleTextArea={{
                    height: "200px",
                    minHeight: "200px",
                    lineHeight: "1.625",
                    border: "1px solid #DDDDDD",
                    borderRadius: "8px",
                    fontSize: "14px"
                  }}
                />
              )}
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
        <SelectOuterTags
          placeholder="Seleccionar tag"
          options={templateTags}
          errors={undefined}
          field={{ value: [], onChange: () => {}, onBlur: () => {}, name: "tags", ref: () => {} }}
          hiddenTags
          addedOnchangeBehaviour={handleAddTagToField}
          disableValueRetention
          customStyleContainer={{ width: "270px", fontSize: "14px" }}
          customStyleSelect={{
            background: "transparent",
            border: "1px solid #DDDDDD",
            borderRadius: "8px",
            fontSize: "14px"
          }}
        />
        <span className="text-xs text-gray-400">
          Se insertara en {activeField === "subject" ? "el asunto" : "el cuerpo"}
        </span>
      </div>

      {/* Roles selector */}
      <div className="mt-5">
        <Label className="text-sm text-[#141414] font-medium mb-2 block">Roles destinatarios</Label>
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
                  onClick={() => {
                    const next = new Set(templateRoles);
                    if (next.has(role.value)) next.delete(role.value);
                    else next.add(role.value);
                    setValue("templateRoles", next, { shouldValidate: true });
                  }}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#CBE71E]/10 border-[#CBE71E] text-[#141414] font-medium shadow-sm"
                      : "bg-white border-[#DDDDDD] text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <Users className={`w-3 h-3 ${isSelected ? "text-[#141414]" : "text-gray-400"}`} />
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
                  onClick={() => {
                    const next = new Set(selectedAttachments);
                    if (next.has(att.value)) next.delete(att.value);
                    else next.add(att.value);
                    setValue("selectedAttachments", next);
                  }}
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
      <div className="sticky bottom-0 bg-white pt-4 pb-1 flex items-center justify-end gap-3 mt-1">
        <Button variant="outline" onClick={onClose} className="border-[#DDDDDD] h-9">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={!isValid || isSubmitting}
          className="bg-[#CBE71E] text-[#141414] hover:bg-[#b8d119] font-semibold h-9"
        >
          Guardar template
        </Button>
      </div>
    </Modal>
  );
}
