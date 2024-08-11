

import { Router } from 'express';
import { insertPost, getPosts, likePost, getPostByUserId, getPostById, getLikesForPost, addComment, updateComment } from '../controllers/postController.js';



const router = Router();

// ? : get posts with limit query of default to 20
router.get('/', getPosts);

// ? : create a new post
router.post('/', insertPost);

// ? : [likes] update likeCounts of a post ( like || unlike )
router.post('/:post_id/likes/:user_id', likePost); // ! uncomplete code ( fix later )

// ? Endpoint to get users who liked a post
router.post('/:post_id/likes', getLikesForPost)

// ? : Find Post of a User
// router.post('/:user_id',getPostByUserId);// ! uncomplete code ( uncomment and fix it later )

// ? : Find Single Post By Post _id
router.post('/:post_id', getPostById)

// ? Endpoint to add a comment
router.post('/:post_id/comments/users/:user_id', addComment)

// ? Endpoint to update a comment 
router.patch('/:post_id/comments/:comment_id/users/:user_id', updateComment) // ! uncomplete code 

export default router;
