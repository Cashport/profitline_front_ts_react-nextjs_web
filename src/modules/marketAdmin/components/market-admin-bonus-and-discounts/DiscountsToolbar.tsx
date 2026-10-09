"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { Plus, ChevronLeft } from "lucide-react";

interface DiscountsToolbarProps {
  onCrearNuevo: () => void;
  // Search / acciones / filters — whatever the tab needs between the back arrow and the CTA
  children?: ReactNode;
}

export default function DiscountsToolbar({ onCrearNuevo, children }: DiscountsToolbarProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Link
        href="/market-admin"
        className="flex items-center gap-1.5 px-2 h-8 rounded-lg text-sm text-[#666666] hover:text-[#141414] hover:bg-[#F0F0F0] transition-colors flex-shrink-0"
      >
        <ChevronLeft size={18} />
      </Link>
      {children}
      <div className="flex-1" />
      <button
        onClick={onCrearNuevo}
        className="flex items-center gap-1.5 px-4 py-2 bg-[#CBE71E] text-[#141414] rounded-lg text-sm font-semibold hover:bg-[#b8d11a] transition-colors"
      >
        <Plus size={14} /> Crear nuevo
      </button>
    </div>
  );
}
