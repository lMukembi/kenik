const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  phoneCheck,
  passwordCheck,
  forgotPassword,
  getReseller,
  getMACs,
  getCredentials,
  ipCheck,
  usernameCheck
} = require("../controllers/reseller");

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/reset-password").post(forgotPassword);
router.route("/:id/user-data").get(getReseller);
router.route("/check-password/:id").post(passwordCheck);
router.route("/check-username").post(usernameCheck);
router.route("/check-phone").post(phoneCheck);
router.route("/check-ip").post(ipCheck);
router.route("/macs/:id").get(getMACs);
router.route("/credentials/:id").get(getCredentials);

module.exports = router;
