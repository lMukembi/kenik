const Payment = require("../models/payment");
const User = require("../models/user");
const Reseller = require("../models/reseller");
const Package = require("../models/package");
const pricingService = require("../services/pricingService");
const mikrotikService = require("../services/mikrotikService");
const axios = require("axios");

// NEW: Get pricing preview
exports.getPricingPreview = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount < 5) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount is KSh 5",
      });
    }

    const preview = pricingService.getAmountPreview(parseInt(amount));
    res.json({ success: true, preview });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ success: false, message: "Error calculating preview" });
  }
};

// UPDATED: STK push with dynamic pricing
exports.sendstk = async (req, res) => {
  const { ip, amount, phone } = req.body;

  try {
    // Calculate session details using new pricing service
    const sessionDetails = pricingService.calculateSessionDetails(
      parseInt(amount)
    );
    const transactionID = generateTransactionCode();

    // Find reseller by IP
    const reseller = await Reseller.findOne({ ip });
    if (!reseller) {
      return res
        .status(404)
        .json({ message: "Reseller not found for this IP." });
    }

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({
        phone: phone,
        password: Math.random().toString(36).substring(2, 8),
        resellerID: reseller._id,
      });
      await user.save();
    }

    // Create pending package
    const package = new Package({
      userID: user._id,
      resellerID: reseller._id,
      ip: ip,
      amount: amount,
      sessionHours: sessionDetails.sessionHours,
      sessionMinutes: sessionDetails.sessionMinutes,
      speed: sessionDetails.speed,
      tier: sessionDetails.tier,
      ratePerHour: sessionDetails.ratePerHour,
      transactionID: transactionID,
      expireAt: sessionDetails.expires_at,
      status: "pending",
    });

    await package.save();

    // Calculate fees
    const platformFee = (3 / 100) * amount;
    const resellerAmount = amount - platformFee;

    // Send M-Pesa STK push
    const data = { amount, phone };
    const mpesaResponse = await axios.post(
      "https://dns1.boogiecoin.org",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "Api-Secret": "fh4oghxg94",
        },
      }
    );

    if (mpesaResponse.data.Status === true) {
      // Create payment record
      const transaction = new Payment({
        userID: user._id,
        ip: ip,
        macAddress: null, // Will be updated later
        resellerID: reseller._id,
        amountPaid: amount,
        platformFee: platformFee,
        resellerAmount: resellerAmount,
        transactionID: transactionID,
        sessionDetails: {
          hours: sessionDetails.sessionHours,
          speed: sessionDetails.speed,
          tier: sessionDetails.tier,
        },
      });

      await transaction.save();

      // Update package status to paid
      await Package.findOneAndUpdate(
        { transactionID: transactionID },
        {
          status: "paid",
          expireAt: sessionDetails.expires_at,
        }
      );

      // Create MikroTik user
      try {
        const mikrotikUser = await mikrotikService.createHotspotUser(
          reseller._id,
          sessionDetails,
          transactionID
        );

        if (mikrotikUser.success) {
          // Update package with credentials
          await Package.findOneAndUpdate(
            { transactionID: transactionID },
            {
              status: "active",
              username: mikrotikUser.username,
              password: mikrotikUser.password,
            }
          );

          // Update reseller balance
          reseller.balance += resellerAmount;
          await reseller.save();

          res.json({
            success: true,
            message: "Payment successful.",
            data: {
              Status: true,
              sessionDetails: sessionDetails,
              credentials: {
                username: mikrotikUser.username,
                password: mikrotikUser.password,
              },
            },
          });
        } else {
          throw new Error("Failed to create MikroTik user");
        }
      } catch (mikrotikError) {
        console.error("MikroTik error:", mikrotikError);
        // Payment successful but MikroTik failed - mark for manual intervention
        await Package.findOneAndUpdate(
          { transactionID: transactionID },
          { status: "paid" }
        );

        res.json({
          success: true,
          message: "Payment successful. Access will be activated shortly.",
          data: { Status: true, sessionDetails: sessionDetails },
        });
      }
    } else {
      await Package.findOneAndUpdate(
        { transactionID: transactionID },
        { status: "expired" }
      );

      res.status(400).json({
        success: false,
        message: "Payment failed.",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

// NEW: Check if user has active package
exports.checkUserPackage = async (req, res) => {
  try {
    const { ip } = req.body;

    const activePackage = await Package.findOne({
      ip: ip,
      status: { $in: ["paid", "active"] },
      expireAt: { $gt: new Date() },
    }).populate("userID");

    if (activePackage) {
      res.json({
        hasActivePackage: true,
        package: {
          amount: activePackage.amount,
          sessionHours: activePackage.sessionHours,
          tier: activePackage.tier,
          speed: activePackage.speed,
          expiresAt: activePackage.expireAt,
          username: activePackage.username,
          password: activePackage.password,
        },
      });
    } else {
      res.json({ hasActivePackage: false });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ success: false, message: "Error checking package" });
  }
};

// Helper function
function generateTransactionCode() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const alphanumeric = letters + numbers;

  const getRandomChar = (charset) =>
    charset[Math.floor(Math.random() * charset.length)];

  return (
    getRandomChar(letters) +
    getRandomChar(letters) +
    [...Array(6)].map(() => getRandomChar(alphanumeric)).join("")
  );
}

exports.getTransactionMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const transactionMessages = await Payment.find({ userID: id })
      .sort({ createdAt: -1 })
      .populate("resellerID", "username hostname");

    return res.status(200).json(transactionMessages);
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ success: false, message: "Error fetching messages" });
  }
};
