import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Modal } from "antd";

import { getClientsByProject } from "@/services/banksPayments/banksPayments";
import { useAppStore } from "@/lib/store/store";
import { createBankRule } from "@/services/banksRules/banksRules";
import { useMessageApi } from "@/context/MessageContext";

import SecondaryButton from "@/components/atoms/buttons/secondaryButton/SecondaryButton";
import PrincipalButton from "@/components/atoms/buttons/principalButton/PrincipalButton";
import GeneralSelect from "@/components/ui/general-select";
import { InputForm } from "@/components/atoms/inputs/InputForm/InputForm";

import "./bank-rule-modal.scss";

type Selector = { value: number | string; label: string };

interface ISelect {
  value: string;
  label: string;
}
interface Props {
  onClose: () => void;
  showBankRuleModal: {
    isOpen: boolean;
    ruleId: number;
  };
  mutate: () => void;
}

export const BankRuleModal = ({ showBankRuleModal, onClose, mutate }: Props) => {
  const [ruleCount, setRuleCount] = useState(1);
  const [clients, setClients] = useState<ISelect[]>([]);
  const { ID } = useAppStore((state) => state.selectedProject);

  const { showMessage } = useMessageApi();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await getClientsByProject(ID);

        const testClients = response.map((client) => {
          const key = Object.keys(client)[0];
          const value = client[key];
          return {
            value: value.toString(),
            label: key
          };
        });

        setClients(testClients);
      } catch (error) {
        console.error("Error al cargar los clientes del input");
      }
    };
    fetchClients();
  }, [ID]);

  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset
  } = useForm<{
    rules: {
      id?: number;
      description: string;
      client_name: Selector;
      coincidence: Selector;
    }[];
  }>({});

  const handleAddRule = () => {
    setRuleCount((prevCount) => prevCount + 1);
  };

  const handleAddEditRule = async (data: any) => {
    // If editing a rule, we need to pass the ruleId
    if (showBankRuleModal.ruleId) {
      console.info("Edit rule with id", showBankRuleModal.ruleId);
    } else {
      // If creating a new rule, we need to prepare the data
      const modelData = {
        project_id: ID,
        description: data.rules[0].description,
        id_client: data.rules[0].client_name.value,
        is_exactly: data.rules[0].coincidence.value === "1"
      };

      try {
        await createBankRule(modelData);
        showMessage("success", "Regla creada con éxito");
        mutate();
        onClose();
      } catch (error) {
        showMessage("error", "Error al crear la regla");
      }
    }
  };

  useEffect(() => {
    if (!showBankRuleModal.isOpen) {
      setRuleCount(1);
      reset();
    }
  }, [showBankRuleModal.isOpen]);
  return (
    <Modal
      className="bankRuleModal"
      width={"65%"}
      open={showBankRuleModal.isOpen}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <h2 className="bankRuleModal__title">
        {showBankRuleModal.ruleId ? "Editar regla" : "Nueva regla"}
      </h2>
      <p className="bankRuleModal__description">Ingresa descripcion y nombre del cliente</p>

      <div className="bankRuleModal__rules">
        {[...Array(ruleCount)].map((_, index) => (
          <div key={index} className="bankRuleModal__singleRule">
            <InputForm
              titleInput="Descripción"
              control={control}
              nameInput={`rules.${index}.description`}
            />
            <p className="equalSign">=</p>
            <Controller
              name={`rules.${index}.client_name`}
              control={control}
              rules={{ required: true, minLength: 1 }}
              render={({ field }) => (
                <GeneralSelect
                  field={field}
                  title="Nombre del cliente"
                  placeholder="Ingresar nombre"
                  options={clients?.map((client) => client)}
                  showSearch
                />
              )}
            />
            <Controller
              name={`rules.${index}.coincidence`}
              control={control}
              rules={{ required: true, minLength: 1 }}
              render={({ field }) => (
                <GeneralSelect
                  field={field}
                  title="Coincidencia"
                  placeholder="Seleccione coincidencia"
                  options={mockCoincidences?.map((coincidence) => coincidence)}
                />
              )}
            />
          </div>
        ))}
      </div>

      {/* Here is the button to add more rules but backend does not exist */}
      {/* {!showBankRuleModal.ruleId && (
        <Button
          type="text"
          size="large"
          style={{ paddingLeft: 0, fontWeight: 500, width: "fit-content", marginTop: "-0.8rem" }}
          onClick={handleAddRule}
          icon={<Plus size={"1.45rem"} />}
        >
          Agregar otra
        </Button>
      )} */}
      <div className="bankRuleModal__footer">
        <SecondaryButton onClick={onClose}>Cancelar</SecondaryButton>
        <PrincipalButton disabled={!isValid} onClick={handleSubmit(handleAddEditRule)}>
          {showBankRuleModal.ruleId ? "Guardar cambios" : "Crear nueva regla"}
        </PrincipalButton>
      </div>
    </Modal>
  );
};

const mockCoincidences = [
  { value: "1", label: "Coincidencia exacta" },
  { value: "0", label: "Contiene" }
];
