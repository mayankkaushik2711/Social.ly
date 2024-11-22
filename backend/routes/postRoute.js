import express from "express";
import { createPost, deletePost, getAllPost, getPostById, getUserPost } from "../controllers/postController.js";
import { isAuthenticated } from "../middleware/auth.js";

const postRouter = express.Router();

postRouter.post("/create", isAuthenticated, createPost);
postRouter.get("/getUserPost" , isAuthenticated , getUserPost)
postRouter.get("/getPostById/:id", isAuthenticated , getPostById)
postRouter.get("/getAllPosts" , isAuthenticated , getAllPost)
postRouter.delete("/deletePost/:id" , isAuthenticated , deletePost )

export default postRouter;