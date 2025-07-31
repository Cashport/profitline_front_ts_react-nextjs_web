"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { NumericFormat } from "react-number-format";
import { Flex, Input } from "antd";
import { PlusCircle } from "@phosphor-icons/react";

import MobileNavBar from "../../components/atoms/MobileNavBar/MobileNavBar";
import PendingInvoiceCard from "../../components/PendingInvoiceCard/PendingInvoiceCard";
import PaymentSummaryConfirm from "../../components/PaymentSummaryConfirm/PaymentSummaryConfirm";

import "./modifyPayments.scss";

type IInvoiceFormItem = {
  id: string;
  code: string;
  date: string;
  modifiedValue: string;
  isPastDue?: boolean;
  formattedOriginalAmount?: string;
};

type IPaymentFormValues = {
  invoices: IInvoiceFormItem[];
};

const ModifyPayments: React.FC = () => {
  const router = useRouter();

  // Inicializar react-hook-form con el arreglo de invoices
  const { control, handleSubmit } = useForm<IPaymentFormValues>({
    defaultValues: {
      invoices: pendingInvoices.map((invoice) => ({
        id: invoice.id,
        code: invoice.code,
        date: invoice.date,
        modifiedValue: invoice.originalAmount?.toString() || invoice.amount.toString(),
        isPastDue: invoice.isPastDue,
        formattedOriginalAmount: invoice.formattedOriginalAmount
      }))
    }
  });

  // Hook para manejar el array de invoices
  const { fields } = useFieldArray({
    control,
    name: "invoices"
  });

  const handleGoBack = () => {
    router.push("/mobile/confirmPayment");
  };

  const onSubmit = (data: IPaymentFormValues) => {
    console.info("Submitted data (raw):", data);
  };

  // Componente personalizado para el input con formato
  const CustomNumberInput = React.forwardRef<HTMLInputElement, any>((props, ref) => {
    return <Input {...props} ref={ref} className="modifyPayments__input" />;
  });
  CustomNumberInput.displayName = "CustomNumberInput";

  return (
    <MobileNavBar title={"Modificar y pagar"} onBack={handleGoBack}>
      {/* Margin based on PaymentSummaryConfirm at the bottom */}
      <div style={{ marginBottom: "115px" }}>
        <Flex vertical gap={"0.625rem"} className="modifyPayments">
          <Flex vertical gap="1rem">
            <p className="modifyPayments__description">
              Ingresa los valores que deseas pagar por cada factura
            </p>

            <Flex vertical gap="0.5rem">
              {fields.map((field, index) => (
                <PendingInvoiceCard
                  key={field.id}
                  invoice={{
                    id: field.id,
                    code: field.code,
                    date: field.date,
                    isPastDue: field.isPastDue || false,
                    formattedOriginalAmount: field.formattedOriginalAmount
                  }}
                  onClick={() => console.log(field.id)}
                  isInteractive={false}
                  rightColumnNode={
                    <Controller
                      name={`invoices.${index}.modifiedValue`}
                      control={control}
                      render={({ field: { onChange, value, onBlur } }) => (
                        <NumericFormat
                          value={value}
                          onValueChange={(values) => {
                            onChange(values.value);
                          }}
                          onBlur={onBlur}
                          customInput={CustomNumberInput}
                          thousandSeparator="."
                          decimalSeparator=","
                          prefix="$ "
                          allowNegative={false}
                          decimalScale={0}
                          placeholder="$ 0"
                        />
                      )}
                    />
                  }
                />
              ))}
            </Flex>
          </Flex>

          <button className="modifyPayments__addDocument">
            Agregar documento
            <PlusCircle size={14} />
          </button>
        </Flex>

        <PaymentSummaryConfirm total={1221212} onConfirm={handleSubmit(onSubmit)} />
      </div>
    </MobileNavBar>
  );
};

export default ModifyPayments;

const pendingInvoices = [
  {
    id: "1",
    code: "VT-22214",
    date: "Jun 3, 2025",
    amount: 288000,
    formattedAmount: "288.000",
    isPastDue: true
  },
  {
    id: "2",
    code: "VT-222766",
    date: "Jun 3, 2025",
    amount: 14900690,
    formattedAmount: "14.900.690",
    originalAmount: 16556323,
    formattedOriginalAmount: "16.556.323"
  },
  {
    id: "3",
    code: "VT-223045",
    date: "Jun 3, 2025",
    amount: 14078700,
    formattedAmount: "14.078.700",
    originalAmount: 15643000,
    formattedOriginalAmount: "15.643.000"
  }
];
