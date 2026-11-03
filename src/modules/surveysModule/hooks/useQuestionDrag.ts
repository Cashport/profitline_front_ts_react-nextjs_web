import { useState, type DragEvent } from "react";

/** Reordenar preguntas arrastrando el asa, con los eventos nativos de HTML5 (sin librería). */
export const useQuestionDrag = (onMove: (id: string, to: number) => void) => {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const reset = () => {
    setDragId(null);
    setOverIndex(null);
  };

  /** Props del asa (⋮⋮) de la pregunta `id`. */
  const handleProps = (id: string) => ({
    draggable: true,
    onDragStart: (e: DragEvent) => {
      e.stopPropagation();
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", id);
      setDragId(id);
    },
    onDragEnd: reset
  });

  /** Props de la zona donde se suelta: la tarjeta `index`, o el final con `index` = total. */
  const dropProps = (index: number) => ({
    onDragOver: (e: DragEvent) => {
      if (!dragId) return;
      e.preventDefault();
      if (overIndex !== index) setOverIndex(index);
    },
    onDrop: (e: DragEvent) => {
      e.preventDefault();
      if (dragId) onMove(dragId, index);
      reset();
    }
  });

  return { dragId, overIndex, handleProps, dropProps };
};
