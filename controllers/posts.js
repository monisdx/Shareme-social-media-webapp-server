import PostMessage from "../models/postMessage.js";
import mongoose from 'mongoose';
import cloudinary from 'cloudinary';
import getDataUri from "../util/dataUrl.js";

export const getPost = async(req,res) =>{
    const { id } = req.params;
    try{
        const post = await PostMessage.findById(id);

        res.status(200).json(post);
    }
    catch(error){
        res.status(404).json({message: error.message});
    }
}
export const getPosts = async(req,res) =>{
    const {page} = req.query;
    
    try{
    
        const LIMIT = 6;
        const startIndex = (Number(page) - 1)*LIMIT;
        const total = await PostMessage.countDocuments({});

        const posts = await PostMessage.find().sort({_id: -1}).limit(LIMIT).skip(startIndex);

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
    const {title, message, tags, name} = req.body;
    const file = req.file;
   
    let mycloud;

    if(file){
       const fileUri = getDataUri(file);
       mycloud = await cloudinary.v2.uploader.upload(fileUri.content); 
    }

    const newPost = new PostMessage({title, message, tags, name, selectedFile: {public_id: mycloud ? mycloud.public_id : '', 
                    url: mycloud ? mycloud.secure_url : ''}, creator: req.userId, createAt: new Date().toISOString()});
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
    const {title, message, tags, name} = req.body;
    const file = req.file;
   
    let mycloud;
    if(file){
       const fileUri = getDataUri(file);
       mycloud = await cloudinary.v2.uploader.upload(fileUri.content); 
    }

    // await cloudinary.v2.uploader.destroy(post.selectedFile.public_id);

    try{
        const post = await PostMessage.findById(_id);
        
        if(!mongoose.Types.ObjectId.isValid(_id)) return res.status(404).send('no post with that id');

        post.title = title; 
        post.message = message;
        post.tags = tags;
        post.name = name;
        post.selectedFile.public_id = mycloud ? mycloud.public_id : post?.selectedFile?.public_id;
        post.selectedFile.url = mycloud ? mycloud.secure_url : post?.selectedFile?.url;

        await post.save();
 
        res.status(200).json(post);
    }
    catch(error){
        res.status(404).json({message: error.message})
    }

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

export const commentPost = async(req,res) =>{
    const { id } = req.params;
    const { username, comment } = req.body;

    try{

    const post = await PostMessage.findById(id);

    post.comments.push({username,comment});
    
    const updatedPost = await PostMessage.findByIdAndUpdate(id,post, {new: true});
    

    res.json(updatedPost);
    }
    catch(error){
        res.status(409).json({ message: error.message });
    }
}