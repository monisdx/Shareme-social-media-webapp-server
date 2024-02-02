import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import dotenv from 'dotenv';

const app = express();
dotenv.config();


app.use(bodyParser.json({limit: "30mb", extended: true}));      //properly send a request. This body-parser module parses the JSON, buffer, string and URL encoded data submitted using HTTP POST request.
app.use(bodyParser.urlencoded({limit: "30mb", extended: true}));
app.use(cors());

app.use('/posts',postRoutes);
app.use('/user',userRoutes);
app.use("/", (req, res) => {
    res.send("hello")
})

const PORT = process.env.PORT || 5000;


mongoose.connect(process.env.CONNECTION_URL)
    .then(() => app.listen(PORT, () => console.log(`Server running on port: ${PORT}`)) )
    .catch((error) => console.log(error.message));

   
// mongoose.set('useFindAndModify', false);    