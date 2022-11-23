const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Пользователь",
      minlength: 2,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: (value) => {
        if (validator.isEmail(value)) {
          return true;
        }
        return false;
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    status: {
      type: String,
      default: "Разблокирован",
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: "registrationDate", updatedAt: "lastLoginDate" },
  }
);

module.exports = mongoose.model("user", userSchema);
