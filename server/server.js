import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { connectDB } from "./config/db.js";
import { ErrorMiddleware } from "./middleware/error.js";
import serviceAccount from "./techie-612-firebase-adminsdk-usrj9-e2661084a1.json" assert { type: "json" };
import userRouter from "./routes/UserRoute.js";
import notificationRouter from "./routes/NotificationRoute.js";
import blogRouter from "./routes/BlogRoute.js";

// Load env variables
dotenv.config();

// express app
const server = express();

// Start listening to app
server.listen(process.env.PORT, () => {
  console.log(`Server started at ${process.env.PORT}`);
  connectDB();
});

// middlewares
server.use(express.json()); // enable JSON sharing
server.use(
  cors({
    credentials: true,
    origin: "https://techie-blogs.vercel.app",
  })
);

// routes
server.use("/api/v1", userRouter, blogRouter, notificationRouter);

// Test route
server.get("/test", (req, res, next) => {
  return res.status(200).json({
    success: true,
    message: "Test route",
  });
});

// Unknown route
server.all("*", (req, res, next) => {
  const err = new Error(`Route ${req.originalUrl} not found`);
  err.statusCode = 404;
  next(err);
});

// initializing the firebase
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

server.use(ErrorMiddleware); // error middleware
