"use client";

import { Image } from "antd";

// Recuadro gris con una cámara para las fotos que no cargan (o sin URL válida).
const FOTO_FALLBACK = `data:image/svg+xml;utf8,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#f2f2f2"/><g fill="none" stroke="#9a9a9a" stroke-width="3" stroke-linejoin="round"><path d="M20 26h5l3-4h8l3 4h5v16H20z"/><circle cx="32" cy="34" r="5"/></g></svg>'
)}`;

// Miniaturas de una devolución (embalaje, productos o soportes de un documento)
// con vista previa en grupo. El backend puede mandar strings vacíos: se omiten.
export function DevolucionFotos({ urls }: { urls: string[] }) {
  const fotos = urls.filter(Boolean);
  if (!fotos.length) return null;

  return (
    <Image.PreviewGroup>
      <div className="flex flex-wrap gap-1.5">
        {fotos.map((url, i) => (
          <Image
            key={`${url}-${i}`}
            src={url}
            width={32}
            height={32}
            fallback={FOTO_FALLBACK}
            rootClassName="overflow-hidden rounded-md border border-gray-200"
            style={{ objectFit: "cover" }}
          />
        ))}
      </div>
    </Image.PreviewGroup>
  );
}
