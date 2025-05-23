import React from "react";
import { Card, Button, Space, Switch, Flex, Typography } from "antd";
import { ArrowLineUp, Trash } from "phosphor-react";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { FormValues, QuestionType } from "../../controllers/formSchema";
import { Control } from "react-hook-form";
import ReusableList from "../ReusableList";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import "./questioncard.scss";
const { Text } = Typography;
// Define the props for the reusable component
interface QuestionCardProps {
  onDelete: () => void;
  order: number;
  questionType: QuestionType;
  control: Control<FormValues>;
  index: number;
  onChangeIsMandatory: (newState: boolean) => void;
  isRequired: boolean;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  index,
  order,
  onDelete,
  questionType,
  control,
  onChangeIsMandatory,
  isRequired
}) => {
  const renderAnswer = (questionType: QuestionType) => {
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <ReusableList
            control={control}
            name={`questions[${index}].options`}
            type={QuestionType.MULTIPLE_CHOICE}
          />
        );
      case QuestionType.SINGLE_CHOICE:
        return (
          <ReusableList
            control={control}
            name={`questions[${index}].options`}
            type={QuestionType.SINGLE_CHOICE}
          />
        );
      case QuestionType.DATE:
        return (
          <InputDateForm
            hiddenTitle
            titleInput=""
            nameInput="expiration_date"
            placeholder="Seleccionar fecha"
            control={control}
            error={undefined}
            disabled={true}
          />
        );
      case QuestionType.NUMBER:
        return (
          <InputForm
            hiddenTitle
            control={control}
            nameInput="answer"
            error={undefined}
            placeholder="Ingresar número"
            typeInput="number"
            readOnly={true}
          />
        );
      case QuestionType.FILE:
        return (
          <Button
            type="text"
            onClick={() => {}}
            disabled={true}
            style={{
              backgroundColor: "#F7F7F7",
              fontWeight: 300,
              fontSize: 16,
              border: "none",
              height: "100%",
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 12,
              paddingRight: 12,
              borderRadius: 4
            }}
          >
            <ArrowLineUp color="#DDDDDD" size={16} />
            <Text style={{ color: "#DDDDDD" }}>Cargar archivo</Text>
          </Button>
        );
      case QuestionType.TEXT:
        return (
          <InputForm
            hiddenTitle
            control={control}
            nameInput="answer"
            readOnly={true}
            error={undefined}
            placeholder="Ingresar texto"
          />
        );
      default:
        return <></>;
    }
  };

  const renderQuestion = () => {
    return (
      <>
        {/* Question Name */}
        <InputForm
          hiddenTitle
          control={control}
          nameInput={`questions[${index}].question`}
          error={undefined}
          placeholder="Pregunta"
        />
        {/* Question Description */}
        <InputForm
          hiddenTitle
          control={control}
          nameInput={`questions[${index}].description`}
          error={undefined}
          placeholder="Descripción de la pregunta"
        />
      </>
    );
  };

  return (
    <Card
      className="custom-card"
      title={`${order}.`}
      extra={<Button type="text" icon={<Trash size={20} />} onClick={onDelete} />}
      key={order}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {renderQuestion()}
        <hr style={{ borderTop: "1px solid #f7f7f7" }} />
        {/* Options for multiple/single choice */}
        {renderAnswer(questionType)}
        {/* Required Switch */}
        <hr style={{ borderTop: "1px solid #f7f7f7" }} />
        <Flex justify="flex-end">
          <Switch
            checked={isRequired}
            onChange={(e) => {
              onChangeIsMandatory(e);
            }}
            style={{ marginRight: "0.5rem" }}
          />
          <Text>Obligatorio</Text>
        </Flex>
      </Space>
    </Card>
  );
};

export default QuestionCard;
