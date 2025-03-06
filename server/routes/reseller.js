const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  phoneCheck,
  passwordCheck,
  forgotPassword,
  getReseller,
} = require("../controllers/reseller");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/reset-password").post(forgotPassword);
router.route("/:id/user-data").get(getReseller);
router.route("/check-password/:id").post(passwordCheck);
router.route("/check-phone").post(phoneCheck);

module.exports = router;
