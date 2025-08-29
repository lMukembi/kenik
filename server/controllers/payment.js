const Payment = require("../models/payment");
const User = require("../models/user");
const Reseller = require("../models/reseller");
const axios = require("axios");
import { RouterOSAPI } from "routeros-client";

exports.sendstk = async (req, res) => {
  const { ip, amount, phone, hours, username, mac } = req.body;

  const data = {
    amount,
    phone,
  };

  try {
    const platformFee = (3 / 100) * amount;
    const resellerAmount = amount - platformFee;

    const resData = await axios.post(
      "https://api.nestlink.co.ke/runPrompt",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          "Api-Secret": "96afae97d3c97ebff534b70b",
        },
      }
    );

    console.log("userDATA:", resData);

    if (resData.data.Status === true) {
      try {
        const conn = new RouterOSAPI({
          host: "192.168.88.1",
          user: "admin",
          password: "",
          port: 8728,
        });

        await conn.connect();

        const addClient = await conn.write("/ip/hotspot/user/add", [
          `=name=${username}`,
          `=mac-address=${mac}`,
          `=limit-uptime=${hours}h`,
        ]);
      } catch (error) {
        console.error(err.message);
      } finally {
        conn.close();
      }

      // const reseller = await Reseller.findOne({ phone });

      // if (reseller) {
      //   reseller.balance += resellerAmount;
      //   await reseller.save();
      // }

      const transaction = new Payment({
        userID: username,
        ip: ip,
        macAddress: mac,
        // resellerID: reseller._id,
        amountPaid: amount,
        platformFee: platformFee,
        resellerAmount: resellerAmount,
      });

      await transaction.save();

      res.json({ success: true, message: "Payment successful." });
    } else {
      console.log("Payment Failed");
    }
    res.status(200).json({ status: "success", data: resData.data });
  } catch (error) {
    console.error(error.message);
  }
};

exports.getTransactionMessages = async (req, res) => {
  try {
    const { id } = req.params;

    const transactionMessages = await Payment.find({ userID: id }).sort({
      createdAt: -1,
    });

    return res.status(200).json(transactionMessages);
  } catch (error) {
    console.error(error.message);
  }
};
