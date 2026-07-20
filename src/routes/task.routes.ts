import { Router } from "express";
import { TaskController } from "../controllers/task.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(TaskController.getAll));
router.get("/stats", asyncHandler(TaskController.getStats));
router.get("/:id", asyncHandler(TaskController.getById));
router.post("/", asyncHandler(TaskController.create));
router.patch("/:id", asyncHandler(TaskController.update));
router.delete("/:id", asyncHandler(TaskController.delete));

export default router;
