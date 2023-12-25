import PostMessage from "../models/postMessage.js";
import mongoose from 'mongoose';

export const getPost = async(req,res) =>{
    const { id } = req.params;
    try{
        const post = await PostMessage.findById(id);
        
        res.status(404).json(post);
    }
    catch(error){
        res.status(404).json({message: error.message});
    }
}
export const getPosts = async(req,res) =>{
    const {page} = req.query;
    try{
        const LIMIT = 4;
        const startIndex = (Number(page) - 1)*LIMIT;
        const total = await PostMessage.countDocuments({});

        const posts = await PostMessage.find().sort({_id: -1}).limit(LIMIT).skip(startIndex);

        // const postMessages = await PostMessage.find();

        res.status(200).json({data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total/LIMIT)});
    }
    catch(error){
        res.status(404).json({message: error.message});
    }
          
}
// QUERY -> /posts?page=1 -> page = 1
// PARAMS -> /posts/123 -> id=123

export const getPostsBySearch = async(req,res) =>{
    
    const {searchQuery, tags} = req.query
    try{
        const title = new RegExp(searchQuery, 'i');

        const posts = await PostMessage.find({ $or: [{title},{tags: {$in: tags.split(',')}}]});

        res.json({data: posts});
        
    }
    catch(error){
        res.status(404).json({message: error.message})
    }
}

export const createPost = async(req,res) =>{
    const post = req.body;

    const newPost = new PostMessage({...post, creator: req.userId, createAt: new Date().toISOString()});
    try{
        await newPost.save();

        res.status(201).json(newPost);
    }
    catch(error){
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async(req,res) =>{
    const { id: _id} = req.params;
    const post = req.body;

    if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('no post with that id');

   const updatedPost = await PostMessage.findByIdAndUpdate(_id, {...post, _id}, { new: true });

   res.json(updatedPost);

}

export const deletePost = async(req,res) => {

    const { id } = req.params;


    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('no post with that id');

    await PostMessage.deleteOne({_id: id});

    res.json({message: 'Post detected successfully'});
}

export const likePost = async(req,res) => {
    const { id } = req.params;

    if(!req.userId) return res.json({ message: 'unauthenticated'});

    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send('no post with that id');

    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if(index === -1){
        post.likes.push(req.userId);
    }
    else{
        post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatePost = await PostMessage.findByIdAndUpdate(id, post, {new: true})

    res.json(updatePost);


}

