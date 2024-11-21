import Post from '../models/postModel.js';  
import User from '../models/userModel.js'; 
import cloudinary from "cloudinary"
import { message } from '../utils/message.js';
import { Response } from '../utils/response.js';


export const createPost = async (req, res) => {
    try {
        const { id } = req.user;  
        
        if (!id) {
            return res.status(401).json({
                success: false,
                message: "ID not found"
            });
        }

        const user = await User.findById(id);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

   
        const { image, caption, location,  } = req.body;


        if(!image){
            return Response(res , 400 , false , message.imageMissingMessage);
        }


        let imageUpload = await cloudinary.v2.uploader.upload(image,{
            folder: 'posts'
        })

   
        const newPost = new Post({
            owner: id,
            image:  { 
                public_id: imageUpload.public_id, url: imageUpload.url 
            },
            caption,  
            location,  
        });

        
        await newPost.save();


        //set post in user
        user.posts.unshift(newPost._id);
        await user.save();

        Response(res , 201 , true , message.postCreatedMessage);

    } catch (error) {
        console.error(error);
        Response(res , 501 , false , error.message);
    }
};
