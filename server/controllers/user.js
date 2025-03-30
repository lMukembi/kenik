const bcrypt = require("bcryptjs");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Package = require("../models/package");
const Admin = require("../models/admin");

exports.signup = async (req, res) => {
  const { password, phone } = req.body;

  const JWT_SECRET =
    "S3bwFeWy4VRrFDQ3r0vDircfvsAH3k7AIwg4DVCm8VhTfI/w8YHF3M0ZG+gCkbWwS1xYj1bVl8liAuETKkElGg==";

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone taken!" });
    }

    const newUser = await User.create({
      phone,
      password: hash,
    });

    await newUser.save();

    const userID = { id: newUser.id };
    const tokenID = jwt.sign(userID, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({
      isAdmin: false,
      result: newUser,
      tokenID: tokenID,
      message: "User created successfully.",
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
    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        message: "User is not registered.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(404).json({ message: "Password does not match." });
    }

    const userID = { id: user.id };
    const tokenID = jwt.sign(userID, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res
      .status(200)
      .json({ isAdmin: false, result: user, tokenID: tokenID });
  } catch (error) {
    console.log(error.message);
  }
};

exports.forgotPassword = async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone });

    if (!user) {
      return res
        .status(404)
        .json({ message: "Phone number is not registered!" });
    }

    return res.status(200).json({ result: user });
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

    await User.findByIdAndUpdate(id, newPassword, { new: true });

    return res.status(200).json({
      status: true,
      result: newPassword,
      message: "Password reset success!",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.storeMAC = async (req, res) => {
  const { macs } = req.body;
  if (!macs) {
    return res.status(400).json({ error: "MACs required." });
  }

  const MACs = macs.split("\n");

  try {
    for (let mac of MACs) {
      await Package.updateOne(
        { mac_address: mac },
        { $set: { status: "pending" } },
        { upsert: true }
      );
    }

    return res.json({ message: "MAC stored successfully." });
  } catch (err) {
    console.error(err.message);
  }
};

exports.passwordCheck = async (req, res) => {
  const { phone, password } = req.body;

  const currentPasswordCheck = await User.findOne({ phone });

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
  const user = await User.findOne({ phone });

  if (user) {
    return res.status(200).json({
      status: true,
      data: user,
      message: "Phone number is taken.",
    });
  } else {
    return res.status(204).json({
      status: false,
      message: "Phone number available.",
    });
  }
};

// exports.ipCheck = async (req, res) => {
//   const { ip } = req.body;
//   const user = await User.findOne({ ip });

//   if (user) {
//     return res.status(200).json({
//       status: true,
//       data: user,
//       message: "IP is taken.",
//     });
//   } else {
//     return res.status(204).json({
//       status: false,
//       message: "IP available.",
//     });
//   }
// };

exports.getUser = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.params.id });

    res.status(200).json(userData);
  } catch (error) {
    console.log(error.message);
  }
};

exports.getReseller = async (req, res) => {
  const { phone } = req.params;

  try {
    const resellerData = await User.findOne({ phone });
    return res.status(200).json(resellerData);
  } catch (error) {
    console.log(error.message);
  }
};

exports.getAdmin = async (req, res) => {
  const { phone } = req.params;

  try {
    const adminData = await Admin.findOne({ phone });
    return res.status(200).json(adminData);
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
      return res.status(404).send("Invalid user.");

    const updatedUser = {
      phone,
      password: hash,
      _id: id,
      token: tokenID,
    };

    await User.findByIdAndUpdate(
      id,
      updatedUser,
      { token: token },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      result: updatedUser,
      token: tokenID,
      message: "Updated successfully.",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.subscribe = async (req, res) => {
  const { id } = req.params;

  let { package } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send("Invalid user.");

    const newPackage = {
      package,
      _id: id,
    };
    await User.findByIdAndUpdate(id, newPackage, { new: true });

    return res.status(200).json({
      status: true,
      result: newPackage,
      message: "Subscribed successfully.",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.getPackageExpireAt = async (req, res) => {
  const { ip } = req.params;

  try {
    const packageExpireAt = await Package.findOne({ ip: ip });

    return res.status(200).json(packageExpireAt);
  } catch (error) {
    console.log(error.message);
  }
};
