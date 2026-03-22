import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  questionApi,
  type QuestionsResponse,
} from "@/services/questionApi";

const getNextPageParam = (lastPage: QuestionsResponse) =>
  lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;

export function useQuestions(category: string) {
  return useInfiniteQuery({
    queryKey: ["questions", category],
    queryFn: ({ pageParam }) =>
      questionApi.getAll({
        page: pageParam,
        limit: 20,
        ...(category !== "전체" && { category }),
      }),
    initialPageParam: 1,
    getNextPageParam,
  });
}

export function useMyQuestions() {
  return useInfiniteQuery({
    queryKey: ["myQuestions"],
    queryFn: ({ pageParam }) =>
      questionApi.getMy({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam,
  });
}

export function useMyAnswers() {
  return useInfiniteQuery({
    queryKey: ["myAnswers"],
    queryFn: ({ pageParam }) =>
      questionApi.getMyAnswers({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam,
  });
}

export function useQuestion(id: string) {
  return useQuery({
    queryKey: ["question", id],
    queryFn: () => questionApi.getOne(id),
    enabled: !!id,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; content: string; category: string }) =>
      questionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
    },
  });
}

export function useUpdateQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; content?: string; category?: string };
    }) => questionApi.update(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["question", variables.id],
      });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
    },
  });
}

export function useDeleteQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => questionApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
    },
  });
}

export function useCreateAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      content,
      parentId,
    }: {
      questionId: string;
      content: string;
      parentId?: string;
    }) => questionApi.createAnswer(questionId, content, parentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["question", variables.questionId],
      });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["myQuestions"] });
      queryClient.invalidateQueries({ queryKey: ["myAnswers"] });
    },
  });
}

export function useDeleteAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
    }: {
      questionId: string;
      answerId: string;
    }) => questionApi.deleteAnswer(questionId, answerId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["question", variables.questionId],
      });
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["myAnswers"] });
    },
  });
}
