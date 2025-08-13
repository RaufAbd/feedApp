const jwt = require("jsonwebtoken");
const { throwError } = require("../utils/error");

module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) throwError("Not authenticated.", 401);

  const token = authHeader.split(" ")[1];
  let decodedToken;

  try {
    decodedToken = jwt.verify(token, "somesupersecretsecret");
  } catch (err) {
    throw err;
  }

  if (!decodedToken) {
    throwError("Not authenticated.", 401);
  }

  req.userId = decodedToken.userId;
  next();
};
