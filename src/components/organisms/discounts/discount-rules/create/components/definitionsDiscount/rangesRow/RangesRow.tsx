import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";
import { Button, Col, Flex, Row } from "antd";
import { Trash } from "phosphor-react";
import { Control, FieldErrors, UseFormRegister } from "react-hook-form";
import { DiscountSchema } from "../../../resolvers/generalResolver";

type RangesRowProps = {
  id: number;
  register: UseFormRegister<DiscountSchema>;
  control: Control<DiscountSchema, any>;
  errors: FieldErrors<DiscountSchema>;
  remove?: () => void;
};

export default function RangesRow({ id, register, control, errors, remove }: RangesRowProps) {
  const { name: nameDiscount, ...rest } = register(
    ("ranges." + id + ".discount") as "ranges.0.discount"
  );
  const { name: nameMin, ...restMin } = register(
    ("ranges." + id + ".unitsMin") as "ranges.0.unitsMin"
  );
  const { name: nameMax, ...restMax } = register(
    ("ranges." + id + ".unitsMax") as "ranges.0.discount"
  );
  return (
    <>
      <Flex justify="space-between" align="center">
        Rango {id}
        {remove && (
          <Button type="text" onClick={remove}>
            <Trash size={20} />
          </Button>
        )}
      </Flex>
      <Row>
        <Col span={7}>
          <InputForm
            control={control}
            error={errors.ranges?.[id]?.unitsMin}
            nameInput={nameMin}
            {...restMin}
            className={"style.inputDesc"}
          ></InputForm>
        </Col>
        <Col span={7} offset={1}>
          <InputForm
            control={control}
            error={errors.ranges?.[id]?.unitsMax}
            nameInput={nameMax}
            {...restMax}
            className={"style.inputDesc"}
          ></InputForm>
        </Col>
        <Col span={8} offset={1}>
          <InputForm
            control={control}
            error={errors.ranges?.[id]?.discount}
            nameInput={nameDiscount}
            {...rest}
            className={"style.inputDesc"}
          ></InputForm>
        </Col>
      </Row>
    </>
  );
}
