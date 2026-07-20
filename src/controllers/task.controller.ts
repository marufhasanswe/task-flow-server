import { Request, Response } from "express";
import { TaskService } from "../services/task.service.js";
import { sendSuccess, sendPaginatedSuccess } from "../utils/response.js";
import { isValidObjectId, validateCreateTask, validateUpdateTask } from "../utils/validation.js";
import { AppError } from "../utils/AppError.js";
import { TaskQuery } from "../interfaces/task.interface.js";

export class TaskController {
  static getAll = async (req: Request, res: Response): Promise<void> => {
    const query = req.query as unknown as TaskQuery;
    const { tasks, total } = await TaskService.getAll(query);
    
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Number(query.limit) || 12);
    
    sendPaginatedSuccess(
      res,
      "Tasks fetched successfully",
      tasks,
      {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      }
    );
  };

  static getById = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    
    if (!isValidObjectId(id)) {
      throw new AppError("Invalid ObjectId format.", 400);
    }
    
    const task = await TaskService.getById(id);
    if (!task) {
      throw new AppError("Task not found.", 404);
    }
    
    sendSuccess(res, "Task fetched successfully", task);
  };

  static create = async (req: Request, res: Response): Promise<void> => {
    const validation = validateCreateTask(req.body);
    if (validation.error || !validation.value) {
      throw new AppError(validation.error || "Validation failed", 400);
    }
    
    const createdTask = await TaskService.create(validation.value);
    sendSuccess(res, "Task created successfully", createdTask, 201);
  };

  static update = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    
    if (!isValidObjectId(id)) {
      throw new AppError("Invalid ObjectId format.", 400);
    }
    
    const validation = validateUpdateTask(req.body);
    if (validation.error || !validation.value) {
      throw new AppError(validation.error || "Validation failed", 400);
    }
    
    const updatedTask = await TaskService.update(id, validation.value);
    if (!updatedTask) {
      throw new AppError("Task not found.", 404);
    }
    
    sendSuccess(res, "Task updated successfully", updatedTask);
  };

  static delete = async (req: Request, res: Response): Promise<void> => {
    const id = req.params.id as string;
    
    if (!isValidObjectId(id)) {
      throw new AppError("Invalid ObjectId format.", 400);
    }
    
    const deleted = await TaskService.delete(id);
    if (!deleted) {
      throw new AppError("Task not found.", 404);
    }
    
    sendSuccess(res, "Task deleted successfully");
  };

  static getStats = async (req: Request, res: Response): Promise<void> => {
    const stats = await TaskService.getStats();
    sendSuccess(res, "Task statistics fetched successfully", stats);
  };
}
