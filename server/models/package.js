const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    resellerID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reseller",
      required: true,
    },
    ip: {
      type: String,
      required: true,
    },
    macAddress: {
      type: String,
      default: null,
    },
    // NEW FIELDS FOR DYNAMIC PRICING
    amount: {
      type: Number,
      required: true,
    },
    sessionHours: {
      type: Number,
      required: true,
    },
    sessionMinutes: {
      type: Number,
      required: true,
    },
    speed: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      required: true,
    },
    ratePerHour: {
      type: Number,
      required: true,
    },
    username: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    transactionID: {
      type: String,
      required: true,
    },
    expireAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "active", "expired"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire packages
packageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Package = mongoose.model("Package", packageSchema);
module.exports = Package;
