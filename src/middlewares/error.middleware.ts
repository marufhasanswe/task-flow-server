import { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";

export function notFoundHandler(req: Request, res: Response, next: NextFunction): void {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
}

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  const isDev = process.env.NODE_ENV !== "production";
  
  let statusCode = 500;
  let message = "Internal Server Error";

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else {
    console.error("❌ [Unhandled Error]:", error);
    if (isDev) {
      message = error.message;
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isDev && { stack: error.stack }),
  });
}
