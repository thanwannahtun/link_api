

import { Router } from 'express';
import { insertPost, getPosts, likePost, getPostById, getLikesForPost, addComment, updateComment, getCommentsByPostId } from '../controllers/postController.js';

const router = Router();

// ? : get posts with limit query of default to 20
router.get('/', getPosts);

// ? : create a new post
router.post('/', insertPost);

// ? : [likes] update likeCounts of a post ( like || unlike )
router.post('/:post_id/likes/:user_id', likePost); // ! uncomplete code ( fix later )

// ? Endpoint to get users who liked a post
router.post('/:post_id/likes', getLikesForPost)

// ? : Find Single Post By Post _id
router.post('/:post_id', getPostById)

// ? Endpoint to add a comment
router.post('/:post_id/users/:user_id/comments', addComment)

// ? Endpoint to update a comment 
router.patch('/:post_id/users/:user_id/comments/:comment_id', updateComment) // ! uncomplete code

// ? Find Comments By post ID
router.post('/:post_id/comments', getCommentsByPostId);

export default router;
