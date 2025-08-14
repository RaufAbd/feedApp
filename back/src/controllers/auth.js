const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const { throwError } = require("../utils/error");

exports.signup = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) throwError("Validation failed.", 422, errors.array());

  const { name, email, password } = req.body;
  try {
    const hashedPw = await bcrypt.hash(password, 12);

    const user = new User({ name, email, password: hashedPw });
    await user.save();

    res.status(201).json({ message: "User created!", userId: user._id });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) throwError("A user with this email could not be found.", 401);

    const isEqual = await bcrypt.compare(password, user.password);

    if (!isEqual) throwError("Wrong password!", 422);

    const token = jwt.sign(
      { email: user.email, userId: user._id.toString() },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );

    res.status(200).json({ token, userId: user._id.toString() });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) throwError("User not found.", 404);

    res
      .status(200)
      .json({ message: "Status updated successfully.", status: user.status });
  } catch (err) {
    next(err);
  }
};

exports.updateStatus = async (req, res, next) => {
  const newStatus = req.body.status;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) throwError("User not found.", 404);

    user.status = newStatus;
    await user.save();

    res
      .status(200)
      .json({ message: "Status updated successfully.", status: newStatus });
  } catch (err) {
    next(err);
  }
};
