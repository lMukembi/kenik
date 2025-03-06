const express = require("express");
const router = express.Router();

const { sendstk, getTransactionMessages } = require("../controllers/payment");

router.route("/deposit").post(sendstk);
router.route("/:id/messages").get(getTransactionMessages);

module.exports = router;
