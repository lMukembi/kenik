const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.protect = async (req, res, next) => {
  const JWT_SECRET =
    "S3bwFeWy4VRrFDQ3r0vDircfXsAH3k7AIwg4DVCm8VhTfI/w8YHF3M0ZG+gCkbWMS1xYj1bVl8liAuETKkElGg==";
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split("Bearer ")[1];
  }

  try {
    if (token === undefined) {
      return res.status(403).json({ message: "Unauthorised!" });
    }

    let decoded = "";

    decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({ message: "No user!" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.error(error.message);
  }
};
