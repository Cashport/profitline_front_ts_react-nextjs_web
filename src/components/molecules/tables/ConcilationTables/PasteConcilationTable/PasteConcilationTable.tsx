"use client";
import UiSearchInput from "@/components/ui/search-input/search-input";
import type { ColumnsType } from "antd/es/table";
import { Button, Flex, Input, message, Table } from "antd";
import React, { useState, useRef, useCallback, useMemo, Dispatch, SetStateAction } from "react";
import "./pasteConcilationTable.scss";
import { useDebounce } from "@/hooks/useSearch";
import { ModalNextConcilation } from "@/components/molecules/modals/ModalNextConcilation/ModalNextConcilation";
import { MicrosoftExcelLogo } from "phosphor-react";
import { invoiceConciliation } from "@/services/concilation/concilation";
import { dataConcilation, InfoConcilation } from "@/types/concilation/concilation";
import { useAppStore } from "@/lib/store/store";
import { ModalConcilation } from "@/components/molecules/modals/ModalConcilation/ModalConcilation";

interface DataType {
  key: string;
  factura: number | string;
  monto: number;
  observacion: string;
}

interface Props {
  invoices?: InfoConcilation;
  setCurrentView: (view: "paste" | "state") => void;
  setInvoices?: Dispatch<SetStateAction<InfoConcilation | undefined>>;
  clientId: number;
}

