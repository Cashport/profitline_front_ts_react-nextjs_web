/* eslint-disable no-unused-vars */
import React, { FC, useState } from "react";
import { Modal, Select, Typography } from "antd";
import { X } from "phosphor-react";
import FooterButtons from "@/components/atoms/FooterButtons/FooterButtons";
const { Title } = Typography;

export interface Option {
  value: number;
  label: string;
}

interface AddDiscountModalProps {
  isModalOpen: boolean;
  onClose: () => void;
  onConfirm: (discountId: number) => void;
  options: Option[];
  isLoading: boolean;
}
const AddDiscountModal: FC<AddDiscountModalProps> = ({
  isModalOpen,
  onClose,
  onConfirm,
  options,
  isLoading
}) => {
  const [selectedDiscountId, setSelectedDiscountId] = useState<number | null>(null);
  return (
    <Modal
      centered
      open={isModalOpen}
      width={698}
      onCancel={onClose}
      closeIcon={<X size={20} weight="bold" onClick={onClose} />}
      title={<Title level={4}>Agregar descuento</Title>}
      styles={{
        body: {
          maxHeight: "calc(85 * var(--vh))"
        }
      }}
      footer={
        <FooterButtons
          titleConfirm="Agregar descuento"
          isConfirmDisabled={!selectedDiscountId}
          onClose={onClose}
          handleOk={() => {
            if (selectedDiscountId) {
              onConfirm(selectedDiscountId);
              onClose();
              setSelectedDiscountId(null);
            }
          }}
        />
      }
    >
      <Select
        showSearch
        placeholder="Seleccione el descuento"
        style={{ width: "100%", height: "45px" }}
        options={options}
        onSelect={(value) => {
          setSelectedDiscountId(value);
        }}
        value={selectedDiscountId}
        loading={isLoading}
        filterOption={(input, option) =>
          option?.label ? option.label.toLowerCase().includes(input.toLowerCase()) : false
        }
      />
    </Modal>
  );
};

export default AddDiscountModal;
