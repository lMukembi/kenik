const express = require("express");
const cors = require("cors");
const path = require("path");
const connectionDB = require("./connect.js");

require("dotenv").config();
const app = express();
const port = 8000;
const MONGO_URI = "mongodb://kenik:1919@127.0.0.1:27017/kenikwifi";
// const MONGO_URI =
//   "mongodb+srv://kenik:1919@kenik.flr9f.mongodb.net/?retryWrites=true&w=majority&appName=Kenik";

const corsOptions = {
  origin: [
    "https://kenikwifi.com",
    // "https://www.kenikwifi.com",
    "https://app.kenikwifi.com",
    // "http://192.168.1.100",
    // "http://localhost:3000",
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  allowedHeaders: ["Content-Type, Authorization"],
  credentials: true,
  exposedHeaders: ["Authorization"],
};

app.use(cors(corsOptions));

app.options("*", cors());

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "../client/build")));

app.use("/api/admin", require("./routes/admin"));
app.use("/api/user", require("./routes/user"));
app.use("/api/reseller", require("./routes/reseller"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/mikrotik", require("./routes/mikrotik"));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build", "index.html"));
});

// app.get("*", (req, res) => {
//   if (req.originalUrl.startsWith("/api/")) {
//       return res.status(404).json({ message: "API endpoint missing." });
//   }
//   res.sendFile(path.join(__dirname, "client/build", "index.html"));
// });

const DBConnection = async () => {
  try {
    await connectionDB(MONGO_URI);

    app.listen(port, "0.0.0.0", () => {
      console.log(`server is running on port ${port}`);
    });
  } catch (err) {
    console.log(err.message);
    process.exit(1);
  }
};

DBConnection();
