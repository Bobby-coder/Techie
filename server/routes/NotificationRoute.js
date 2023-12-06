import express from "express";
import { verifyJWT } from "../middleware/auth.js";
import {
  getAllNotificationsCount,
  getNewNotification,
  getNotifications,
} from "../controllers/NotificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/new-notifications", verifyJWT, getNewNotification);

notificationRouter.post("/notifications", verifyJWT, getNotifications);

notificationRouter.post(
  "/all-notification-count",
  verifyJWT,
  getAllNotificationsCount
);

export default notificationRouter;
