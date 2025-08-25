const bcrypt = require("bcryptjs");

const User = require("./../models/user");

module.exports = {
  createUser: async ({ inputData: { email, password, name } }, req) => {
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const error = new Error("User exists already!");
      throw error;
    }

    const hashedPassw = await bcrypt.hash(password, 12);
    const user = new User({ name, email, password: hashedPassw });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
};
