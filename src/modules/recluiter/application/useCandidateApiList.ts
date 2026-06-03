import { useEffect, useState, useCallback } from "react";
import {
  candidateRepository,
  CandidateApiError,
} from "../infrastructure/CandidateApiRepository";
import type { CandidateApiResponse } from "../domain/types";

export interface UseCandidateApiListReturn {
  candidates: CandidateApiResponse[];
  loading: boolean;
  error: string;
  total: number;
  page: number;
  size: number;
  totalPages: number;
  search: string;
  setSearch: (value: string) => void;
  setPage: (value: number) => void;
  refresh: () => Promise<void>;
}

export function useCandidateApiList(
  pageSize: number = 10,
): UseCandidateApiListReturn {
  const [candidates, setCandidates] = useState<CandidateApiResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [search, setSearch] = useState<string>("");

  const doLoad = useCallback(
    async (pageNum: number, searchTerm: string) => {
      setLoading(true);
      setError("");
      try {
        const result = await candidateRepository.list({
          page: pageNum,
          size: pageSize,
          search: searchTerm.trim() || undefined,
        });
        setCandidates(result.content);
        setTotal(result.totalElements);
        setTotalPages(result.totalPages);
      } catch (err) {
        if (err instanceof CandidateApiError) {
          if (err.status === 403) {
            setError("No tienes permisos para ver candidatos.");
          } else {
            setError(err.message);
          }
        } else {
          setError("No se pudieron cargar los candidatos.");
        }
        setCandidates([]);
      } finally {
        setLoading(false);
      }
    },
    [pageSize],
  );

  useEffect(() => {
    doLoad(page, search);
  }, [page, search, doLoad]);

  const handleSetSearch = useCallback(
    (value: string) => {
      setSearch(value);
      setPage(0);
    },
    [],
  );

  const handleRefresh = useCallback(async () => {
    await doLoad(page, search);
  }, [page, search, doLoad]);

  return {
    candidates,
    loading,
    error,
    total,
    page,
    size: pageSize,
    totalPages,
    search,
    setSearch: handleSetSearch,
    setPage,
    refresh: handleRefresh,
  };
}
