import { ChevronDown } from "lucide-react";

// Canal: UI-only, 2 mock options (order payload has no channel field).
const CANAL_OPTIONS = [
  { value: "mostrador", label: "Mostrador" },
  { value: "domicilio", label: "Domicilio" }
];

interface ICanalSelectProps {
  value: string;
  onChange: (value: string) => void;
}

function CanalSelect({ value, onChange }: ICanalSelectProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-3 pr-10 border border-[#DDDDDD] rounded-lg text-sm bg-[#F7F7F7] focus:outline-none hover:border-[#141414] cursor-pointer transition-colors"
        style={{ color: value ? "#141414" : "#999999" }}
      >
        <option value="">Seleccionar canal</option>
        {CANAL_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="text-[#141414]">
            {o.label}
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
