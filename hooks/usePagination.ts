import { useCallback, useEffect, useMemo, useState } from "react";

interface UsePaginationOptions {
  pageSize?: number;
}

export function usePagination<T>(items: T[], { pageSize = 10 }: UsePaginationOptions = {}) {
  const [page, setPage] = useState(1);

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, Math.max(1, totalPages)));
  }, [totalPages]);

  const safePage = Math.min(page, totalPages);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [items, safePage, pageSize]);

  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  const goPrev = useCallback(() => {
    setPage((currentPage) => Math.max(1, currentPage - 1));
  }, []);

  const goNext = useCallback(() => {
    setPage((currentPage) => Math.min(totalPages, currentPage + 1));
  }, [totalPages]);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page: safePage,
    setPage,
    totalPages,
    pageItems,
    total,
    hasPrev,
    hasNext,
    goPrev,
    goNext,
    reset,
  };
}
