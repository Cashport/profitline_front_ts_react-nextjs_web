import { useFieldArray } from "react-hook-form";
import { Flex } from "antd";
import { UploadDocumentButton } from "@/components/atoms/UploadDocumentButton/UploadDocumentButton";
import UploadDocumentChild from "@/components/atoms/UploadDocumentChild/UploadDocumentChild";
import UploadFileButton from "@/components/molecules/modals/ModalBillingAction/UploadFileButton/UploadFileButton";
import styles from "./DocumentFields.module.scss";
export function DocumentFields({
  control,
  register,
  driverIndex,
  handleOnDeleteDocument,
  handleOnChangeDocument,
  currentDriver
}: Readonly<{
  control: any;
  register: any;
  driverIndex: number;
  handleOnDeleteDocument: (driverIndex: number, documentIndex: number) => void;
  handleOnChangeDocument: (fileToSave: any, driverIndex: number, documentIndex: number) => void;
  currentDriver: any;
}>) {
  const { fields: documentFields } = useFieldArray<any>({
    control,
    name: `driversForm.${driverIndex}.documents`
  });
  console.log("documentFields", documentFields);
  console.log("currentDriver IN DOCS FIELDS", currentDriver);

  return (
    <div className={styles.uploadContainer}>
      {documentFields.map((document: any, documentIndex) => {
        if (document.url) {
          return (
            <UploadDocumentButton
              key={`driver-${driverIndex}-doc-${documentIndex}`}
              title={document.description}
              isMandatory={true}
              setFiles={() => {}}
              column
              disabled
            >
              <UploadDocumentChild
                linkFile={document.url}
                nameFile={document.url.split("-").pop() ?? ""}
                showTrash={false}
                onDelete={() => {}}
              />
            </UploadDocumentButton>
          );
        }
        return (
          <UploadFileButton
            column={true}
            key={`driver-${driverIndex}-doc-MT-${documentIndex}`}
            title={document.description}
            handleOnDelete={() => handleOnDeleteDocument(driverIndex, documentIndex)}
            handleOnChange={(file) => handleOnChangeDocument(file, driverIndex, documentIndex)}
            fileName={currentDriver?.documents?.[documentIndex]?.file?.name ?? undefined}
            fileSize={currentDriver?.documents?.[documentIndex]?.file?.size ?? undefined}
            isMandatory={true}
          />
        );
      })}
    </div>
  );
}
