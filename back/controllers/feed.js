const { validationResult } = require("express-validator");

exports.getPosts = (req, res, nexr) => {
  return res.status(200).json({
    posts: [
      {
        _id: "1",
        title: "My first Post!",
        content: "This is my first Post!",
        imageUrl: "images/wallpapers.jpg",
        creator: {
          name: "Rayf",
        },
        createdAt: new Date(),
      },
    ],
  });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        message: "Validation failed, entered data is incorrect.",
        errors: errors.array(),
      });
  }
  const { title, content } = req.body;

  return res.status(201).json({
    message: "Post created successfully!",
    post: {
      _id: Date.now(),
      title,
      content,
      creator: { name: "Rudolfo" },
      createdAt: new Date(),
      imageUrl: "images/wallpapers.jpg",
    },
  });
};
