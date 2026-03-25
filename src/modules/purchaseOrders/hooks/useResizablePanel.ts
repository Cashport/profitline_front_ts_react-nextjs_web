import { useState, useRef, useCallback, useEffect } from "react";

export function useResizablePanel() {
  const [pdfWidth, setPdfWidth] = useState(50);
  const [isPdfCollapsed, setIsPdfCollapsed] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((containerRect.right - e.clientX) / containerRect.width) * 100;

      const constrainedWidth = Math.max(20, Math.min(70, newWidth));

      if (constrainedWidth < 25) {
        setIsPdfCollapsed(true);
      } else {
        setIsPdfCollapsed(false);
        setPdfWidth(constrainedWidth);
      }
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const expandPdf = () => {
    setIsPdfCollapsed(false);
    setPdfWidth(40);
  };

  const collapsePdf = () => {
    setIsPdfCollapsed(true);
  };

  return {
    pdfWidth,
    isPdfCollapsed,
    containerRef,
    handleMouseDown,
    expandPdf,
    collapsePdf
  };
}
