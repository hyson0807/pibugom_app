import { api } from "./api";
import type { User } from "@/stores/useAuthStore";

export const userApi = {
  getMe: () => api.get<User>("/users/me").then((r) => r.data),

  updateProfile: (formData: FormData) =>
    api
      .patch<User>("/users/me", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data),

  deleteAccount: () => api.delete("/users/me").then((r) => r.data),

  blockUser: (targetUserId: string) =>
    api.post<{ blocked: boolean }>(`/users/block/${targetUserId}`).then((r) => r.data),

  getBlockedUsers: () =>
    api
      .get<
        { id: string; nickname: string | null; profileImage: string | null; blockedAt: string }[]
      >("/users/blocked")
      .then((r) => r.data),
};
