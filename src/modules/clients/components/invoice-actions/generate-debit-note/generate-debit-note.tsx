import { FC, Fragment } from "react";
import { Checkbox } from "antd";
import { CaretLeft, FileArrowUp, Plus } from "phosphor-react";
import UiTabs from "@/components/ui/ui-tabs";
import styles from "./generate-debit-note.module.scss";
import { GenerateDebitNoteStep } from "@/modules/clients/constants/invoice-actions.constants";
import { useGenerateDebitNote } from "@/modules/clients/hooks/invoice-actions/generate-debit-note.hook";

interface GenerateDebitNoteProps {}

const GenerateDebitNote: FC<GenerateDebitNoteProps> = () => {
  const { currentStep, file, setFile, handleSelectNotesContinue, handleDefineAmountContinue } =
    useGenerateDebitNote();

  const defineAmountItems = [
    {
      id: "1234556",
      pending: "$28.000.000",
      newBalance: "$32.000.000"
    },
    {
      id: "1234556",
      pending: "$28.000.000",
      newBalance: "$32.000.000"
    },
    {
      id: "1234556",
      pending: "$28.000.000",
      newBalance: "$32.000.000"
    },
    {
      id: "1234556",
      pending: "$28.000.000",
      newBalance: "$32.000.000"
    },
    {
      id: "1234556",
      pending: "$28.000.000",
      newBalance: "$32.000.000"
    }
  ];

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <CaretLeft /> Aplicar nota débito
      </div>
      {currentStep === GenerateDebitNoteStep.SelectNotes && (
        <div className={styles.content}>
          <div className={styles.title}>Selecciona la(s) nota(s) crédito a aplicar</div>
          <div className={styles.notesList}>
            {[1, 1, 1, 1].map(() => (
              <div key={Math.random()} className={styles.noteItem}>
                <Checkbox />
                <div className={styles.texts}>
                  <div className={styles.name}>Nota débito 12345</div>
                  <div className={styles.description}>Volumen</div>
                </div>
                <div className={styles.values}>
                  <div className={styles.value}>$12.000.000</div>
                  <div className={styles.subValue}>$15.000.000</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.create}>
            <Plus /> Crear nota débito
          </div>
          <div className={styles.buttons}>
            <div className={styles.button}>Cancelar</div>
            <div
              className={`${styles.button} ${styles.primary}`}
              onClick={handleSelectNotesContinue}
            >
              Continuar
            </div>
          </div>
        </div>
      )}
      {currentStep === GenerateDebitNoteStep.DefineAmount && (
        <div className={styles.content}>
          <div className={styles.title}>Define el monto a aplicar a cada factura</div>
          <UiTabs
            className={styles.tabs}
            tabs={["12345", "23456", "34556"]}
            onTabClick={(tab) => console.log(tab)}
          />
          <div key={Math.random()} className={styles.noteItem}>
            <div className={styles.texts}>
              <div className={styles.name}>Nota débito 12345</div>
              <div className={styles.description}>Volumen</div>
            </div>
            <div className={styles.values}>
              <div className={styles.value}>$12.000.000</div>
              <div className={styles.subValue}>$15.000.000</div>
            </div>
          </div>
          <div className={styles.table}>
            <div className={styles.cellHeader}>ID Factura</div>
            <div className={styles.cellHeader}>Pendiente</div>
            <div className={styles.cellHeader}>Saldo nuevo</div>
            <div className={styles.cellHeader}>Valor a aplicar</div>
            {defineAmountItems.map((item, index) => (
              <Fragment key={`${item.id}-${index}`}>
                <div className={`${styles.cell} ${styles.id}`}>{item.id}</div>
                <div className={styles.cell}>{item.pending}</div>
                <div className={styles.cell}>{item.newBalance}</div>
                <div className={styles.cell}>
                  <input type="text" className={styles.toApplyInput} placeholder="Ingresar valor" />
                </div>
              </Fragment>
            ))}
          </div>
          <div className={styles.buttons}>
            <div className={styles.button}>Cancelar</div>
            <div
              className={`${styles.button} ${styles.primary}`}
              onClick={handleDefineAmountContinue}
            >
              Continuar
            </div>
          </div>
        </div>
      )}
      {currentStep === GenerateDebitNoteStep.Evidence && (
        <div className={styles.content}>
          <div className={styles.title}>
            Si deseas, adjunta un documento y/o ingresa un comentario
          </div>
          <div className={styles.evidenceSection}>
            <div className={styles.texts}>
              <div className={styles.name}>Evidencia</div>
              <div className={styles.description}>*Obligatorio</div>
            </div>
            <label htmlFor="upload-photo" className={styles.inputFileBox}>
              <FileArrowUp className={`${styles.icon} ${!!file ? styles.active : ""}`} />
              {!!file ? (
                <div className={`${styles.texts} ${styles.file}`}>
                  <div className={styles.name}>{file.name}</div>
                  <div className={styles.description}>
                    {new Date(file.lastModified).toLocaleString()}
                  </div>
                </div>
              ) : (
                <div className={styles.texts}>
                  <div className={styles.name}>Selecciona un archivo</div>
                  <div className={styles.description}>PDF, Word, PNG. (Tamaño max 30MB)</div>
                </div>
              )}
              <input
                type="file"
                name="photo"
                id="upload-photo"
                onChange={(e) => setFile(!!e.target.files ? e.target.files[0] : null)}
              />
            </label>
          </div>
          <div className={styles.evidenceSection}>
            <div className={styles.texts}>
              <div className={styles.name}>Evidencia</div>
              <div className={styles.description}>*Obligatorio</div>
            </div>
            <textarea name="comment" id="comment" placeholder="Ingresar comentario" />
          </div>
          <div className={styles.buttons}>
            <div className={styles.button}>Cancelar</div>
            <div className={`${styles.button} ${styles.primary}`}>Continuar</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GenerateDebitNote;