export const PasteConcilationTable = ({
  setCurrentView,
  setInvoices,
  invoices,
  clientId
}: Props) => {
  const { ID } = useAppStore((state) => state.selectProject);
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const [searchValue, setSearchValue] = useState<string>("");
  const [messageApi, contextHolder] = message.useMessage();

  const debouncedSearchValue = useDebounce(searchValue, 300);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
  };

  const filteredData = useMemo(() => {
    return dataSource.filter((item) => item.factura.toString().includes(debouncedSearchValue));
  }, [dataSource, debouncedSearchValue]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // const handlePaste = useCallback(
  //   (event: React.ClipboardEvent<HTMLTextAreaElement>) => {
  //     const pasteData = event.clipboardData.getData("Text");
  //     const rows = pasteData.split("\n").filter((row) => row.trim() !== "");
  //     const validRows: { key: string; factura: string; monto: number; observacion: string }[] = [];
  //     let hasError = false;

  //     rows.forEach((row, index) => {
  //       const columns = row.split("\t");
  //       if (columns.length < 2) {
  //         hasError = true;
  //         return;
  //       }
  //       if (!isNaN(parseFloat(columns[1]))) {
  //         validRows.push({
  //           key: (dataSource.length + validRows.length + 1).toString(),
  //           factura: columns[0].trim(),
  //           monto: parseFloat(columns[1]),
  //           observacion: columns[2]?.trim() || ""
  //         });
  //       } else {
  //         hasError = true;
  //         messageApi.error(`Valor inválido en la fila ${index + 1}: ${row}`);
  //         return;
  //       }
  //     });

  //     if (!hasError && validRows.length > 0) {
  //       setDataSource((prevData) => [...prevData, ...validRows]);
  //     } else {
  //       messageApi.error("El formato de la tabla no es correcto. Por favor, verifique los datos.");
  //       return;
  //     }
  //     messageApi.success(
  //       `Se han agregado ${validRows.length} filas a la tabla. Total de filas: ${dataSource.length + validRows.length}`
  //     );
  //   },
  //   [dataSource.length, messageApi]
  // );

  const handlePaste = useCallback(async () => {
    try {
      const pasteData = await navigator.clipboard.readText();
      const rows = pasteData.split("\n").filter((row) => row.trim() !== "");
      const validRows: { key: string; factura: string; monto: number; observacion: string }[] = [];
      let hasError = false;

      rows.forEach((row, index) => {
        const columns = row.split("\t");
        if (columns.length < 2) {
          hasError = true;
          return;
        }
        if (!isNaN(parseFloat(columns[1]))) {
          validRows.push({
            key: (dataSource.length + validRows.length + 1).toString(),
            factura: columns[0].trim(),
            monto: parseFloat(columns[1]),
            observacion: columns[2]?.trim() || ""
          });
        } else {
          hasError = true;
          messageApi.error(`Valor inválido en la fila ${index + 1}: ${row}`);
          return;
        }
      });

      if (!hasError && validRows.length > 0) {
        setDataSource((prevData) => [...prevData, ...validRows]);
      } else {
        messageApi.error("El formato de la tabla no es correcto. Por favor, verifique los datos.");
        return;
      }
      messageApi.success(
        `Se han agregado ${validRows.length} filas a la tabla. Total de filas: ${dataSource.length + validRows.length}`
      );
    } catch (err) {
      console.error("Failed to read clipboard contents: ", err);
    }
  }, [dataSource.length, messageApi]);
  const handleSave = useCallback((row: DataType) => {
    setDataSource((prevData) =>
      prevData.map((item) => (item.key === row.key ? { ...item, ...row } : item))
    );
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const columns: ColumnsType<DataType> = useMemo(
    () => [
      {
        title: "Factura",
        dataIndex: "factura",
        key: "factura",
        width: "20%",
        render: (text: string) => text
      },
      {
        title: "Monto",
        dataIndex: "monto",
        key: "monto",
        width: "20%",
        render: (text) => `$${text}`.replace(/\B(?=(\d{3})+(?!\d))/g, "."),
        sorter: (a, b) => a.monto - b.monto
      },
      {
        title: "Observacion",
        dataIndex: "observacion",
        key: "observacion",
        render: (_: any, record: DataType) => (
          <Input
            className="input__table"
            value={record.observacion}
            onChange={(e) => {
              const value = e.target.value;
              const sanitizedValue = value.replace(/;/g, ",");
              handleSave({ ...record, observacion: sanitizedValue });
            }}
          />
        )
      }
    ],
    [handleSave]
  );

  const convertToCSV = (data: DataType[]) => {
    const header = "factura;monto;observacion\n";
    const rows = data.map((row) => `${row.factura};${row.monto};${row.observacion}`).join("\n");
    return header + rows;
  };

  const submitCSV = async () => {
    const csvData = convertToCSV(dataSource);
    const blob = new Blob([csvData], { type: "text/csv" });
    const file = new File([blob], "conciliacion.csv", { type: "text/csv" });
    try {
      const response: dataConcilation = await invoiceConciliation([file], clientId, ID);
      response && setInvoices && setInvoices(response.data);
      showModal();
    } catch (error) {
      messageApi.error("Error al realizar la conciliación");
      console.error("Error:", error);
    }
  };

  return (
    <div className="concilation__view">
      {dataSource.length !== 0 && (
        <ModalConcilation total={dataSource.reduce((acc, curr) => acc + curr.monto, 0)} />
      )}
      {contextHolder}
      <Flex vertical gap={"1rem"}>
        <Flex className="searchBar__container">
          <Flex className="searchBar__input">
            <UiSearchInput
              placeholder="Buscar por factura"
              onChange={(event) => handleSearch(event.target.value)}
            />
            {/* <FiltersConcilation /> */} {/* en el diseño está, por petición lo comentamos */}
            <Button className="button__format" onClick={handlePaste}>
              <MicrosoftExcelLogo size={22} /> Pegar desde excel
            </Button>
          </Flex>

          <Button
            className="button__format"
            disabled={dataSource.length === 0}
            onClick={() => {
              dataSource.length > 0 && submitCSV();
            }}
          >
            Conciliar
          </Button>
        </Flex>
        <Table dataSource={filteredData} columns={columns} pagination={false} />
        <textarea
          ref={textareaRef}
          onPaste={handlePaste}
          style={{ position: "absolute", left: "-9999px" }}
        />
      </Flex>
      <ModalNextConcilation
        visible={isModalVisible}
        onClose={closeModal}
        invoices={invoices}
        changeView={() => setCurrentView("state")}
      />
    </div>
  );
};
