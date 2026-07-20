import { ObjectId, Filter, Sort } from "mongodb";
import { getDb } from "../database/connection.js";
import { Task, TaskQuery, StatsResponse, TaskPriority } from "../interfaces/task.interface.js";

interface TaskStats {
  totalTasks: number;
  todo: number;
  inProgress: number;
  completed: number;
}

export class TaskService {
  private static getCollection() {
    return getDb().collection<Task>("tasks");
  }

  /**
   * Fetches tasks matching search, filter, sort, and pagination criteria.
   */
  static async getAll(query: TaskQuery): Promise<{ tasks: Task[]; total: number }> {
    const { search, category, priority, sortBy = "latest", page = "1", limit = "12" } = query;
    const filter: Filter<Task> = {};

    // 1. Search Query (Case-insensitive across title, summary, and description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { summary: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 2. Category Filter
    if (category && category !== "all") {
      filter.category = category;
    }

    // 3. Priority Filter
    if (priority && priority !== "all") {
      filter.priority = priority as TaskPriority;
    }

    // 4. Sorting (Use createdAt instead of dueDate for latest/oldest)
    let sort: Sort = { createdAt: -1 };
    if (sortBy === "oldest") {
      sort = { createdAt: 1 };
    }

    const currentPage = Math.max(1, Number(page) || 1);
    const perPage = Math.max(1, Number(limit) || 12);
    const collection = this.getCollection();

    const tasks = await collection
      .find(filter)
      .sort(sort)
      .skip((currentPage - 1) * perPage)
      .limit(perPage)
      .toArray();

    const total = await collection.countDocuments(filter);

    return { tasks, total };
  }

  /**
   * Fetches a single task by its database ID.
   */
  static async getById(id: string): Promise<Task | null> {
    return await this.getCollection().findOne({ _id: new ObjectId(id) });
  }

  /**
   * Creates a new task in the database.
   */
  static async create(taskData: Task): Promise<Task> {
    const now = new Date();
    const newTask: Task = {
      ...taskData,
      createdAt: now,
      updatedAt: now,
    };

    const result = await this.getCollection().insertOne(newTask);
    return {
      ...newTask,
      _id: result.insertedId,
    };
  }

  /**
   * Patches a task in the database.
   */
  static async update(id: string, updates: Partial<Task>): Promise<Task | null> {
    const now = new Date();
    const result = await this.getCollection().findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: now,
        },
      },
      { returnDocument: "after" }
    );

    return result;
  }

  /**
   * Deletes a task from the database.
   */
  static async delete(id: string): Promise<boolean> {
    const result = await this.getCollection().deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  /**
   * Computes statistics for tasks count aggregated by status.
   */
  static async getStats(): Promise<StatsResponse> {
    const pipeline = [
      {
        $group: {
          _id: null,
          totalTasks: { $sum: 1 },
          todo: {
            $sum: {
              $cond: [{ $eq: ["$status", "todo"] }, 1, 0],
            },
          },
          inProgress: {
            $sum: {
              $cond: [{ $eq: ["$status", "in-progress"] }, 1, 0],
            },
          },
          completed: {
            $sum: {
              $cond: [{ $eq: ["$status", "completed"] }, 1, 0],
            },
          },
        },
      },
    ];

    const statsResult = await this.getCollection().aggregate(pipeline).toArray();

    if (statsResult.length === 0) {
      return {
        totalTasks: 0,
        todo: 0,
        inProgress: 0,
        completed: 0,
      };
    }

    const rawStats = statsResult[0] as unknown as TaskStats;
    return {
      totalTasks: rawStats.totalTasks || 0,
      todo: rawStats.todo || 0,
      inProgress: rawStats.inProgress || 0,
      completed: rawStats.completed || 0,
    };
  }
}
