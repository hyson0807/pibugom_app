import { api } from "./api";

export interface Question {
  id: string;
  userId: string;
  title: string;
  content: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; nickname: string | null; profileImage: string | null };
  _count?: { answers: number };
  answers?: Answer[];
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: { id: string; nickname: string | null; profileImage: string | null };
}

export interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  totalPages: number;
}

export const questionApi = {
  create: (data: { title: string; content: string; category: string }) =>
    api.post<Question>("/questions", data).then((r) => r.data),

  getAll: (params?: { page?: number; limit?: number; category?: string }) =>
    api.get<QuestionsResponse>("/questions", { params }).then((r) => r.data),

  getMy: (params?: { page?: number; limit?: number }) =>
    api.get<QuestionsResponse>("/questions/my", { params }).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Question>(`/questions/${id}`).then((r) => r.data),

  update: (
    id: string,
    data: { title?: string; content?: string; category?: string }
  ) => api.patch<Question>(`/questions/${id}`, data).then((r) => r.data),

  delete: (id: string) => api.delete(`/questions/${id}`).then((r) => r.data),

  createAnswer: (questionId: string, content: string) =>
    api
      .post<Answer>(`/questions/${questionId}/answers`, { content })
      .then((r) => r.data),
};
