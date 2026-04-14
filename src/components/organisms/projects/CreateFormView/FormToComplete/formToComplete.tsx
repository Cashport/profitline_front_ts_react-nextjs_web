import React, { useEffect, useState } from "react";
import { Button, Row, Flex, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import style from "./formtocomplete.module.scss";
import { useFieldArray, useForm } from "react-hook-form";
import { FooterButtons } from "@/components/molecules/FooterButtons/FooterButtons";
import { useRouter } from "next/navigation";
import { mockForm } from "./mock-form";
import { defaultFormLoaded, FormLoaded, FormValues } from "./schema";
import AnswerCard from "./components/AnswerCard";

const { Text, Title } = Typography;

const CompleteForm: React.FC = () => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitting },
    setValue
  } = useForm<FormValues>({
    defaultValues: {
      answers: []
    }
  });
  const [loadedForm, setLoadedForm] = useState<FormLoaded>(defaultFormLoaded);

  console.log("formState", isValid);
  const { fields } = useFieldArray({
    control,
    name: "answers",
    keyName: "id"
  });
  // Simulación de carga de datos desde la API
  useEffect(() => {
    setTimeout(() => {
      setLoadedForm(mockForm);
    }, 1000);
  }, []);
  const formNow = watch();
  console.log("formNow", formNow);

  const onSubmit = (data: FormValues) => {
    console.log("SUBMIT", data);
  };
  console.log("fields", fields);
  console.log("errors", errors);

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
              {loadedForm.formName}
            </Title>
          </Row>
          <Text style={{ margin: 0, fontSize: 16, fontWeight: 300 }}>
            {loadedForm.formDescription}
          </Text>
          <Button
            type="text"
            icon={<CloseOutlined />}
            style={{ position: "absolute", right: "1rem", top: "1rem" }}
            onClick={handleGoBack}
          />
          {loadedForm?.questions?.map((question, index) => {
            return (
              <AnswerCard
                key={`${question.id}-${index}`}
                index={index}
                question={question}
                control={control}
                setValue={setValue}
                errors={errors}
              />
            );
          })}
          <FooterButtons
            backTitle={"Cancelar"}
            nextTitle={"Finalizar"}
            handleBack={handleGoBack}
            handleNext={() => handleSubmit(onSubmit)()}
            nextDisabled={false}
            isSubmitting={isSubmitting}
          />
        </Flex>
      </div>
    </form>
  );
};

export default CompleteForm;
