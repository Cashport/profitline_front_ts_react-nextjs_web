import { ChevronDown } from "lucide-react";

import { IClientBU } from "@/types/commerce/ICommerce";

interface ICanalSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: IClientBU[];
  disabled?: boolean;
}

function CanalSelect({ value, onChange, options, disabled = false }: ICanalSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none px-4 py-3 pr-10 border border-[#DDDDDD] rounded-lg text-sm bg-[#F7F7F7] focus:outline-none hover:border-[#141414] cursor-pointer transition-colors disabled:opacity-35 disabled:cursor-not-allowed disabled:hover:border-[#DDDDDD]"
        style={{ color: value ? "#141414" : "#999999" }}
      >
        <option value="">Seleccionar canal</option>
        {options.map((o) => (
          <option key={o.internal_code} value={o.internal_code} className="text-[#141414]">
            {o.bu_name}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#666666] pointer-events-none"
      />
    </div>
  );
}

export default CanalSelect;
