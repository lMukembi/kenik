const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    macAddress: {
      type: String,
      default: null, // Allow null initially
    },
    resellerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
    },
    platformFee: {
      type: Number,
      required: true,
    },
    amountPaid: {
      type: Number,
      required: true,
    },
    resellerAmount: {
      type: Number,
      required: true,
    },
    transactionID: {
      type: String,
      required: true,
    },
    // NEW FIELDS FOR SESSION DETAILS
    sessionDetails: {
      hours: Number,
      speed: String,
      tier: String,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);
module.exports = Payment;
