import express from 'express';
import {getPostsBySearch, getPosts, getPost, createPost, updatePost, deletePost, likePost, commentPost} from '../controllers/posts.js';
import auth from '../middleware/auth.js';
import Upload from '../middleware/multer.js';



const router = express.Router();

router.get('/', getPosts);
router.get('/search', getPostsBySearch);
router.get('/:id', getPost);
router.post('/', Upload, auth, createPost);
router.patch('/:id', Upload, auth, updatePost);
router.delete('/:id', auth, deletePost);
router.patch('/:id/likePost', auth, likePost);
router.post('/:id/commentPost', auth, commentPost)



export default router;