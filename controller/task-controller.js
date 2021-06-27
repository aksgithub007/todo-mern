const mongoose = require("mongoose");

const { validationResult } = require("express-validator");

const Task = require("../model/task-model");
const User = require("../model/user-model");

const HttpError = require("../model/http-error");

exports.getTaskById = async (req, res, next) => {
  const taskId = req.params.taskId;

  let task;

  try {
    task = await Task.findById(taskId);
  } catch (err) {
    const error = new HttpError(
      "Could not find task, please try again later",
      500
    );
    return next(error);
  }

  if (!task) {
    const error = new HttpError("could not find task for that task id", 404);
    return next(error);
  }
  res.json({ task: task.toObject({ getters: true }) });
};

exports.getTasksByUserId = async (req, res, next) => {
  const userId = req.params.userId;

  let userIdWithTasks;

  try {
    userIdWithTasks = await User.findById(userId).populate("task");
  } catch (err) {
    const error = new HttpError(
      "Could not find task, please try again later",
      500
    );
    return next(error);
  }
  if (!userIdWithTasks || userIdWithTasks.task.length === 0) {
    return next(new HttpError("could not find tasks for that user id", 404));
  }
  res.json({
    tasks: userIdWithTasks.task.map((task) => task.toObject({ getters: true })),
  });
};

exports.createdTask = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    return next(
      new HttpError("Could not pass data please check that input", 451)
    );
  }
  const { name, creator } = req.body;

  const createTask = new Task({
    name,
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    const error = new HttpError(
      "User not find for given user id, Please try again",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new HttpError("User Does not exist", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createTask.save({ session: sess });
    user.task.push(createTask);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("creating task failed, Please try again", 500);
    return next(error);
  }

  res.status(201).json({ task: createTask.toObject({ getters: true }) });
};

exports.updateTask = async (req, res, next) => {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    console.log(error);
    throw new HttpError("Could not pass data please check that input", 451);
  }
  const taskId = req.params.taskId;
  const { name } = req.body;
  let task;
  try {
    task = await Task.findById(taskId);
  } catch (err) {
    const error = new HttpError("updating task failed, Please try again", 500);
    return next(error);
  }

  task.name = name;
  try {
    await task.save();
  } catch (err) {
    const error = new HttpError("saving task failed, Please try again", 500);
    return next(error);
  }

  res.status(200).json({ task: task.toObject({ getters: true }) });
};
exports.deleteTask = async (req, res, next) => {
  const taskId = req.params.taskId;
  let task;
  try {
    task = await Task.findById(taskId).populate("creator");
  } catch (err) {
    const error = new HttpError("updating task failed, Please try again", 500);
    return next(error);
  }

  if (!task) {
    const error = new HttpError("Task is not exist", 404);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await task.remove({ session: sess });
    task.creator.task.pull(task);
    await task.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError("deleting task failed, Please try again", 500);
    return next(error);
  }

  res.status(200).json({ meassage: "Deleted" });
};
