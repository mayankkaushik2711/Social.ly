import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import { message } from "../utils/message.js";
import { Response } from "../utils/response.js";

export const createPost = async (req, res) => {
  try {

    const { id } = req.user;

    if (!id) {
      return Response(res,401,false,message.idNotFoundMessage)
    }

    const user = await User.findById(id);
    if (!user) {
        return Response(res,401,false,message.userNotFoundMessage)
    }

    

    const { image, caption, location } = req.body;

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
    user.posts.unshift(newPost.id);
    await user.save();



    Response(res, 201, true, message.postCreatedMessage);

  } catch (error) {
    console.error(error);
    Response(res, 501, false, error.message);
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find();

    if(posts.length === 0){
        return Response(res,401,false,message.postNotFoundMessage , posts)
    }

    return Response(res,200,true,message.PostsFetchedMessage , posts)
  } catch (error) {
    return Response(res,500,false,error.message)
  }
};

export const getPostById = async (req, res) => {
  try {
    const id = req.params.id;

    const post = await Post.findById(id);

    if (!post) {
        return Response(res,401,false,message.postNotFoundMessage )
    }


    Response(res,200,true,message.PostFetchedMessage , post)
  } catch (error) {
    return Response(res,500,false,error.message)
  }
};

export const getUserPost = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
        return Response(res,400,false,message.userNotFoundMessage)
    }


    if (user.posts.length === 0) {
        return Response(res,400,false,message.postNotFoundMessage)
    }

    const posts = await Post.find({
      _id: { $in: user.posts },
    });


    Response(res,200,true,message.PostsFetchedMessage , posts)

  } catch (error) {
    Response(res,500,false,error.message)
  }
};

export const deletePost = async (req, res) => {
  try {
    const post_id = req.params.id;

    if (!post_id) {
        return Response(res,400,false,message.idNotFoundMessage)
    }

    
    const postExists = await Post.findById(post_id);
    if (!postExists) {
        return Response(res,400,false,message.postNotFoundMessage)
    }

    const deleted_post = await Post.findByIdAndDelete(post_id);



    const user = req.user;

    user.posts.forEach((post, index) => {
      if (post.toString() === post_id) {
        user.posts.splice(index, 1);
      }
    });

    await user.save();

    Response(res,200,true,message.postDeletedMessage)
    
  } catch (error) {
    Response(res,500,false,error.message)
  }
};
