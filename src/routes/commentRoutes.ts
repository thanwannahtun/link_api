import { Router } from "express";
import { addComment, getCommentsByPostId, updateComment } from "../controllers/commentController.js";

const router = Router();

// router.post('/');

// ? Endpoint to add a comment
router.post('/:post_id/users/:user_id', addComment)

// ? Endpoint to update a comment 
router.patch('/:comment_id/posts/:post_id/users/:user_id', updateComment);

// ? Find Comments By post ID
router.post('/posts/:post_id', getCommentsByPostId);

export default router;