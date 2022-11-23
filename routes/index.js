const router = require("express").Router();
const { celebrate, Joi } = require("celebrate");
const auth = require("../middlewares/auth");
const {
  register,
  login,
  getUserInfo,
  getUsers,
  deleteUsers,
  blockUsers,
  unblockUsers,
} = require("../controllers/users");

router.post(
  "/signup",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  register
);
router.post(
  "/signin",
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login
);
router.use(auth);
router.get("/users", getUsers);
router.get("/me", getUserInfo);
router.delete("/deleteUsers", deleteUsers);
router.patch("/blockUsers", blockUsers);
router.patch("/unblockUsers", unblockUsers);

module.exports = router;
