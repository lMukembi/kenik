const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
      minLength: 4,
    },

    secretCode: {
      type: String,
      required: true,
      default: "420369",
    },

    adminBalance: {
      type: Number,
      default: 0,
    },

    isAdmin: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
