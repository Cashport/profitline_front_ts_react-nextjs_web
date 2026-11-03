import UiSearchInput from "@/components/ui/search-input/search-input";
import type { SearchFieldSurface } from "@/components/ui/search-field/search-field";
import { useDebounce } from "@/hooks/useSearch";
import React, { useState, useCallback, useEffect } from "react";

interface OptimizedSearchComponentProps {
  // eslint-disable-next-line no-unused-vars
  onSearch: (query: string) => void;
  title?: string;
  /** Fondo sobre el que va (ver SearchField): "page" en el header. */
  surface?: SearchFieldSurface;
  className?: string;
}

const OptimizedSearchComponent: React.FC<OptimizedSearchComponentProps> = ({
  onSearch,
  title,
  surface,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  useEffect(() => {
    onSearch(debouncedSearchQuery);
  }, [debouncedSearchQuery, onSearch]);

  return (
    <UiSearchInput
      placeholder={title ? title : "Buscar cliente"}
      onChange={handleSearch}
      surface={surface}
      className={className}
    />
  );
};

export default OptimizedSearchComponent;
