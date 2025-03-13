const mongoose = require("mongoose");

const resellerSchema = new mongoose.Schema(
  {
    resellerID: {
      type: String,
    },

    ip: {
      type: String,
    },

    password: {
      type: String,
      required: true,
    },

    username: {
      type: String,
      required: true,
    },

    brand: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    balance: {
      type: Number,
      default: 0,
    },

    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Reseller = mongoose.model("Reseller", resellerSchema);

module.exports = Reseller;
