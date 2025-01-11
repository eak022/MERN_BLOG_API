const PostModel = require("../models/Post");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cloudinary = require('../config/cloudinaryConfig');
const secret = process.env.SECRET;

exports.createPost = async (req, res) => {
  try {
    const { title, summary, content } = req.body;
    const author = req.userId;

    if (!title || !summary || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const cover = req.file.path; // URL จาก Cloudinary

    // สร้างเอกสารโพสต์
    const postDoc = await PostModel.create({
      title,
      summary,
      content,
      cover,
      author,
    });

    res.json(postDoc);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      message: "An error occurred while creating the post",
    });
  }
};


exports.getPosts = async (req, res) => {
  try {
    const posts = await PostModel.find()
      .populate("author", ["username"])
      .sort({ createdAt: -1 })
      .limit(20);
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      message: "An error occurred while fetching posts",
    });
  }
};

exports.getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const postDoc = await PostModel.findById(id).populate("author", [
      "username",
    ]);
    if (!postDoc) {
      res.status(404).send({
        message: "Post notfound",
      });
      return;
    }
    res.json(postDoc);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      message: "Something error occurred while getting post Details",
    });
  }
};

exports.getPostByAuthor = async(req,res)=>{
  const { id } = req.params;
  try {
    const postDoc = await PostModel.find({author:id}).populate("author", [
      "username",
    ]);
    if (!postDoc) {
      res.status(404).send({
        message: "Post notfound",
      });
      return;
    }
    res.json(postDoc);
  } catch (error) {
    console.log(error.message);
    res.status(500).send({
      message: "Something error occurred while getting post by author",
    });
  }
}

exports.updatePost = async (req, res) => {
  const { id } = req.params;
  const authorId = req.userId;

  if (!id) return res.status(404).json({ message: "Post id is not Provided" });

  try {
    const postDoc = await PostModel.findById(id);
    if (authorId !== postDoc.author.toString()) {
      return res.status(403).json({ message: "You cannot update this post" });
    }

    const { title, summary, content } = req.body;
    if (!title || !summary || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    postDoc.title = title;
    postDoc.summary = summary;
    postDoc.content = content;

    if (req.file) {
      // อัปโหลดไฟล์ใหม่ไปยัง Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "mern_blog_images",
      });
      postDoc.cover = result.secure_url; // อัปเดต URL ใหม่
    }

    await postDoc.save();
    res.json(postDoc);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      message: "An error occurred while updating the post",
    });
  }
};


exports.deletePost = async (req, res) => {
  const { id } = req.params;
  const authorId = req.userId;
  try {
    const postDoc = await PostModel.findById(id);

    if (!postDoc) {
      return res.status(404).send({
        message: "Post not found",
      });
    }

    if (authorId !== postDoc.author.toString()) {
      return res.status(403).send({
        message: "You are not authorized to delete this post",
      });
    }

    await PostModel.findByIdAndDelete(id);

    res.status(200).send({
      message: "Post deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({
      message: error.message || "An error occurred while deleting the post",
    });
  }
};
