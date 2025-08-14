const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const Post = require("../models/post");
const User = require("../models/user");
const { throwError } = require("../utils/error");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    const totalItems = await Post.countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    if (!posts) throwError("Could not get posts.", 404);

    res
      .status(200)
      .json({ message: "Posts fetched successfully.", posts, totalItems });
  } catch (err) {
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty())
    throwError("Validation failed, entered data is incorrect.", 422);

  if (!req.file) throwError("No image provided.", 422);

  const { title, content } = req.body;
  const imageUrl = req.file.path;

  const post = new Post({
    title,
    content,
    imageUrl,
    creator: req.userId,
  });

  try {
    await post.save();

    const user = await User.findById(req.userId);
    user.posts.push(post);
    await user.save();

    res.status(201).json({
      message: "Post created successfully!",
      post,
      creator: { _id: user._id, name: user.name },
    });
  } catch (err) {
    next(err);
  }
};

exports.getPost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) throwError("Could not find post.", 404);

    res.status(200).json({ message: "Post fetched.", post });
  } catch (err) {
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty())
    throwError("Validation failed, entered data is incorrect.", 422);

  const postId = req.params.postId;
  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  if (req.file) {
    imageUrl = req.file.path;
  }

  if (!imageUrl) throwError("No image picked.", 422);

  try {
    const post = await Post.findById(postId);

    if (!post) throwError("Could not find post.", 422);

    if (post.creator.toString() !== req.userId)
      throwError("Not authorized!", 403);

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;
    await post.save();

    res.status(200).json({ message: "Post updated successfully.", post });
  } catch (err) {
    next(err);
  }
};

exports.deletePost = async (req, res, next) => {
  const postId = req.params.postId;
  try {
    const post = await Post.findById(postId);

    if (!post) throwError("Could not find post.", 404);

    if (post.creator.toString() !== req.userId)
      throwError("Not authorized!", 403);

    clearImage(post.imageUrl);

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(req.userId);
    user.posts.pull(postId);
    await user.save();

    res.status(200).json({ message: "Post deleted successfully." });
  } catch (err) {
    next(err);
  }
};

const clearImage = (filePath) => {
  const path = path.join(__dirname, "..", filePath);
  fs.unlink(path, (err) => console.log(err));
};
