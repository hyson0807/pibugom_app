import { api } from "./api";

export interface NotificationItem {
  id: string;
  type: "NEW_ANSWER" | "NEW_REPLY";
  questionId: string;
  answerId: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
  actor: { id: string; nickname: string | null; profileImage: string | null };
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  total: number;
  page: number;
  totalPages: number;
}

export const notificationApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api
      .get<NotificationsResponse>("/notifications", { params })
      .then((r) => r.data),

  getUnreadCount: () =>
    api
      .get<{ count: number }>("/notifications/unread-count")
      .then((r) => r.data),

  markAsRead: (id: string) =>
    api.patch(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    api.patch("/notifications/read-all").then((r) => r.data),

  registerPushToken: (token: string) =>
    api.post("/notifications/push-token", { token }).then((r) => r.data),

  removePushToken: (token: string) =>
    api
      .delete("/notifications/push-token", { data: { token } })
      .then((r) => r.data),
};
