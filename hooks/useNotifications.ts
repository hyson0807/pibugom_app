import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { notificationApi } from "@/services/notificationApi";
import { getNextPageParam } from "@/hooks/useQuestions";
import { useAuthStore } from "@/stores/useAuthStore";

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: ["notifications"],
    queryFn: ({ pageParam }) =>
      notificationApi.getAll({ page: pageParam, limit: 20 }),
    initialPageParam: 1,
    getNextPageParam,
  });
}

export function useUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 30_000,
    enabled: isAuthenticated,
  });
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
