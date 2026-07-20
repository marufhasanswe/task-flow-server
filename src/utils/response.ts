import { Response } from "express";
import { ApiResponse, PaginatedApiResponse, PaginationInfo } from "../interfaces/task.interface.js";

export function sendSuccess<T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200
): void {
  const responseBody: ApiResponse<T> = {
    success: true,
    message,
    data,
  };
  res.status(statusCode).json(responseBody);
}

export function sendPaginatedSuccess<T>(
  res: Response,
  message: string,
  data: T[],
  pagination: PaginationInfo,
  statusCode = 200
): void {
  const responseBody: PaginatedApiResponse<T> = {
    success: true,
    message,
    data,
    pagination,
  };
  res.status(statusCode).json(responseBody);
}
