const express = require("express");

const { body } = require("express-validator");

const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom((val, { req }) => {
        return User.findOne({ email: val }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists!");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post(
  "/login",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
  ],
  authController.login
);

router.get("/status", isAuth, authController.getStatus);
router.put(
  "/status",
  isAuth,
  [body("status").trim().not().isEmpty()],
  authController.updateStatus
);

module.exports = router;
