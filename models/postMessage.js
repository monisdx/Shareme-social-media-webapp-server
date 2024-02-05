import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    tags: [String],
    selectedFile: {
        public_id: String,
        url: String,
    },
    likes: {
        type: [String],
        default:[]
    },
    comments: {
        type: [
            {
                username: {
                    type: String,
                    default: ''
                },
                comment: {
                    type: String,
                    default: ''
                }
            }
        ],
        default:[]
    },
    createdAt: {
        type: Date,
        default: new Date()
    },
});

const PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;