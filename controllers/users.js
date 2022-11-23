const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { NODE_ENV, JWT_SECRET } = process.env;
const {
  BAD_REQUEST_ERROR_CODE,
  UNAUTHORIZATION_ERROR_CODE,
  NOTFOUND_ERROR_CODE,
  CONFLICT_ERROR_CODE,
  SERVER_ERROR_CODE,
} = require("../utils/constants");

const register = (req, res) => {
  const { name, email, password, status } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({
        name,
        email,
        password: hash,
        status,
      })
    )
    .then((user) => {
      const { password: p, ...data } = JSON.parse(JSON.stringify(user));
      res.send({ data });
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        return res.status(BAD_REQUEST_ERROR_CODE).send({
          message: "Incorrect data was transmitted when creating user",
        });
      }
      if (e.code === 11000) {
        return res
          .status(CONFLICT_ERROR_CODE)
          .send({ message: "User with this email already exists" });
      } else {
        return res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error occurred on the server" });
      }
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email })
    .select("+password")
    .orFail()
    .then((user) => {
      if (user.status === "Заблокирован") {
        return res
          .status(UNAUTHORIZATION_ERROR_CODE)
          .send({ message: "The user was blocked. Access denied" });
      }
      // TODO remove
      console.log(password);
      bcrypt
        .compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject();
          }
          const token = jwt.sign(
            { _id: user._id },
            NODE_ENV === "production" ? JWT_SECRET : "dev-secret",
            { expiresIn: "24h" }
          );
          res.send({ token });
        })
        .catch((e) => {
          // TODO remove
          console.log(e);
          return res
            .status(UNAUTHORIZATION_ERROR_CODE)
            .send({ message: "Incorrect email or password" });
        });
    });
};

const getUserInfo = (req, res) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => {
      res.send({ data: user });
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        return res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Invalid user _id passed" });
      }
      if (e instanceof mongoose.Error.DocumentNotFoundError) {
        return res
          .status(NOTFOUND_ERROR_CODE)
          .send({ message: "The user by the specified _id was not found" });
      } else {
        return res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error occurred on the server" });
      }
    });
};

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ data: users }))
    .catch((e) => {
      res
        .status(SERVER_ERROR_CODE)
        .send({ message: "An error occurred on the server" });
    });
};

const deleteUsers = (req, res) => {
  const { ids } = req.body;
  User.deleteMany({ _id: { $in: ids } }, { new: true })
    .orFail()
    .then(() => res.send({ message: "User/users deleted" }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        return res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Invalid user _id passed" });
      }
      if (e instanceof mongoose.Error.DocumentNotFoundError) {
        return res
          .status(NOTFOUND_ERROR_CODE)
          .send({ message: "The user with the specified _id was not found" });
      } else {
        return res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error occurred on the server" });
      }
    });
};

const blockUsers = (req, res) => {
  const { ids } = req.body;
  User.updateMany(
    { _id: { $in: ids } },
    { status: "Заблокирован" },
    { new: true }
  )
    .orFail()
    .then(() => {
      return res.send({ message: "User/users blocked" });
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        return res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Invalid user _id passed" });
      }
      if (e instanceof mongoose.Error.DocumentNotFoundError) {
        return res
          .status(NOTFOUND_ERROR_CODE)
          .send({ message: "The user with the specified _id was not found" });
      } else {
        return res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error occurred on the server" });
      }
    });
};

const unblockUsers = (req, res) => {
  const { ids } = req.body;
  User.updateMany(
    { _id: { $in: ids } },
    { status: "Разблокирован" },
    { new: true }
  )
    .orFail()
    .then(() => {
      return res.send({ message: "User/users unblocked" });
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        return res
          .status(BAD_REQUEST_ERROR_CODE)
          .send({ message: "Invalid user _id passed" });
      }
      if (e instanceof mongoose.Error.DocumentNotFoundError) {
        return res
          .status(NOTFOUND_ERROR_CODE)
          .send({ message: "The user with the specified _id was not found" });
      } else {
        return res
          .status(SERVER_ERROR_CODE)
          .send({ message: "An error occurred on the server" });
      }
    });
};

module.exports = {
  register,
  login,
  getUserInfo,
  getUsers,
  deleteUsers,
  blockUsers,
  unblockUsers,
};
