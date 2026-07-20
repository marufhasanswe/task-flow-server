import { ObjectId } from "mongodb";
import { Task, TaskPriority, TaskStatus } from "../interfaces/task.interface.js";

export interface ValidationResult<T> {
  error?: string;
  value?: T;
}

/**
 * Validates whether a string is a valid MongoDB 24-character hexadecimal ObjectId.
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Validates request payload for creating a Task.
 */
export function validateCreateTask(body: unknown): ValidationResult<Task> {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a valid JSON object." };
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];

  const requiredFields = ["title", "summary", "description", "category", "priority", "initialStatus", "dueDate"];
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === "") {
      errors.push(`Field '${field}' is required and cannot be empty.`);
    }
  }

  if (errors.length > 0) {
    return { error: errors.join(" ") };
  }

  const title = String(data.title).trim();
  const summary = String(data.summary).trim();
  const description = String(data.description).trim();
  const category = String(data.category).trim();
  const priority = String(data.priority).trim();
  const initialStatus = String(data.initialStatus).trim();
  const dueDate = String(data.dueDate).trim();
  const imageUrl = data.imageUrl !== undefined && data.imageUrl !== null ? String(data.imageUrl).trim() : undefined;

  if (title.length === 0) errors.push("title cannot be empty.");
  if (summary.length === 0) errors.push("summary cannot be empty.");
  if (description.length === 0) errors.push("description cannot be empty.");
  if (category.length === 0) errors.push("category cannot be empty.");

  if (priority !== "low" && priority !== "medium" && priority !== "high") {
    errors.push("priority must be 'low', 'medium', or 'high'.");
  }

  if (initialStatus !== "todo" && initialStatus !== "in-progress" && initialStatus !== "completed") {
    errors.push("initialStatus must be 'todo', 'in-progress', or 'completed'.");
  }

  if (isNaN(Date.parse(dueDate))) {
    errors.push("dueDate must be a valid date string.");
  }

  if (errors.length > 0) {
    return { error: errors.join(" ") };
  }

  return {
    value: {
      title,
      summary,
      description,
      category,
      priority: priority as TaskPriority,
      initialStatus: initialStatus as TaskStatus,
      status: initialStatus as TaskStatus, // Store both field values consistently
      imageUrl,
      dueDate,
    }
  };
}

/**
 * Validates request payload for updating a Task.
 */
export function validateUpdateTask(body: unknown): ValidationResult<Partial<Task>> {
  if (!body || typeof body !== "object") {
    return { error: "Request body must be a valid JSON object." };
  }

  const data = body as Record<string, unknown>;
  const errors: string[] = [];
  const updates: Partial<Task> = {};

  if (data.title !== undefined) {
    const title = String(data.title).trim();
    if (title.length === 0) errors.push("title cannot be empty.");
    updates.title = title;
  }

  if (data.summary !== undefined) {
    const summary = String(data.summary).trim();
    if (summary.length === 0) errors.push("summary cannot be empty.");
    updates.summary = summary;
  }

  if (data.description !== undefined) {
    const description = String(data.description).trim();
    if (description.length === 0) errors.push("description cannot be empty.");
    updates.description = description;
  }

  if (data.category !== undefined) {
    const category = String(data.category).trim();
    if (category.length === 0) errors.push("category cannot be empty.");
    updates.category = category;
  }

  if (data.priority !== undefined) {
    const priority = String(data.priority).trim();
    if (priority !== "low" && priority !== "medium" && priority !== "high") {
      errors.push("priority must be 'low', 'medium', or 'high'.");
    } else {
      updates.priority = priority as TaskPriority;
    }
  }

  if (data.status !== undefined) {
    const status = String(data.status).trim();
    if (status !== "todo" && status !== "in-progress" && status !== "completed") {
      errors.push("status must be 'todo', 'in-progress', or 'completed'.");
    } else {
      updates.status = status as TaskStatus;
    }
  }

  if (data.dueDate !== undefined) {
    const dueDate = String(data.dueDate).trim();
    if (isNaN(Date.parse(dueDate))) {
      errors.push("dueDate must be a valid date string.");
    } else {
      updates.dueDate = dueDate;
    }
  }

  if (data.imageUrl !== undefined) {
    updates.imageUrl = data.imageUrl !== null ? String(data.imageUrl).trim() : undefined;
  }

  const allowedFields = ["title", "summary", "description", "category", "priority", "status", "dueDate", "imageUrl"];
  const inputFields = Object.keys(data);
  const extraFields = inputFields.filter(f => !allowedFields.includes(f));
  if (extraFields.length > 0) {
    errors.push(`Fields [${extraFields.join(", ")}] are not allowed to be updated.`);
  }

  if (inputFields.length === 0) {
    errors.push("At least one field to update must be provided.");
  }

  if (errors.length > 0) {
    return { error: errors.join(" ") };
  }

  return { value: updates };
}
