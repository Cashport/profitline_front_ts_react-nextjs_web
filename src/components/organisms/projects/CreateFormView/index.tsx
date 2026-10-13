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
              {mode === "create" && "Crear formulario"}
              {mode === "edit" && "Editar formulario"}
              {mode === "preview" && watch("formName")}
              {mode === "answer" && watch("formName")}
            </Title>
            <Select value={mode} onChange={(value) => setMode(value)} style={{ width: 200 }}>
              <Option value="create">Modo creación</Option>
              <Option value="edit">Modo edición</Option>
              <Option value="preview">Vista previa</Option>
              <Option value="answer">Responder</Option>
            </Select>
          </Row>
          <Link href={`/proyectos/complete-form`}> Ir a completar formulario</Link>
          <Button
            type="text"
            icon={<CloseOutlined />}
            style={{ position: "absolute", right: "1rem", top: "1rem" }}
            onClick={handleGoBack}
          />

          <Row gutter={16}>
            <Col span={12}>
              <InputForm
                nameInput="formName"
                titleInput="Nombre del formulario"
                placeholder="Ingresar nombre"
                control={control}
              />
            </Col>
            <Col span={12}>
              <InputSelect
                titleInput="Vigencia"
                nameInput="validity"
                control={control}
                error={undefined}
                options={[
                  { value: 1, label: "1 año" },
                  { value: 2, label: "2 años" },
                  { value: 3, label: "3 años" }
                ]}
                loading={false}
                placeholder="Seleccionar vigencia"
              />
            </Col>
          </Row>
          <InputForm
            nameInput="formDescription"
            titleInput="Descripción"
            placeholder="Ingresar descripción"
            control={control}
          />

          {fields.map((question, index) => {
            if (mode === FormMode.CREATE || mode === FormMode.EDIT) {
              if (!question.type)
                return (
                  <Flex vertical key={`select-${question.id}`} gap={8}>
                    <p className={style.selectTitle}>Seleccionar tipo de pregunta</p>
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
              Agregar nueva pregunta
            </Button>
          </Flex>

          <FooterButtons
            backTitle={"Cancelar"}
            nextTitle={"Guardar"}
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
