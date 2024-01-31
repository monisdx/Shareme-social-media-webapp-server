import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from '../models/user.js';
import axios from 'axios';

export const signin = async(req,res) => {
    const { email, password} = req.body;

    try {
        const existinguser = await User.findOne({email});

        if(!existinguser) return res.status(404).json({ message: "user doesn't exit"});

        const ispasswordcorrect = await bcrypt.compare(password,existinguser.password);
        
        if(!ispasswordcorrect) return res.status(400).json({ message: "invalid credensials"});

        const token = jwt.sign({email: existinguser.email, id: existinguser._id}, 'test', {expiresIn: '1h'});

        res.status(200).json({result: existinguser,token});
    }
    catch(error){
        res.status(500).json({message: 'something went wrong'})
        console.log(error)
    }
}

export const signup = async(req,res) => {
    const { email, password, confirmpassword, name} = req.body;

    try{
        const existinguser = await User.findOne({email});

        if(existinguser) return res.status(400).json({ message: "user already exit"});
        
        if(password !== confirmpassword) return res.status(400).json({ message: "password doesn't matched"});

        const hashPassword = await bcrypt.hash(password,12);
        
        const result = await User.create({ email, password: hashPassword, name})

        const token = jwt.sign({email: result.email, id: result._id}, 'test', {expiresIn: '1h'});

        res.status(200).json({result, token});
    }
    catch(error){
        res.status(500).json({message: 'something went wrong'})
        console.log(error);
    }
}

export const googleoauth = async(req,res) => {
    const {googletoken} = req.body;

    const user = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo",{
        headers: { Authorization: `Bearer ${googletoken}`}
    }).then(async res => res.data);

    const name = user.name;
    const email = user.email;
    const picture = user.picture;

    try{

    const existinguser = await User.findOne({email});

    if(!existinguser){
        const result = await User.create({email,name,picture});

        const token = jwt.sign({email:result.email ,id: result._id}, 'test', {expiresIn: '1h'});

        res.status(201).json({result, token});
    }
    else{
        const token = jwt.sign({email:existinguser.email ,id: existinguser._id}, 'test', {expiresIn: '1h'});

        res.status(200).json({result:existinguser, token});

    }
}
catch(error){
    res.status(500).json({message: 'something went wrong'})
    console.log(error);
}




}