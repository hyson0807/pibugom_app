import {
  InfiniteData,
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  notificationApi,
  NotificationsResponse,
} from "@/services/notificationApi";
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

function snapshotAndUpdate(
  queryClient: QueryClient,
  updateNotifications: (
    old: InfiniteData<NotificationsResponse>
  ) => InfiniteData<NotificationsResponse>,
  updateCount: (old: { count: number }) => { count: number }
) {
  const previousNotifications =
    queryClient.getQueryData<InfiniteData<NotificationsResponse>>([
      "notifications",
    ]);
  const previousCount = queryClient.getQueryData<{ count: number }>([
    "notifications",
    "unread-count",
  ]);

  queryClient.setQueryData<InfiniteData<NotificationsResponse>>(
    ["notifications"],
    (old) => (old ? updateNotifications(old) : old)
  );
  queryClient.setQueryData<{ count: number }>(
    ["notifications", "unread-count"],
    (old) => (old ? updateCount(old) : old)
  );

  return { previousNotifications, previousCount };
}

function rollback(
  queryClient: QueryClient,
  context?: {
    previousNotifications?: InfiniteData<NotificationsResponse>;
    previousCount?: { count: number };
  }
) {
  if (context?.previousNotifications) {
    queryClient.setQueryData(["notifications"], context.previousNotifications);
  }
  if (context?.previousCount) {
    queryClient.setQueryData(
      ["notifications", "unread-count"],
      context.previousCount
    );
  }
}

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationApi.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      return snapshotAndUpdate(
        queryClient,
        (old) => ({
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) =>
              n.id === id ? { ...n, isRead: true } : n
            ),
          })),
        }),
        (old) => (old.count > 0 ? { count: old.count - 1 } : old)
      );
    },
    onError: (_err, _id, context) => rollback(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["notifications"] });
      return snapshotAndUpdate(
        queryClient,
        (old) => ({
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            notifications: page.notifications.map((n) => ({
              ...n,
              isRead: true,
            })),
          })),
        }),
        () => ({ count: 0 })
      );
    },
    onError: (_err, _vars, context) => rollback(queryClient, context),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
