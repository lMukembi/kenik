require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

const port = 8000;
const MONGO_URI = "mongodb://kenik:1919@127.0.0.1:27017/kenikwifi";

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected."))
  .catch((err) => console.error(err.message));

const packageSchema = new mongoose.Schema({
  mac_address: String,
  ip: String,
  status: String,
});
const Package = mongoose.model("Package", packageSchema);

app.post("/package", async (req, res) => {
  const { ip } = req.body;

  if (!ip) return res.status(400).json({ error: "IP is required." });

  try {
    const fetchARPTable = () => {
      const exec = require("child_process").exec;
      return new Promise((resolve, reject) => {
        exec("arp -a", (error, stdout) => {
          if (error) return reject(error);
          const arpTable = {};
          stdout.split("\n").forEach((line) => {
            const parts = line.match(/(\d+\.\d+\.\d+\.\d+)\s+([a-fA-F0-9:-]+)/);
            if (parts) arpTable[parts[1]] = parts[2];
          });
          resolve(arpTable);
        });
      });
    };

    const arpTable = await fetchARPTable();
    const macAddress = arpTable[ip];

    if (!macAddress) {
      return res.status(400).json({ error: "MAC not found." });
    }

    await Package.updateOne(
      { mac_address: macAddress },
      { $set: { ip, mac_address: macAddress, status: "pending" } },
      { upsert: true }
    );

    res.json({ message: "IP and MAC stored successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error." });
  }
});

const PORT = port;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
