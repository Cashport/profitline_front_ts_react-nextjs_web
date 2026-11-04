import React, { useEffect, useState } from "react";
import { Button, Row, Col, Select, Flex, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { Plus } from "phosphor-react";
import style from "./form.module.scss";
import QuestionCard from "./components/QuestionCard";
import { SelectType } from "./components/SelectType";
import { FormMode, FormValues, Question, QuestionType } from "./controllers/formSchema";
import { useFieldArray, useForm } from "react-hook-form";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { InputSelect } from "@/components/atoms/inputs/InputSelect/InputSelect";
import { FooterButtons } from "@/components/molecules/FooterButtons/FooterButtons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mockData } from "./mocked-data";
import { useTranslations } from "use-intl";

const { Title } = Typography;
const { Option } = Select;

const defaultQuestion = {
  type: null,
  question: "",
  description: "",
  isRequired: false,
  options: [],
  answer: ""
};

const CreateFormView: React.FC = () => {
  const t = useTranslations("projects.forms");
  const tCommon = useTranslations("common");
  const { control, handleSubmit, watch, reset, formState } = useForm<FormValues>({
    defaultValues: {
      formName: "",
      formDescription: "",
      validity: 0,
      questions: [defaultQuestion]
    }
  });
  console.log("formState", formState);
  const [mode, setMode] = useState<FormMode>(FormMode.CREATE);
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: "questions",
    keyName: "id"
  });
  // Simulación de carga de datos desde la API
  useEffect(() => {
    if (mode === FormMode.EDIT) {
      setTimeout(() => {
        reset(mockData);
      }, 1000);
      // fetch("/api/form-data") // Cambiar a tu endpoint real
      //   .then((res) => res.json())
      //   .then((data) => {
      //     // Mapea los datos de la API a la estructura del formulario
      //     reset({
      //       formName: data.formName,
      //       formDescription: data.formDescription,
      //       validity: data.validity,
      //       questions: data.questions
      //     });
      //   })
      //   .finally(() => setLoading(false));
    }
  }, [mode, reset]);
  const formNow = watch();
  console.log("formNow", formNow);

  const onSubmit = (data: FormValues) => {
    console.log("SUBMIT", data);
  };
  console.log("fields", fields);
  const handleTypeClick = (index: number, question: Question, type: QuestionType) => {
    update(index, { ...question, type });
  };
  const handleChangeIsMandatory = (index: number, question: Question, newState: boolean) => {
    update(index, { ...question, isRequired: newState });
  };
  const handleDeleteQuestion = (index: number) => {
    remove(index);
  };

  const handleAddQuestion = () => {
    append(defaultQuestion);
  };
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className={style.container}>
        <Flex
          vertical
          gap="1.5rem"
          style={{
            maxWidth: "42rem",
            margin: "auto"
          }}
        >
          <Row justify="space-between" align="middle">
            <Title level={4} style={{ margin: 0 }}>
              {mode === "create" && t("createTitle")}
              {mode === "edit" && t("editTitle")}
              {mode === "preview" && watch("formName")}
              {mode === "answer" && watch("formName")}
            </Title>
            <Select value={mode} onChange={(value) => setMode(value)} style={{ width: 200 }}>
              <Option value="create">{t("modes.create")}</Option>
              <Option value="edit">{t("modes.edit")}</Option>
              <Option value="preview">{t("modes.preview")}</Option>
              <Option value="answer">{t("modes.answer")}</Option>
            </Select>
          </Row>
          <Link href={`/projects/complete-form`}> {t("goToComplete")}</Link>
          <Button
            type="text"
            icon={<CloseOutlined />}
            style={{ position: "absolute", right: "1rem", top: "1rem" }}
            onClick={handleGoBack}
            aria-label={t("close")}
          />

          <Row gutter={16}>
            <Col span={12}>
              <InputForm
                nameInput="formName"
                titleInput={t("formName")}
                placeholder={t("namePlaceholder")}
                control={control}
              />
            </Col>
            <Col span={12}>
              <InputSelect
                titleInput={t("validity")}
                nameInput="validity"
                control={control}
                error={undefined}
                options={[1, 2, 3].map((years) => ({
                  value: years,
                  label: t("validityYears", { count: years })
                }))}
                loading={false}
                placeholder={t("validityPlaceholder")}
              />
            </Col>
          </Row>
          <InputForm
            nameInput="formDescription"
            titleInput={tCommon("fields.description")}
            placeholder={t("descriptionPlaceholder")}
            control={control}
          />

          {fields.map((question, index) => {
            if (mode === FormMode.CREATE || mode === FormMode.EDIT) {
              if (!question.type)
                return (
                  <Flex vertical key={`select-${question.id}`} gap={8}>
                    <p className={style.selectTitle}>{t("selectQuestionType")}</p>
                    <SelectType
                      typeSelected={question.type}
                      handleTypeClick={(type: QuestionType) =>
                        handleTypeClick(index, question, type)
                      }
                    />
                  </Flex>
                );
            }
            return (
              <QuestionCard
                key={question.id}
                order={index + 1}
                onDelete={() => handleDeleteQuestion(index)}
                onChangeIsMandatory={(newState: boolean) =>
                  handleChangeIsMandatory(index, question, newState)
                }
                questionType={question.type as QuestionType}
                control={control}
                index={index}
                isRequired={question.isRequired}
              />
            );
          })}

          <Flex justify="flex-start">
            <Button
              type="dashed"
              onClick={() => handleAddQuestion()}
              icon={<Plus size={16} />}
              style={{
                backgroundColor: "#F7F7F7",
                fontWeight: 500,
                border: "none"
              }}
            >
              {t("addQuestion")}
            </Button>
          </Flex>

          <FooterButtons
            backTitle={tCommon("actions.cancel")}
            nextTitle={tCommon("actions.save")}
            handleBack={handleGoBack}
            handleNext={() => handleSubmit(onSubmit)()}
            nextDisabled={!formState.isValid}
            isSubmitting={false}
          />
        </Flex>
      </div>
    </form>
  );
};

export default CreateFormView;
