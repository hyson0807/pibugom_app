import { api } from "./api";
import { appendImageToFormData, type CompressedImage } from "@/utils/imageUpload";

export interface QuestionImage {
  id: string;
  questionId: string;
  imageUrl: string;
  order: number;
}

export interface Question {
  id: string;
  userId: string;
  title: string;
  content: string;
  categories: string[];
  isAnonymous?: boolean;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; nickname: string | null; profileImage: string | null };
  _count?: { answers: number };
  answers?: Answer[];
  answerCount?: number;
  isBookmarked?: boolean;
  images?: QuestionImage[];
}

export interface Answer {
  id: string;
  questionId: string;
  userId: string;
  content: string;
  parentId: string | null;
  deletedAt: string | null;
  createdAt: string;
  user: { id: string; nickname: string | null; profileImage: string | null };
  replies?: Answer[];
}

export interface QuestionsResponse {
  questions: Question[];
  total: number;
  page: number;
  totalPages: number;
}

export const questionApi = {
  create: (data: {
    title: string;
    content: string;
    categories: string[];
    images?: CompressedImage[];
    isAnonymous?: boolean;
  }) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("content", data.content);
    formData.append("isAnonymous", String(data.isAnonymous));
    data.categories.forEach((cat) => formData.append("categories", cat));
    if (data.images) {
      data.images.forEach((img) => {
        appendImageToFormData(formData, "images", img);
      });
    }
    return api
      .post<Question>("/questions", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30_000,
      })
      .then((r) => r.data);
  },

  getAll: (params?: { page?: number; limit?: number; category?: string; search?: string; period?: string }) =>
    api.get<QuestionsResponse>("/questions", { params }).then((r) => r.data),

  getMy: (params?: { page?: number; limit?: number }) =>
    api.get<QuestionsResponse>("/questions/my", { params }).then((r) => r.data),

  getMyAnswers: (params?: { page?: number; limit?: number }) =>
    api.get<QuestionsResponse>("/questions/my-answers", { params }).then((r) => r.data),

  getMyBookmarks: (params?: { page?: number; limit?: number }) =>
    api.get<QuestionsResponse>("/questions/my-bookmarks", { params }).then((r) => r.data),

  toggleBookmark: (questionId: string) =>
    api.post<{ bookmarked: boolean }>(`/questions/${questionId}/bookmark`).then((r) => r.data),

  getOne: (id: string) =>
    api.get<Question>(`/questions/${id}`).then((r) => r.data),

  update: (
    id: string,
    data: {
      title?: string;
      content?: string;
      categories?: string[];
      newImages?: CompressedImage[];
      deleteImageIds?: string[];
    }
  ) => {
    const formData = new FormData();
    if (data.title !== undefined) formData.append("title", data.title);
    if (data.content !== undefined) formData.append("content", data.content);
    if (data.categories !== undefined) data.categories.forEach((cat) => formData.append("categories", cat));
    if (data.deleteImageIds) {
      data.deleteImageIds.forEach((imgId) => {
        formData.append("deleteImageIds", imgId);
      });
    }
    if (data.newImages) {
      data.newImages.forEach((img) => {
        appendImageToFormData(formData, "images", img);
      });
    }
    return api
      .patch<Question>(`/questions/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 30_000,
      })
      .then((r) => r.data);
  },

  delete: (id: string) => api.delete(`/questions/${id}`).then((r) => r.data),

  createAnswer: (questionId: string, content: string, parentId?: string) =>
    api
      .post<Answer>(`/questions/${questionId}/answers`, { content, parentId })
      .then((r) => r.data),

  deleteAnswer: (questionId: string, answerId: string) =>
    api
      .delete(`/questions/${questionId}/answers/${answerId}`)
      .then((r) => r.data),
};
