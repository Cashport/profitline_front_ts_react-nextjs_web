import { useState } from "react";
import { useTranslations } from "use-intl";
import { Button, Checkbox, message, Upload, UploadProps } from "antd";
import { Controller, useForm } from "react-hook-form";

import { InputForm } from "../InputForm/InputForm";
import "./inputcreatedocument.scss";
import { FileArrowUp } from "phosphor-react";
import { ICreateDocumentForm } from "@/types/clientTypes/clientTypes";
import { useDocumentByClient } from "@/hooks/useDocumentByClient";

export const InputCreateDocument = ({ clientTypeId }: { clientTypeId: number }) => {
  const t = useTranslations("components.inputCreate");
  const tCommon = useTranslations("common");
  const [isLoading, setIsLoading] = useState(false);
  // null = sin plantilla seleccionada (se muestra "Cargar plantilla").
  const [uploadLabel, setUploadLabel] = useState<string | null>(null);

  const { addDocument } = useDocumentByClient(clientTypeId);
  const [messageApi, contextHolder] = message.useMessage();
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm<ICreateDocumentForm>({});

  const onSubmit = async (data: ICreateDocumentForm) => {
    setIsLoading(true);

    const formData = new FormData();
    formData.append("client_type", clientTypeId.toString());
    formData.append("required", data.required ? "1" : "0");
    formData.append("document_name", data.document_name);
    if (data.template) {
      formData.append("template", data.template);
    }

    await addDocument(formData, messageApi);

    reset();
    setUploadLabel(null);
    setIsLoading(false);
  };

  const handleUploadChange = (info: any) => {
    const file = info.file.originFileObj || info.file;
    setValue("template", file);
    setUploadLabel(file.name);
  };

  const props: UploadProps = {
    name: "title",
    accept: ".pdf",
    showUploadList: false,
    customRequest: () => {
      return;
    }
  };

  return (
    <>
      <form className="inputCreateDocument" onSubmit={handleSubmit(onSubmit)}>
        {contextHolder}
        <InputForm
          titleInput=""
          control={control}
          nameInput="document_name"
          error={errors.document_name}
          placeholder={t("documentPlaceholder")}
        />
        <Controller
          name="required"
          control={control}
          defaultValue={false}
          render={({ field }) => (
            <Checkbox className="inputCreateDocument__check" checked={field.value} {...field}>
              {t("required")}
            </Checkbox>
          )}
        />

        <Controller
          name="template"
          control={control}
          render={({ field }) => (
            <Upload
              className="uploadDocumentButton"
              {...props}
              onChange={(info) => {
                field.onChange(info.file.originFileObj || info.file);
                handleUploadChange(info);
              }}
            >
              <Button htmlType="button" loading={isLoading} className="">
                <FileArrowUp size={16} />
                {uploadLabel ?? t("uploadTemplate")}
              </Button>{" "}
            </Upload>
          )}
        />

        <Button htmlType="submit" loading={isLoading} className="createButton">
          {tCommon("actions.create")}
        </Button>
      </form>
    </>
  );
};
