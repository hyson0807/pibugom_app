import { useInfiniteQuery } from "@tanstack/react-query";
import { questionApi } from "@/services/questionApi";
import { getNextPageParam } from "@/hooks/useQuestions";

export function useSearchQuestions(search: string, period: string) {
  return useInfiniteQuery({
    queryKey: ["searchQuestions", search, period],
    queryFn: ({ pageParam }) =>
      questionApi.getAll({ page: pageParam, limit: 20, search, period }),
    initialPageParam: 1,
    getNextPageParam,
    enabled: search.length > 0,
  });
}
