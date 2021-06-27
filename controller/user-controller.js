const { validationResult } = require("express-validator");
const User = require("../model/user-model");
const HttpError = require("../model/http-error");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.getAllUser = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, "-password");
  } catch (err) {
    const error = new HttpError("User not find", 500);
    return next(error);
  }

  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

exports.postAddUser = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    return next(
      new HttpError("Could not pass data please check that input", 451)
    );
  }
  const { name, email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("User not find, please try again later", 500);
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError("User have an already account", 422);
    return next(error);
  }

  let hashPassword;

  try {
    hashPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError(
      "User could not created, please try again later",
      500
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    password: hashPassword,
    image: req.file.path,
    task: [],
  });
  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed ", 500);
    return next(error);
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: createdUser.id, email: createdUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Signing up failed ", 500);
    return next(error);
  }

  res
    .status(201)
    .json({ userId: createdUser.id, email: createdUser.email, token: token });
};

exports.postLogin = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("User not find, please try again later", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError(
      "User Entered credential is wrong, please try again later",
      500
    );
    return next(error);
  }

  let validatePassword = false;
  try {
    validatePassword = await bcrypt.compare(password, user.password);
  } catch (err) {
    const error = new HttpError(
      "User Entered credential is wrong, please try again later",
      500
    );
    return next(error);
  }

  if (!validatePassword) {
    const error = new HttpError(
      "User Entered credential is wrong, please try again later",
      500
    );
    return next(error);
  }

  let token;
  try {
    token = await jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError("Loging in failed ", 500);
    return next(error);
  }

  res.json({
    userId: user.id,
    email: user.email,
    token: token,
  });
};
