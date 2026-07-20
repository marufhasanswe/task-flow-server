import { ObjectId } from "mongodb";

export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "in-progress" | "completed";

export interface Task {
  _id?: ObjectId;
  title: string;
  summary: string;
  description: string;
  category: string;
  priority: TaskPriority;
  initialStatus: TaskStatus;
  status?: TaskStatus;
  imageUrl?: string;
  dueDate: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface TaskQuery {
  search?: string;
  category?: string;
  priority?: string;
  sortBy?: "latest" | "oldest";
  page?: string;
  limit?: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  totalPages: number;
  limit: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationInfo;
}

export interface StatsResponse {
  totalTasks: number;
  todo: number;
  inProgress: number;
  completed: number;
}
