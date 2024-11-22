import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import cloudinary from "cloudinary";
import { message } from "../utils/message.js";
import { Response } from "../utils/response.js";

export const createPost = async (req, res) => {
  try {
    const { id } = req.user;

    if (!id) {
      return res.status(401).json({
        success: false,
        message: "ID not found",
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
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
    user.posts.unshift(newPost._id);
    await user.save();

    console.log("ara hai");

    Response(res, 201, true, message.postCreatedMessage);
  } catch (error) {
    console.error(error);
    Response(res, 501, false, error.message);
  }
};

export const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find();

    console.log("Fetched posts:", posts);

    res.status(200).json({
      success: true,
      data: posts,
      message: "All posts fetched successfully",
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const id = req.params.id;

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User have no associated post",
      });
    }

    const posts = await Post.find({
      _id: { $in: user.posts },
    });

    res.status(200).json({
      success: true,
      data: posts,
      message: "posts fetched successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserPost = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("User posts:", user.posts);

    if (user.posts.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User has no posts associated",
      });
    }

    const posts = await Post.find({
      _id: { $in: user.posts },
    });

    console.log("Fetched posts:", posts);

    res.status(200).json({
      success: true,
      data: posts,
      message: "posts fetched successfully",
    });
  } catch (error) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post_id = req.params.id;

    if (!post_id) {
      return res.status(400).json({
        success: false,
        message: "post_id not found",
      });
    }

    
    const postExists = await Post.findById(post_id);
    if (!postExists) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const deleted_post = await Post.findByIdAndDelete(post_id);

    console.log(deleted_post);

    const user = req.user;

    user.posts.forEach((post, index) => {
      if (post.toString() === post_id) {
        user.posts.splice(index, 1);
      }
    });

    await user.save();

    res.status(200).json({
      success: true,
      postExists,
      message: "Post deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
