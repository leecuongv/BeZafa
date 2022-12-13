const jwt = require("jsonwebtoken");
const User = require('../models/User.js')
const jwt_decode = require('jwt-decode')
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token không hợp lệ" });
      }
      req.user = user;
      next();
    })
  } else {
    return res.status(401).json({ message: "Không có token" });
  }
}

const verifyTokenAdmin = (req, res, next) => {
  const token = req.headers.authorization;
  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, process.env.JWT_ACCESS_KEY, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Token không hợp lệ" });
      }
      if (user.roles.includes("ADMIN")) {
        req.user = user
        next();
      }
      else
        return req.status(403).json({ message: "Bạn không có quyền truy cập" })
    })
  } else {
    return res.status(401).json({ message: "Không có token" });
  }
}

const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      //decodes token id
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_KEY);
      //console.log(process.env.JWT_ACCESS_KEY)
      req.user = User.findById(decoded.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
};


module.exports = { verifyToken, verifyTokenAdmin, protect }