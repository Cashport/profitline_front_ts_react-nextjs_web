"use client";

import { useRef } from "react";
import { Upload, Package } from "lucide-react";

type Props = {
  imagen: string;
  alt: string;
  onChange: (file: File, previewUrl: string) => void;
};

export default function ProductImageUpload({ imagen, alt, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file, URL.createObjectURL(file));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="w-full aspect-square rounded-xl bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
        {imagen ? (
          <img src={imagen} alt={alt} width={150} height={150} className="object-contain" />
        ) : (
          <Package size={48} className="text-[#CCCCCC]" />
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-1.5 text-sm text-[#666666] hover:text-[#141414] border border-[#DDDDDD] hover:border-[#141414] px-3 py-2 rounded-lg transition-colors justify-center"
      >
        <Upload size={13} /> Cambiar imagen
      </button>
    </div>
  );
}
