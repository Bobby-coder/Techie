import express from "express";
import {
  addComment,
  createBlog,
  deleteBlog,
  deleteComment,
  getAccountInfo,
  getBlog,
  getBlogComment,
  getBlogCommentCount,
  getLatestBlogCount,
  getLatestBlogs,
  getReplies,
  getTrendingBlogs,
  getUserWriitenBlog,
  isLikedByUser,
  likeBlog,
  searchBlogs,
  searchBlogsCount,
  searchUsers,
} from "../controllers/BlogController.js";
import { verifyJWT } from "../middleware/auth.js";

const blogRouter = express.Router();

blogRouter.post("/create-blog", verifyJWT, createBlog);

blogRouter.post("/search-blogs", searchBlogs);

blogRouter.post("/search-blogs-count", searchBlogsCount);

blogRouter.post("/search-users", searchUsers);

blogRouter.get("/trending-blogs", getTrendingBlogs);

blogRouter.post("/latest-blogs", getLatestBlogs);

blogRouter.post("/all-latest-blogs-count", getLatestBlogCount);

blogRouter.post("/get-blog", getBlog);

blogRouter.post("/like-blog", verifyJWT, likeBlog);

blogRouter.post("/isliked-by-user", verifyJWT, isLikedByUser);

blogRouter.post("/add-comment", verifyJWT, addComment);

blogRouter.post("/get-blog-comments", getBlogComment);

blogRouter.post("/get-blog-comments-count", getBlogCommentCount);

blogRouter.post("/get-replies", getReplies);

blogRouter.post("/delete-comment", verifyJWT, deleteComment);

blogRouter.get("/account-info", verifyJWT, getAccountInfo);

blogRouter.post("/user-written-blogs", verifyJWT, getUserWriitenBlog);

blogRouter.post("/user-written-blogs-count", verifyJWT, getTrendingBlogs);

blogRouter.post("/delete-blog", verifyJWT, deleteBlog);

export default blogRouter;
