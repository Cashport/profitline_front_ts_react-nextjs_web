import React, { FC } from "react";
import { CaretLeft, CaretRight } from "phosphor-react";
import styles from "./pagination.module.scss";

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Number of items per page */
  pageSize: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Maximum number of page buttons to show (default: 5) */
  maxVisiblePages?: number;
  /** Additional CSS class name */
  className?: string;
  /** Show "Mostrando X a Y de Z resultados" text (default: true) */
  showResultsText?: boolean;
  /** Disable pagination during loading */
  isLoading?: boolean;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  maxVisiblePages = 5,
  className,
  showResultsText = true,
  isLoading = false
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);

  if (totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getVisiblePages = (): number[] => {
    const half = Math.floor(maxVisiblePages / 2);
    const initialStart = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, initialStart + maxVisiblePages - 1);
    const start =
      end - initialStart + 1 < maxVisiblePages
        ? Math.max(1, end - maxVisiblePages + 1)
        : initialStart;

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();

  const handlePrevious = () => {
    if (currentPage > 1 && !isLoading) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages && !isLoading) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  return (
    <div className={`${styles.paginationContainer} ${className || ""}`}>
      {showResultsText && (
        <div className={styles.resultsText}>
          Mostrando {startItem} a {endItem} de {totalItems} resultados
        </div>
      )}

      <div className={styles.paginationControls}>
        <button
          type="button"
          className={`${styles.navButton} ${currentPage === 1 || isLoading ? styles.disabled : ""}`}
          onClick={handlePrevious}
          disabled={currentPage === 1 || isLoading}
        >
          <CaretLeft weight="bold" />
          Anterior
        </button>

        <div className={styles.pageNumbers}>
          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              className={`${styles.pageButton} ${currentPage === page ? styles.active : ""}`}
              onClick={() => handlePageClick(page)}
              disabled={isLoading}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          type="button"
          className={`${styles.navButton} ${currentPage === totalPages || isLoading ? styles.disabled : ""}`}
          onClick={handleNext}
          disabled={currentPage === totalPages || isLoading}
        >
          Siguiente
          <CaretRight weight="bold" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
