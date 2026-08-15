import axiosInstance from "./axiosInstance";

// Mirrors the backend's ResData envelope (backend/api/model/models.py).
export interface ResData<T = unknown> {
  status: number;
  msg: string | null;
  data: T | null;
}

export const health = async (): Promise<{ status: string }> => {
  const { data } = await axiosInstance.get("/health");
  return data;
};

export const test = {
  getAll: async (): Promise<ResData> => {
    const { data } = await axiosInstance.get<ResData>("/api/v1/test/view-all");
    return data;
  },
};
