

import { Router } from 'express';
import { insertPost, getPosts, likePost, getPostById, getLikesForPost } from '../controllers/postController.js';

const router = Router();

// ? : get posts with limit query of default to 20
router.get('/', getPosts);

// ? : create a new post
router.post('/', insertPost);

// ? : Handler to toggle like on a post
router.post('/:post_id/likes/:user_id', likePost);

// ? Endpoint to get users who liked a post
router.post('/:post_id/likes', getLikesForPost)

// ? : Find Single Post By Post _id
router.post('/:post_id', getPostById)


export default router;
