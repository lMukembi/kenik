const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      // required: true,
    },

    ip: {
      type: String,
      // required: true,
    },

    macAddress: {
      type: String,
      // required: true,
    },

    resellerID: {
      type: String,
      // required: true,
    },

    platformFee: {
      type: String,
      // required: true,
    },

    amountPaid: {
      type: Number,
      // required: true,
    },

    resellerAmount: {
      type: String,
      // required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
