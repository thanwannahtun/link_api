

import { Router } from 'express';
import { getPosts, likePost, getPostById, getLikesForPost, insertPostMe } from '../controllers/postController.js';
import { uploadFormData } from '../middlewares/multer.js';

const router = Router();

// ? : get posts with limit query of default to 15
router.get('/', getPosts);

// ? : create a new post
// router.post('/', uploadPostImages, insertPost);
router.post('/', uploadFormData, insertPostMe);

// ? : Handler to toggle like on a post
router.post('/:post_id/likes/:user_id', likePost);

// ? Endpoint to get users who liked a post
router.post('/:post_id/likes', getLikesForPost)

// ? : Find Single Post By Post _id
router.post('/:post_id', getPostById)


export default router;
