const bcrypt = require("bcryptjs");
const Admin = require("../models/admin");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

exports.signup = async (req, res) => {
  const { password, phone } = req.body;

  const JWT_SECRET =
    "S3bwFeWy4VRrFDQ3r0vDircfvsAH3k7AIwg4DVCm8VhTfI/w8YHF3M0ZG+gCkbWwS1xYj1bVl8liAuETKkElGg==";

  try {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);

    const existingPhone = await Admin.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ error: "Phone taken!" });
    }

    const newAdmin = await Admin.create({
      phone,
      password: hash,
    });

    await newAdmin.save();

    const adminID = { id: newAdmin.id };
    const tokenID = jwt.sign(adminID, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res.status(200).json({
      isAdmin: false,
      result: newAdmin,
      tokenID: tokenID,
      message: "Admin created successfully.",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.passwordCheck = async (req, res) => {
  const { phone, password } = req.body;

  const currentPasswordCheck = await Admin.findOne({ phone });

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
  const admin = await Admin.findOne({ phone });

  if (admin) {
    return res.status(200).json({
      status: true,
      data: admin,
      message: "Phone number is taken.",
    });
  } else {
    return res.status(204).json({
      status: false,
      message: "Phone number available.",
    });
  }
};

exports.login = async (req, res) => {
  const { phone, password } = req.body;

  const JWT_SECRET =
    "S3bwFeWy4VRrFDQ3r0vDircfvsAH3k7AIwg4DVCm8VhTfI/w8YHF3M0ZG+gCkbWwS1xYj1bVl8liAuETKkElGg==";

  try {
    const admin = await Admin.findOne({ phone });

    if (!admin) {
      return res.status(400).json({
        message: "Admin is not registered.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, admin.password);

    if (!passwordMatch) {
      return res.status(404).json({ message: "Password does not match." });
    }

    const adminID = { id: admin.id };
    const tokenID = jwt.sign(adminID, JWT_SECRET, {
      expiresIn: "24h",
    });

    return res
      .status(200)
      .json({ isAdmin: false, result: admin, tokenID: tokenID });
  } catch (error) {
    console.log(error.message);
  }
};

exports.forgotPassword = async (req, res) => {
  const { phone } = req.body;

  try {
    const admin = await Admin.findOne({ phone });

    if (!admin) {
      return res
        .status(404)
        .json({ message: "Phone number is not registered!" });
    }

    return res.status(200).json({ result: admin });
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

    await Admin.findByIdAndUpdate(id, newPassword, { new: true });

    return res.status(200).json({
      status: true,
      result: newPassword,
      message: "Password reset success!",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.getAdmin = async (req, res) => {
  try {
    const adminData = await Admin.findOne({ _id: req.params.id });
    return res.status(200).json(adminData);
  } catch (error) {
    console.log(error.message);
  }
};

exports.balance = async (req, res) => {
  const { id } = req.params;

  let { balance } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id))
    return res.status(404).send("Invalid admin.");

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
      return res.status(404).send("Invalid admin.");

    const updatedAdmin = {
      phone,
      password: hash,
      _id: id,
      token: tokenID,
    };

    await Admin.findByIdAndUpdate(
      id,
      updatedAdmin,
      { token: token },
      { new: true }
    );

    return res.status(200).json({
      status: true,
      result: updatedAdmin,
      token: tokenID,
      message: "Updated successfully.",
    });
  } catch (error) {
    console.log(error.message);
  }
};
