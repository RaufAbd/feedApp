const bcrypt = require("bcryptjs");
const validator = require("validator");

const User = require("./../models/user");
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
};
