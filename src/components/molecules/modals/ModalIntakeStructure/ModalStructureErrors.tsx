import { Alert, Modal, Tag, Typography } from "antd";

import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
import { IStructureDetected, IStructureIssue } from "@/types/dataQuality/IIntakeStructure";

import "./modalIntakeStructure.scss";

const { Title, Text } = Typography;

export interface IStructureErrorsState {
  message: string;
  issues: IStructureIssue[];
  warnings: IStructureIssue[];
  detected?: IStructureDetected;
}

interface Props {
  open: boolean;
  state: IStructureErrorsState | null;
  onClose: () => void;
}

/** Errores de estructura del archivo (422): todos juntos y con su celda. */
export const ModalStructureErrors = ({ open, state, onClose }: Props) => {
  const detected = state?.detected;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={<Title level={4}>El archivo no tiene la estructura esperada</Title>}
      className="modalIntakeStructure"
      width={680}
      destroyOnClose
      footer={
        <FooterButtons
          titleConfirm="Entendido"
          showLeftButton={false}
          onClose={onClose}
          handleOk={onClose}
        />
      }
    >
      <Text>
        {state?.message}. Corrige el archivo y vuelve a cargarlo; no se procesó ningún dato.
      </Text>

      <ul className="issueList">
        {state?.issues.map((issue, i) => (
          <li key={i}>
            {issue.cell && <Tag color="red">{issue.cell}</Tag>}
            <span>{issue.message}</span>
          </li>
        ))}
      </ul>

      {!!state?.warnings.length && (
        <Alert
          className="structureAlert"
          type="warning"
          showIcon
          message="Advertencias"
          description={
            <ul>
              {state.warnings.map((w, i) => (
                <li key={i}>{w.message}</li>
              ))}
            </ul>
          }
        />
      )}

      {!!detected?.headers.length && (
        <div className="structureSummary">
          <Text type="secondary">
            Encabezados encontrados
            {detected.sheet ? ` en la hoja '${detected.sheet}'` : ""}
            {detected.headerCell ? ` desde la celda ${detected.headerCell}` : ""}:
          </Text>
          <div className="headerTags">
            {detected.headers.map((h, i) => (
              <Tag key={`${h}-${i}`}>{h || "(sin nombre)"}</Tag>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
