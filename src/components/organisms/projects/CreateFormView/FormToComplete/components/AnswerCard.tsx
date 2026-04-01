import React from "react";
import { Card, Space, Typography } from "antd";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { QuestionType } from "../../controllers/formSchema";
import { Control, FieldErrors } from "react-hook-form";
import { FormValues, Question } from "../schema";
import { InputDateForm } from "@/components/atoms/inputs/InputDate/InputDateForm";
import "./answercard.scss";
import OptionList from "./OptionList/OptionList";
import FileUploadButton from "./FileUploadButton/FileUploadButton";
const { Text, Title } = Typography;

interface AnswerCardProps {
  index: number;
  question: Question;
  control: Control<FormValues>;
  setValue: any;
  errors: FieldErrors<FormValues>;
}

const AnswerCard: React.FC<AnswerCardProps> = ({ index, question, control, setValue, errors }) => {
  const renderAnswer = (questionType: QuestionType) => {
    const fieldName = `answers[${index}].value`;
    switch (questionType) {
      case QuestionType.MULTIPLE_CHOICE:
        return (
          <OptionList
            control={control}
            name={fieldName}
            type={QuestionType.MULTIPLE_CHOICE}
            options={question?.options ?? []}
            setValue={setValue}
            error={errors?.answers?.[index]?.value}
            required={question.isRequired}
          />
        );
      case QuestionType.SINGLE_CHOICE:
        return (
          <OptionList
            control={control}
            name={fieldName}
            type={QuestionType.SINGLE_CHOICE}
            options={question?.options ?? []}
            setValue={setValue}
            error={errors?.answers?.[index]?.value}
            required={question.isRequired}
          />
        );
      case QuestionType.DATE:
        return (
          <InputDateForm
            hiddenTitle
            titleInput=""
            nameInput={fieldName}
            placeholder="Seleccionar fecha"
            control={control}
            error={errors?.answers?.[index]?.value}
            validationRules={{
              required: question.isRequired ? "Este campo es obligatorio" : false
            }}
          />
        );
      case QuestionType.NUMBER:
        return (
          <InputForm
            hiddenTitle
            control={control}
            nameInput={fieldName}
            error={errors?.answers?.[index]?.value}
            placeholder="Ingresar número"
            typeInput="number"
            validationRules={{
              required: question.isRequired ? "Este campo es obligatorio" : false
            }}
          />
        );
      case QuestionType.FILE:
        return (
          <FileUploadButton
            name={`answers[${index}].value`}
            control={control}
            required={question.isRequired}
          />
        );
      case QuestionType.TEXT:
        return (
          <InputForm
            hiddenTitle
            control={control}
            nameInput={`answers[${index}].value`}
            error={errors?.answers?.[index]?.value}
            placeholder="Ingresar texto"
            validationRules={{
              required: question.isRequired ? "Este campo es obligatorio" : false
            }}
          />
        );
      default:
        return <></>;
    }
  };
  const getTitle = () => {
    return (
      <Title level={4} style={{ margin: 0 }}>
        {`${index + 1}. `}{" "}
        <Text style={{ fontWeight: 300, fontSize: 16 }}>{`${question.question}`}</Text>{" "}
        {question.isRequired && <Text style={{ color: "red" }}>*</Text>}
      </Title>
    );
  };

  const renderQuestion = () => {
    return (
      <Text style={{ fontWeight: 300, fontSize: 16, color: "#DDDDDD" }}>
        {question.description}
      </Text>
    );
  };
  return (
    <Card className="custom-card" title={getTitle()} key={question.id}>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {renderQuestion()}
        <hr style={{ borderTop: "1px solid #f7f7f7" }} />
        {renderAnswer(question.type)}
      </Space>
    </Card>
  );
};

export default AnswerCard;
