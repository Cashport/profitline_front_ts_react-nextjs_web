import { Col, Row } from "antd";
import { SelectTypeButton } from "../SelectTypeButton";
import { Calendar, CheckSquare, Files, NumberSquareNine, RadioButton } from "phosphor-react";
import { TextAUnderline } from "@phosphor-icons/react";
import { QuestionType } from "../../controllers/formSchema";
import { useTranslations } from "use-intl";

interface Props {
  typeSelected: QuestionType | null;
  handleTypeClick: (type: QuestionType) => void;
}
export const SelectType = ({ typeSelected, handleTypeClick }: Props) => {
  const t = useTranslations("projects.forms.questionTypes");
  return (
    <Row gutter={[8, 8]}>
      <Col span={8}>
        <SelectTypeButton
          icon={<CheckSquare />}
          onClick={() => handleTypeClick(QuestionType.MULTIPLE_CHOICE)}
          title={t("multipleChoice")}
          selected={typeSelected === QuestionType.MULTIPLE_CHOICE}
        />
      </Col>
      <Col span={8}>
        <SelectTypeButton
          icon={<RadioButton weight="fill" />}
          onClick={() => handleTypeClick(QuestionType.SINGLE_CHOICE)}
          title={t("singleChoice")}
          selected={typeSelected === QuestionType.SINGLE_CHOICE}
        />
      </Col>
      <Col span={8}>
        <SelectTypeButton
          icon={<TextAUnderline />}
          onClick={() => handleTypeClick(QuestionType.TEXT)}
          selected={typeSelected === QuestionType.TEXT}
          title={t("text")}
        />
      </Col>
      <Col span={8}>
        <SelectTypeButton
          icon={<Files />}
          onClick={() => handleTypeClick(QuestionType.FILE)}
          title={t("file")}
          selected={typeSelected === QuestionType.FILE}
        />
      </Col>
      <Col span={8}>
        <SelectTypeButton
          icon={<NumberSquareNine />}
          onClick={() => handleTypeClick(QuestionType.NUMBER)}
          title={t("number")}
          selected={typeSelected === QuestionType.NUMBER}
        />
      </Col>
      <Col span={8}>
        <SelectTypeButton
          icon={<Calendar />}
          onClick={() => handleTypeClick(QuestionType.DATE)}
          title={t("date")}
          selected={typeSelected === QuestionType.DATE}
        />
      </Col>
    </Row>
  );
};
