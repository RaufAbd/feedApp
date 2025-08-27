const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const User = require("./../models/user");
const Post = require("./../models/post");
const { throwError } = require("./../utils/error");

module.exports = {
  createUser: async ({ inputData: { email, password, name } }, req) => {
    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: "Email is invalid!" });
    }

    if (
      validator.isEmpty(password) ||
      !validator.isLength(password, { min: 5 })
    ) {
      errors.push({ message: "Password too short!" });
    }

    if (errors.length) {
      throwError("Input invalid!", 422, errors);
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throwError("User exists already!", 422);
    }

    const hashedPassw = await bcrypt.hash(password, 12);

    const user = new User({ name, email, password: hashedPassw });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },

  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      throwError("User not found!", 401);
    }

    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      throwError("Password is incorrect!", 401);
    }

    const userId = user._id.toString();
    const token = jwt.sign(
      {
        userId,
        email: user.email,
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );

    return {
      token,
      userId,
    };
  },

  createPost: async (
    { postInput: { title, content, imageUrl, postId } },
    req
  ) => {
    if (!req.isAuth) {
      throwError("User is not authenticated!", 401);
    }

    const errors = [];

    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      throwError("Title is not valid!", 422);
    }

    if (
      validator.isEmpty(content) ||
      !validator.isLength(content, { min: 5 })
    ) {
      throwError("Content is not valid!", 422);
    }

    if (errors.length) {
      throwError("Input invalid!", 422, errors);
    }

    if (postId) {
      const post = await Post.findById(postId).populate("creator");

      if (!post) throwError("Could not find post.", 422);

      if (post.creator._id.toString() !== req.userId) {
        throwError("Not authorized!", 403);
      }

      post.imageUrl = imageUrl;
      post.title = title;
      post.content = content;
      const editedPost = await post.save();

      return {
        ...editedPost._doc,
        _id: editedPost._id.toString(),
        createdAt: editedPost.createdAt.toISOString(),
        updatedAt: editedPost.updatedAt.toISOString(),
      };
    }

    const user = await User.findById(req.userId);
    if (!user) {
      throwError("Invalid user!", 401);
    }

    const post = new Post({ title, content, imageUrl, creator: user });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();

    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString(),
    };
  },

  posts: async ({ page }, req) => {
    if (!req.isAuth) {
      throwError("User is not authenticated!", 401);
    }
    const perPage = 2;
    const currentPage = page || 1;
    const totalItems = await Post.countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .sort({ createdAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    if (!posts) throwError("Could not get posts.", 404);

    return {
      posts: posts.map((p) => {
        return {
          ...p._doc,
          _id: p._id.toString(),
          createdAt: p.createdAt.toISOString(),
          updatedAt: p.updatedAt.toISOString(),
        };
      }),
      totalItems,
    };
  },
};
