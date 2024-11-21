import express from "express";
import { createPost } from "../controllers/postController.js";
import { isAuthenticated } from "../middleware/auth.js";

const postRouter = express.Router();

postRouter.post("/create" , isAuthenticated ,createPost);

export default postRouter;