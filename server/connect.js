const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

const connectDB = async (url) => {
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    throw err;
  }

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB error:", err.message);
  });

  mongoose.connection.on("Disconnected", () => {
    console.warn("MongoDB disconnected, retrying...");
    setTimeout(() => connectDB(url), 5000);
  });
};

module.exports = connectDB;
