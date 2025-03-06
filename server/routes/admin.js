const express = require("express");
const router = express.Router();

const {
  login,
  signup,
  getAdmin,
  phoneCheck,
  passwordCheck,
  settings,
} = require("../controllers/admin");

router.route("/login").post(login);
router.route("/signup").post(signup);
router.route("/:id/admin-data").get(getAdmin);
router.route("/check-phone").post(phoneCheck);
router.route("/check-password/:id").post(passwordCheck);
router.route("/:id/settings").put(settings);

module.exports = router;
