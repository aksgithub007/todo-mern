const express = require("express");
const { body } = require("express-validator");

const routes = express.Router();

const userController = require("../controller/user-controller");
const fileUpload = require("../middleware/file-upload");

routes.get("/", userController.getAllUser);

routes.post(
  "/signup",
  fileUpload.single("image"),
  [
    body("name").not().isEmpty(),
    body("email").normalizeEmail().isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  userController.postAddUser
);

routes.post(
  "/login",
  [
    body("email").normalizeEmail().isEmail(),
    body("password").isLength({ min: 5 }),
  ],
  userController.postLogin
);

module.exports = routes;
