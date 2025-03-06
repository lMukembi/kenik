const mongoose = require("mongoose");

const resellerSchema = new mongoose.Schema(
  {
    password: {
      type: String,
      required: true,
      minLength: 4,
    },

    username: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 15,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
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
