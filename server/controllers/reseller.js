const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const crypto = require('crypto');
const Reseller = require("../models/reseller");
const User = require("../models/user");

exports.signup = async (req, res) => {
  const { username, hostname, brand, ip, password, phone } = req.body;

  const randomID = crypto.randomBytes(16).toString('hex');

  const JWT_SECRET =
    "S3bwFeWy4VRrFDQ3r0vDircfvsAH3k7AIwg4DVCm8VhTfI/w8YHF3M0ZG+gCkbWwS1xYj1bVl8liAuETKkElGg==";

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const existingUsername = await Reseller.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: "Username taken!" });
    }

    const existingHostname = await Reseller.findOne({ hostname });
    if (existingHostname) {
      return res.status(400).json({ message: "Hostname taken!" });
    }

    const existingIP = await Reseller.findOne({ ip });
    if (existingIP) {
      return res.status(400).json({ message: "IP taken!" });
    }

    const existingPhone = await Reseller.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone taken!" });
    }

    const newReseller = await Reseller.create({
      resellerID: randomID,
      username,
      hostname,
      brand,
      ip,
      phone,
      password: hash,
    });

    await newReseller.save();

    const resellID = { id: newReseller.id };
    const tokenID = jwt.sign(resellID, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({
      isAdmin: false,
      result: newReseller,
      tokenID: tokenID,
      message: "Reseller created successfully.",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;

  const JWT_SECRET =
    "S3bwFeWy4VRrFDQ3r0vDircfvsAH3k7AIwg4DVCm8VhTfI/w8YHF3M0ZG+gCkbWwS1xYj1bVl8liAuETKkElGg==";

  try {
    const reseller = await Reseller.findOne({ phone });

    if (!reseller) {
      return res.status(400).json({
        message: "User is not registered.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, reseller.password);

    if (!passwordMatch) {
      return res.status(404).json({ message: "Password does not match." });
    }

    const resellerID = { id: reseller.id };
    const tokenID = jwt.sign(resellerID, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res
      .status(200)
      .json({ isAdmin: false, result: reseller, tokenID: tokenID });
  } catch (error) {
    console.log(error.message);
  }
};

exports.usernameCheck = async (req, res) => {
  const { username } = req.body;
  const reseller = await Reseller.findOne({ username });

  if (reseller) {
    return res.status(200).json({
      status: true,
      data: reseller,
      message: "Username is taken.",
    });
  } else {
    return res.status(204).json({
      status: false,
      message: "Username available.",
    });
  }
};

exports.hostnameCheck = async (req, res) => {
  const { hostname } = req.body;
  const reseller = await Reseller.findOne({ hostname });

  if (reseller) {
    return res.status(200).json({
      status: true,
      data: reseller,
      message: "Hostname is taken.",
    });
  } else {
    return res.status(204).json({
      status: false,
      message: "Hostname available.",
    });
  }
};


exports.passwordCheck = async (req, res) => {
  const { phone, password } = req.body;

  const currentPasswordCheck = await Reseller.findOne({ phone });

  if (!currentPasswordCheck) {
    return res.status(400).json({
      message: "The phone number is not registered.",
    });
  }

  const passwordMatch = await bcrypt.compare(
    password,
    currentPasswordCheck.password
  );

  if (passwordMatch) {
    return res.status(200).json({
      status: true,
      message: "Password check success.",
    });
  } else {
    return res
      .status(204)
      .json({ status: false, message: "Password check failed." });
  }
};

exports.phoneCheck = async (req, res) => {
  const { phone } = req.body;
  const reseller = await Reseller.findOne({ phone });

  if (reseller) {
    return res.status(200).json({
      status: true,
      data: reseller,
      message: "Phone number is taken.",
    });
  } else {
    return res.status(204).json({
      status: false,
      message: "Phone number available.",
    });
  }
};

exports.ipCheck = async (req, res) => {
  const { ip } = req.body;
  const reseller = await Reseller.findOne({ ip });

  if (reseller) {
    return res.status(200).json({
      status: true,
      data: reseller,
      message: "IP is taken.",
    });
  } else {
    return res.status(204).json({
      status: false,
      message: "IP available.",
    });
  }
};

exports.forgotPassword = async (req, res) => {
  const { phone } = req.body;

  try {
    const reseller = await Reseller.findOne({ phone });

    if (!reseller) {
      return res
        .status(404)
        .json({ message: "Phone number is not registered!" });
    }

    return res.status(200).json({ result: reseller });
  } catch (error) {
    console.log(error.message);
  }
};

exports.resetPassword = async (req, res) => {
  const { id } = req.params;

  const { password } = req.body;

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const newPassword = {
      password: hash,
      _id: id,
    };

    await Reseller.findByIdAndUpdate(id, newPassword, { new: true });

    return res.status(200).json({
      status: true,
      result: newPassword,
      message: "Password reset success!",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.getReseller = async (req, res) => {
  try {
    const resellerData = await Reseller.findOne({ _id: req.params.id });
    return res.status(200).json(resellerData);
  } catch (error) {
    console.log(error.message);
  }
};

exports.balance = async (req, res) => {
  const { id } = req.params;

  let { balance } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("Invalid reseller.");

  try {
    const newBalance = {
      balance,
      _id: id,
    };

    await Reseller.findOneAndUpdate({ _id: req.params.id }, newBalance, {
      new: true,
    });

    return res.status(200).json({
      status: true,
      result: newBalance,
      message: "Updated successfully.",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.settings = async (req, res) => {
  const { id } = req.params;

  let { phone, password } = req.body;

  const JWT_SECRET =
    "S3bwFeWy4VRrFDQ3r0vDircfvsAH3k7AIwg4DVCm8VhTfI/w8YHF3M0ZG+gCkbWwS1xYj1bVl8liAuETKkElGg==";

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const tokenID = jwt.sign({ id: id }, JWT_SECRET, {
      expiresIn: "24h",
    });

    const token = tokenID;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("Invalid reseller.");

    const updatedReseller = {
      phone,
      password: hash,
      _id: id,
      token: tokenID,
    };

    await Reseller.findByIdAndUpdate(
      id,
      updatedReseller,
      { token: token },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      result: updatedReseller,
      token: tokenID,
      message: "Updated successfully.",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.tendaMACs = async (req, res) => {
  let { ip, username, password } = req.body;

  try {
    const session = await axios.post(`http://${ip}/login.cgi`, {
      username,
      password,
    });

    if (session.status === 200) {
      const res = await axios.get(`http://${ip}/goform/getArpList`, {
        headers: { Cookie: session.headers["set-cookie"] },
      });

      return res.data;
    }
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

exports.tplinkMACs = async (req, res) => {
  let { ip, username, password } = req.body;

  try {
    const res = await axios.get(`http://${ip}/userRpm/ArpListRpm.htm`, {
      auth: { username, password },
    });

    return res.data;
  } catch (error) {
    console.error(error.message);
    return [];
  }
};

exports.getMACs = async (req, res) => {
  const { id } = req.params;
  try {
    const reseller = await Reseller.findOne({ id });

    if (!reseller) {
      return res.status(404).json({ error: "Reseller not found." });
    }

    let macs = [];
    if (reseller.brand === "Tenda") {
      macs = await getTendaMACs(
        reseller.ip,
        reseller.username,
        reseller.password
      );
    } else if (reseller.brand === "TP-Link") {
      macs = await getTpLinkMACs(
        reseller.ip,
        reseller.username,
        reseller.password
      );
    }

    if (!macs.length) {
      return res.status(400).json({ error: "No MAC addresses found." });
    }

    // const res = await axios.post("https://app.kenikwifi.com/api/storeMACs", { id, mac_addresses: macs });
    const res = await axios.post(
      "https://app.kenikwifi.com/api/storeMACs",
      { id, mac_addresses: macs }
    );

    res.json({ data: res.data });
  } catch (error) {
    console.error(error.message);
  }
};

exports.updateRouterMACs = async () => {
  const paidUsers = await User.find({ status: true });

  for (const user of paidUsers) {
    const routerConfig = await Reseller.findOne({ _id: user._id });

    if (!routerConfig) {
      console.error(`No router config for reseller ${user._id}.`);
      continue;
    }

    let macWhitelistURL;

    if (routerConfig.brand === "Tenda") {
      macWhitelistURL = "/goform/setMacFilter";
    } else if (routerConfig.brand === "TP-Link") {
      macWhitelistURL = "/cgi-bin/luci/admin/network/firewall";
    } else {
      console.error("Unsupported brand.");
      continue;
    }

    const { ip, username, password } = routerConfig;
    const mac = user.mac;

    try {
      await axios.post(`http://${ip}${macWhitelistURL}`, { mac }, {
        auth: { username: username, password: password },
      });
      console.log(`MAC ${mac} whitelisted on ${ip}.`);
    } catch (err) {
      console.error(err.message);
    }
  }
};
// Run every 5 seconds
setInterval(exports.updateRouterMACs, 5000);


exports.getCredentials = async (req, res) => {
  const { mac_address } = req.query;
  try {
    if (!mac_address) {
      return res.status(400).json({ error: "MAC address is required." });
    }

    const reseller = await Reseller.findOne({ router_mac: mac_address });

    if (!reseller) {
      return res.status(404).json({ error: "Reseller not found." });
    }

    res.json({
      resellerID: reseller.resellerID,
      ip: reseller.ip,
      username: reseller.username,
      password: reseller.password,
      brand: reseller.brand,
    });
  } catch (error) {
    console.error(error.message);
  }
};
