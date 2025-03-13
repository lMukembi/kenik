const mongoose = require("mongoose");

const packageSchema = new mongoose.Schema({
  userID: {
    type: String,
  },

  mac_address: {
    type: String,
  },

  ip: {
    type: String,
  },

  expireAt: {
    type: Date,
  },

  status: {
    type: String,
  },
});

const Package = mongoose.model("Package", packageSchema);

module.exports = Package;
