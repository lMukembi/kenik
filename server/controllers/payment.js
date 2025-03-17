const express = require("express");
const Payment = require("../models/payment");
const User = require("../models/user");
const Reseller = require("../models/reseller");
const Package = require("../models/package");

exports.sendstk = async (req, res) => {
  const { ip, amount, phone, duration, transID, hours } = req.body;

  // const Phone = `0${phone.substring(3)}`;

  const data = {
    amount,
    phone,
  };

  try {
    const platformFee = (2 / 100) * amount;
    const resellerAmount = amount - platformFee;

    const resData = await axios.post("https://dns1.boogiecoin.org", data, {
      headers: {
        "Content-Type": "application/json",
        "Api-Secret": "fh4oghxg94",
      },
    });

    if (resData.data.Status === true) {
      const reseller = await Reseller.findOne({ phone });
      const user = await User.findOne({ phone });

      // const fetchARPTable = () => {
      //   const exec = require("child_process").exec;
      //   return new Promise((resolve, reject) => {
      //     exec("arp -a", (error, stdout) => {
      //       if (error) return reject(error);
      //       const arpTable = {};
      //       stdout.split("\n").forEach((line) => {
      //         const parts = line.match(
      //           /(\d+\.\d+\.\d+\.\d+)\s+([a-fA-F0-9:-]+)/
      //         );
      //         if (parts) arpTable[parts[1]] = parts[2];
      //       });
      //       resolve(arpTable);
      //     });
      //   });
      // };

      // const arpTable = await fetchARPTable();
      // const macAddress = arpTable[ip];

      // if (!ip) {
      //   return res.status(400).json({ message: "IP is required." });
      // }

      // if (!macAddress) {
      //   return res.status(400).json({ message: "MAC not found." });
      // }

      if (reseller) {
        reseller.balance += resellerAmount;
        await reseller.save();
      }

      const transaction = new Payment({
        userID: user._id,
        ip: ip,
        macAddress: macAddress,
        resellerID: reseller._id,
        amountPaid: amount,
        platformFee: platformFee,
        resellerAmount: resellerAmount,
        transactionID: transID,
      });

      const package = await Package.findOneAndUpdate(
        { ip: ip, status: "pending" },
        {
          $set: {
            status: "paid",
            userID: user._id,
            expireAt: {
              type: Date,
              default: () => new Date(Date.now() + duration * 60 * 60 * 1000),
              index: { expires: `${hours}h` },
            },
          },
        },
        { new: true }
      );

      // const package = new Package({
      //   userID: user._id,
      //   ip: ip,
      //   expireAt: new Date(Date.now() + duration * 60 * 60 * 1000),
      // });

      await transaction.save();
      await package.save();

      res.json({ success: true, message: "Payment successful." });

      return exec("/bin/bash /home/scripts/update_paid_macs.sh");
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
