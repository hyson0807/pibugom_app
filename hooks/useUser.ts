import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { userApi } from "@/services/userApi";

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: (formData: FormData) => userApi.updateProfile(formData),
    onSuccess: (data) => {
      setUser(data);
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();
  const logout = useAuthStore((s) => s.logout);
  return useMutation({
    mutationFn: () => userApi.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      logout();
    },
  });
}

export function useBlockedUsers() {
  return useQuery({
    queryKey: ["blockedUsers"],
    queryFn: () => userApi.getBlockedUsers(),
  });
}

export function useBlockUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (targetUserId: string) => userApi.blockUser(targetUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["question"] });
      queryClient.invalidateQueries({ queryKey: ["myAnswers"] });
      queryClient.invalidateQueries({ queryKey: ["blockedUsers"] });
    },
  });
}
