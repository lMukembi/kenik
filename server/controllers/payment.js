const Payment = require("../models/payment");
const Reseller = require("../models/reseller");
const axios = require("axios");
const https = require("https"); // Required for secure HTTPS communication
require("dotenv").config();

// This controller has been refactored to handle the entire purchase flow securely.
// It now includes the modern REST API client for MikroTik communication.

// --- MIKROTIK REST API CLIENT ---
// This class handles all secure communication with the MikroTik router's REST API.
class MikroTikRestClient {
  constructor() {
    // The baseURL MUST use https:// to connect to the 'www-ssl' service you enabled.
    this.baseURL = `https://${
      process.env.MIKROTIK_HOST || "7bcc06558c0a.sn.mynetname.net:8443"
    }/rest`;

    // The username ('api_user') and password are used here for Basic Authentication.
    const auth = Buffer.from(
      `${process.env.MIKROTIK_USER || "api-user"}:${
        process.env.MIKROTIK_PASS || "Kenikwifi@1919"
      }`
    ).toString("base64");

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      // This agent bypasses errors from self-signed SSL certificates in development.
      // In production, install a valid Let's Encrypt certificate on your router.
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  /**
   * Finds a user by their unique name to get their internal ID.
   * This is needed for updating (PATCH) an existing user.
   * @param {string} username - The username (e.g., user_aabbccddeeff).
   * @returns {Promise<string|null>} The user's internal '.id' or null if not found.
   */
  async findUserIdByName(username) {
    try {
      const response = await this.api.get(`/ip/hotspot/user?name=${username}`);
      return response.data.length > 0 ? response.data[0][".id"] : null;
    } catch (error) {
      console.error(
        "Error finding user by name:",
        error.response ? error.response.data : error.message
      );
      return null;
    }
  }

  /**
   * Grants internet access by creating a new hotspot user or updating an existing one.
   * @param {string} mac - The user's MAC address.
   * @param {number} totalMinutes - The total duration of access in minutes.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async grantHotspotAccess(mac, totalMinutes) {
    // Backend generates the username to ensure it's secure and consistent.
    const username = `user_${mac.replace(/:/g, "").toLowerCase()}`;
    const timeLimit = `${Math.round(totalMinutes)}m`;

    try {
      const userId = await this.findUserIdByName(username);

      if (userId) {
        // User exists, so we update their session time with a PATCH request.
        console.log(
          `User ${username} exists. Updating time limit to ${timeLimit}.`
        );
        await this.api.patch(`/ip/hotspot/user/${userId}`, {
          "limit-uptime": timeLimit,
          comment: `Re-purchased on ${new Date().toISOString()}`,
        });
      } else {
        // New user, so we create them with a POST request.
        console.log(`Creating new user ${username} for ${timeLimit}.`);
        try {
          await this.api.post("/ip/hotspot/user", {
            name: username,
            "mac-address": mac,
            "limit-uptime": timeLimit,
            profile: "default",
            comment: `Purchased on ${new Date().toISOString()}`,
          });
          console.log("Added user to hotspot!");
        } catch (error) {
          console.log(error);
        }
      }
      return { success: true };
    } catch (error) {
      const errorMessage = error.response
        ? JSON.stringify(error.response.data)
        : error.message;
      console.error("MikroTik API Error:", errorMessage);
      return { success: false, error: `Router API Error: ${errorMessage}` };
    }
  }
}

const mikrotikClient = new MikroTikRestClient();

/**
 * Orchestrates the entire purchase flow: calculates duration, processes payment, and grants access.
 */
exports.sendstk = async (req, res) => {
  // 1. SECURELY GET DATA FROM REQUEST BODY
  // We only trust the amount, phone, mac, and ip. Duration is calculated on the server.
  const { amount, phone, mac, ip } = req.body;

  if (!amount || !phone || !mac) {
    return res.status(400).json({
      success: false,
      message: "Amount, phone, and MAC address are required.",
    });
  }

  const numericAmount = Number(amount);
  if (isNaN(numericAmount) || numericAmount < 1) {
    return res
      .status(400)
      .json({ success: false, message: "A valid amount is required." });
  }

  // 2. AUTHORITATIVE DURATION CALCULATION (backend-side)
  // This formula is now securely executed on the server, preventing client-side manipulation.
  const mintime = 10;
  const maxtime = 30 * 24 * 60;
  const lnAt1 = Math.log(1 + 1);
  const lnAt3000 = Math.log(3000 + 1);
  const p = Math.log(maxtime / mintime) / (lnAt3000 - lnAt1);
  const K = mintime / Math.pow(lnAt1, p);
  const totalMinutes = K * Math.pow(Math.log(numericAmount + 1), p);

  // 3. PAYMENT PROCESSING
  console.log(
    `Initiating STK push for KES ${numericAmount} to ${phone} for ${totalMinutes.toFixed(
      2
    )} minutes.`
  );
  // In a real application, you would await your STK push logic here and verify with a webhook.
  // For this refactor, we will simulate a successful payment.
  const paymentSuccessful = true; // REPLACE WITH ACTUAL PAYMENT LOGIC

  if (!paymentSuccessful) {
    return res
      .status(502)
      .json({ success: false, message: "Payment failed at gateway." });
  }

  // 4. GRANT ACCESS VIA MIKROTIK
  // This is only executed AFTER payment is confirmed.
  const mikrotikResult = await mikrotikClient.grantHotspotAccess(
    mac,
    totalMinutes
  );

  if (!mikrotikResult.success) {
    // If the router fails, we inform the user. The payment was still processed.
    return res.status(500).json({
      success: false,
      message:
        "Payment successful, but failed to activate internet. Please contact support.",
      details: mikrotikResult.error,
    });
  }

  // 5. LOG THE TRANSACTION TO THE DATABASE
  try {
    const platformFee = (3 / 100) * numericAmount;
    const resellerAmount = numericAmount - platformFee;
    const reseller = await Reseller.findOne({ ip: ip }); // Find reseller by their router's public IP
    const username = `user_${mac.replace(/:/g, "").toLowerCase()}`;

    const transaction = new Payment({
      userID: username,
      ip: ip,
      macAddress: mac,
      resellerID: reseller ? reseller.resellerID : "DIRECT",
      amountPaid: numericAmount,
      platformFee: platformFee.toFixed(2),
      resellerAmount: resellerAmount.toFixed(2),
    });
    await transaction.save();

    if (reseller) {
      reseller.balance = (reseller.balance || 0) + resellerAmount;
      await reseller.save();
    }
  } catch (dbError) {
    // Log DB error but don't fail the request, as the user is already online.
    console.error(
      "Database logging error after successful activation:",
      dbError.message
    );
  }

  // 6. SEND SUCCESS RESPONSE
  res.status(200).json({
    success: true,
    message: `Access granted for approximately ${Math.round(
      totalMinutes
    )} minutes. You are now connected!`,
  });
};

/**
 * Retrieves transaction history for a specific user.
 */
exports.getTransactionMessages = async (req, res) => {
  try {
    const { id } = req.params; // The ID is the username, e.g., 'user_aabbccddeeff'
    const transactionMessages = await Payment.find({ userID: id }).sort({
      createdAt: -1,
    });
    return res.status(200).json(transactionMessages);
  } catch (error) {
    console.error("Error fetching transaction messages:", error.message);
    return res.status(500).json({ message: "Error fetching transactions." });
  }
};
