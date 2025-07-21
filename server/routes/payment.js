const express = require("express");
const router = express.Router();

const {
  sendstk,
  getTransactionMessages,
  getPricingPreview,
  checkUserPackage,
} = require("../controllers/payment");

router.route("/deposit").post(sendstk);
router.route("/preview").post(getPricingPreview); // NEW
router.route("/check-package").post(checkUserPackage); // NEW
router.route("/:id/messages").get(getTransactionMessages);

module.exports = router;
