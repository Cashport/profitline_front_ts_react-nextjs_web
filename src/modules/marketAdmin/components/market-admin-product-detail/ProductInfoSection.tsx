"use client";

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-[#999999]">{label}</span>
      <span className="text-sm font-bold text-[#141414]">{value}</span>
    </div>
  );
}

type Props = {
  linea: string;
  canal: string;
  skus: number | string;
  precioBase: number | null;
  lotesCount: number | string;
  activo: boolean;
  onToggleActivo: () => void;
};

export default function ProductInfoSection({
  linea,
  canal,
  skus,
  precioBase,
  lotesCount,
  activo,
  onToggleActivo
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="flex flex-col gap-5">
        <p className="text-sm font-bold text-[#141414]">Información del producto</p>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Línea" value={linea} />
          <Field label="Canal" value={canal} />
          <Field label="SKUs" value={String(skus)} />
        </div>
      </div>
      <div className="flex flex-col gap-5">
        <p className="text-sm font-bold text-[#141414]">Precio y estado</p>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Precio base" value={precioBase} />
          <Field label="Lotes" value={String(lotesCount)} />
          <div className="flex flex-col gap-1">
            <span className="text-xs text-[#999999]">Visible en Marketplace</span>
            <button
              onClick={onToggleActivo}
              className={`w-10 h-5 rounded-full transition-colors relative mt-0.5 ${
                activo ? "bg-[#141414]" : "bg-[#DDDDDD]"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                  activo ? "left-5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
