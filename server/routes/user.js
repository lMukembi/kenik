const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  phoneCheck,
  passwordCheck,
  getUser,
  forgotPassword,
  getPackageExpireAt,
} = require("../controllers/user");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/reset-password").post(forgotPassword);
router.route("/:id/user-data").get(getUser);
router.route("/check-password/:id").post(passwordCheck);
router.route("/check-phone").post(phoneCheck);
router.route("/package").post(getPackageExpireAt);

module.exports = router;
