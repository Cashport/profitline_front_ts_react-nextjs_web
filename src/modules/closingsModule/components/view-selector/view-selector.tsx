"use client";

import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/utils/utils";

import { useClosingsDark } from "../../containers/closings-layout/closings-layout";

export interface ClosingView<K extends string> {
  key: K;
  /** Título del encabezado cuando la vista está activa. */
  name: string;
  description: string;
}

interface Props<K extends string> {
  views: ClosingView<K>[];
  value: K;
  onChange: (key: K) => void;
}

/**
 * Título del encabezado y selector de vistas del módulo, como "cambiar tablero" en la Torre
 * de recaudo: reemplaza la barra de pestañas. Se usa con teclado y se cierra al elegir.
 */
export default function ViewSelector<K extends string>({ views, value, onChange }: Props<K>) {
  const isDark = useClosingsDark();
  const active = views.find((v) => v.key === value) ?? views[0];

  const items: MenuProps["items"] = [
    {
      type: "group",
      key: "views",
      label: "Cierres de cartera",
      children: views.map((v) => ({
        key: v.key,
        label: (
          <span className="grid grid-cols-[1fr_16px] items-center gap-x-2.5 py-0.5">
            <b className="text-[13px] font-semibold">{v.name}</b>
            <Check
              className={cn("row-span-2 h-4 w-4 text-primary", v.key !== active.key && "invisible")}
            />
            <small className="text-[13px] text-muted-foreground">{v.description}</small>
          </span>
        )
      }))
    }
  ];

  return (
    <h1 className="m-0">
      <Dropdown
        trigger={["click"]}
        rootClassName={cn("closings-scope", isDark && "dark")}
        menu={{
          items,
          selectable: true,
          selectedKeys: [active.key],
          onClick: ({ key }) => onChange(key as K)
        }}
      >
        <button
          type="button"
          aria-haspopup="menu"
          className="-ml-1.5 flex cursor-pointer items-center gap-2 rounded-lg border-0 bg-transparent px-1.5 py-0 text-[18px] font-semibold leading-[1.2] text-cp-ink hover:bg-cp-muted"
        >
          {active.name}
          <ChevronDown className="h-5 w-5 text-cp-ink-3" />
        </button>
      </Dropdown>
    </h1>
  );
}
