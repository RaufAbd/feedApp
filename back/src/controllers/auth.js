const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { throwError } = require("../utils/error");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("Validation failed.");
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }

  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 12)
    .then((hashedPw) => {
      const user = new User({ name, email, password: hashedPw });
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "User created!", userId: result._id });
    })
    .catch((err) => next(err));
};

exports.login = (req, res, next) => {
  const { email, password } = req.body;
  let loadedUser;
  User.findOne({ email })
    .then((user) => {
      if (!user) throwError("A user with this email could not be found.", 401);

      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) throwError("Wrong password!");

      const token = jwt.sign(
        { email: loadedUser.email, userId: loadedUser._id.toString() },
        "somesupersecretsecret",
        { expiresIn: "1h" }
      );

      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch((err) => next(err));
};

exports.getStatus = (req, res, next) => {
  User.findById(req.userId)
    .then((user) => {
      if (!user) throwError("User not found.", 404);
      res
        .status(200)
        .json({ message: "Status updated successfully.", status: user.status });
    })
    .catch((err) => next(err));
};

exports.updateStatus = (req, res, next) => {
  const newStatus = req.body.status;
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) throwError("User not found.", 404);

      user.status = newStatus;
      return user.save();
    })
    .then(() => {
      res
        .status(200)
        .json({ message: "Status updated successfully.", status: newStatus });
    })
    .catch((err) => next(err));
};
