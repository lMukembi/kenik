const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
  },

  ip: {
    type: String,
    required: true,
  },

  expireAt: {
    type: Date,
    required: true,
  },
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
