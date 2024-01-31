import jwt from 'jsonwebtoken'

// want to like a post
//click the like button => auth middleware (next)=> like controller
const auth = async(req, res, next) => {
    try{

        console.log(req.headers);

        const token = req.headers.authorization.split(" ")[1];

        // const iscustomauth = token.length < 500;

        let decodedata;

        if(token){
            decodedata = jwt.verify(token, 'test');

            req.userId = decodedata?.id;
        }
        // else{
        //     decodedata = jwt.verify(token);

        //     req.userId = decodedata?.sub;

        // }
        next();
    }
    catch(error){
        console.log(error);
    }
}

export default auth;