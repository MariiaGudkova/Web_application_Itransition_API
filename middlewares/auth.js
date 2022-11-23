const jwt = require("jsonwebtoken");
const User = require("../models/user");

const { NODE_ENV, JWT_SECRET } = process.env;
const { UNAUTHORIZATION_ERROR_CODE } = require("../utils/constants");

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  try {
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw "No authorization header";
    }
    const token = authorization.replace("Bearer ", "");
    const payload = jwt.verify(
      token,
      NODE_ENV === "production" ? JWT_SECRET : "dev-secret"
    );
    req.user = payload;
    User.findById(payload._id)
      .orFail()
      .then((user) => {
        if (user.status === "Разблокирован") {
          next();
        } else {
          throw "User not active error";
        }
      })
      .catch((e) => {
        return res
          .status(UNAUTHORIZATION_ERROR_CODE)
          .send({ message: "Authorization required" });
      });
  } catch (e) {
    return res
      .status(UNAUTHORIZATION_ERROR_CODE)
      .send({ message: "Authorization required" });
  }
};
