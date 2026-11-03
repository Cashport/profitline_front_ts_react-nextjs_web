"use client";

import { useEffect, useMemo, useState } from "react";
import { Checkbox, Spin } from "antd";
import { ChevronDown, ChevronRight } from "lucide-react";
import UiSearchInput from "@/components/ui/search-input";
import {
  IMarketAdminVendorCategory,
  IMarketAdminVendorLine
} from "@/types/marketAdmin/IMarketAdmin";

type Props = {
  lines: IMarketAdminVendorLine[];
  loading?: boolean;
  error?: string | null;
  isSaving?: boolean;
  onRetry: () => void;
  onSave: (categoryIds: number[]) => Promise<void>;
};

const assignedIdsOf = (lines: IMarketAdminVendorLine[]) =>
  lines.flatMap((l) => l.categories.filter((c) => c.assigned).map((c) => c.id));

const sameIds = (a: Set<number>, b: number[]) => a.size === b.length && b.every((id) => a.has(id));

const labelOf = (alias: string | null, description: string) => alias?.trim() || description;

const includesText = (q: string, ...values: (string | null)[]) =>
  values.some((value) => value?.toLowerCase().includes(q));

function CategoryRow({
  category,
  checked,
  disabled,
  onToggle
}: {
  category: IMarketAdminVendorCategory;
  checked: boolean;
  disabled?: boolean;
  onToggle: (checked: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const total = category.products.length;

  return (
    <div className="border-t border-[#F0F0F0]">
      <div className="flex items-center gap-3 px-4 py-2.5">
        <Checkbox
          checked={checked}
          disabled={disabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          disabled={total === 0}
          className="flex flex-1 items-center gap-2 text-left disabled:cursor-default"
        >
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          <span className="text-sm text-[#141414]">
            {labelOf(category.category_alias, category.description)}
          </span>
          <span className="text-[13px] text-[#999999]">
            {total === 1 ? "1 producto" : `${total} productos`}
          </span>
        </button>
      </div>

      {open && total > 0 && (
        <div
          className="ml-12 mr-4 mb-3 max-h-60 overflow-y-auto rounded-lg bg-[#F7F7F7]"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#d6d8de transparent" }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[13px] text-[#999999]">
                <th className="sticky top-0 bg-[#F7F7F7] px-3 py-2 font-medium">SKU</th>
                <th className="sticky top-0 bg-[#F7F7F7] px-3 py-2 font-medium">Producto</th>
                <th className="sticky top-0 bg-[#F7F7F7] px-3 py-2 font-medium w-28">Estado</th>
              </tr>
            </thead>
            <tbody>
              {category.products.map((p) => (
                <tr key={p.id} className="border-t border-[#EBEBEB]">
                  <td className="px-3 py-2 text-[#666666]">{p.sku}</td>
                  <td className="px-3 py-2 text-[#141414]">{p.description}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
                        p.is_available
                          ? "bg-[#F1F8D2] text-[#5B6B00]"
                          : "bg-[#F0F0F0] text-[#666666]"
                      }`}
                    >
                      {p.is_available ? "Disponible" : "No disponible"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default function LineasCategoriasSection({
  lines,
  loading,
  error,
  isSaving,
  onRetry,
  onSave
}: Props) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openLines, setOpenLines] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState("");

  const initialIds = useMemo(() => assignedIdsOf(lines), [lines]);

  useEffect(() => {
    setSelected(new Set(initialIds));
  }, [initialIds]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return lines;
    return lines
      .map((line) =>
        includesText(q, line.line_alias, line.description)
          ? line
          : {
              ...line,
              categories: line.categories.filter(
                (c) =>
                  includesText(q, c.category_alias, c.description) ||
                  c.products.some((p) => includesText(q, p.description, p.sku))
              )
            }
      )
      .filter((line) => line.categories.length > 0);
  }, [lines, search]);

  const totalCategories = useMemo(
    () => lines.reduce((acc, l) => acc + l.categories.length, 0),
    [lines]
  );
  const isDirty = !sameIds(selected, initialIds);

  const toggleCategory = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const toggleLine = (line: IMarketAdminVendorLine, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      line.categories.forEach((c) => (checked ? next.add(c.id) : next.delete(c.id)));
      return next;
    });
  };

  const toggleOpenLine = (lineId: number) => {
    setOpenLines((prev) => {
      const next = new Set(prev);
      if (next.has(lineId)) next.delete(lineId);
      else next.add(lineId);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert">
        <p className="text-red-600">{error}</p>
        <button onClick={onRetry} className="mt-2 text-sm underline">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-bold text-[#141414]">Líneas y categorías</p>
        <p className="text-sm text-[#999999] mt-1">
          Marca las categorías de cada línea cuyos productos podrá ver el usuario en el marketplace.{" "}
          {selected.size} de {totalCategories} categorías asignadas.
        </p>
      </div>

      <UiSearchInput
        placeholder="Buscar línea, categoría o producto"
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-[#999999] py-6 text-center">
          {search.trim()
            ? "No se encontraron líneas o categorías con ese criterio."
            : "El proyecto no tiene líneas con categorías configuradas."}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((line) => {
            const assignedInLine = line.categories.filter((c) => selected.has(c.id)).length;
            const allChecked = assignedInLine === line.categories.length;
            const isOpen = openLines.has(line.id) || search.trim() !== "";

            return (
              <div key={line.id} className="rounded-lg border border-[#EBEBEB] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-3 bg-[#FAFAFA]">
                  <Checkbox
                    checked={allChecked}
                    indeterminate={assignedInLine > 0 && !allChecked}
                    disabled={isSaving}
                    onChange={(e) => toggleLine(line, e.target.checked)}
                  />
                  <button
                    type="button"
                    onClick={() => toggleOpenLine(line.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    <span className="text-sm font-semibold text-[#141414]">
                      {labelOf(line.line_alias, line.description)}
                    </span>
                    <span className="ml-auto text-[13px] text-[#999999]">
                      {assignedInLine}/{line.categories.length} categorías
                    </span>
                  </button>
                </div>

                {isOpen &&
                  line.categories.map((category) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      checked={selected.has(category.id)}
                      disabled={isSaving}
                      onToggle={(checked) => toggleCategory(category.id, checked)}
                    />
                  ))}
              </div>
            );
          })}
        </div>
      )}

      <div className="sticky bottom-0 z-[3] flex justify-end gap-3 bg-white pt-3">
        <button
          onClick={() => setSelected(new Set(initialIds))}
          disabled={!isDirty || isSaving}
          className="text-sm font-semibold border border-[#DDDDDD] text-[#141414] px-5 py-2.5 rounded-lg hover:border-[#141414] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Descartar
        </button>
        <button
          onClick={() => onSave(Array.from(selected))}
          disabled={!isDirty || isSaving}
          className="text-sm font-semibold bg-[#141414] text-white px-5 py-2.5 rounded-lg hover:bg-[#333333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}
