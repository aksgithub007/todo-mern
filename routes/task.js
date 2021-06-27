const express = require("express");

const { body } = require("express-validator");

const routes = express.Router();
const taskController = require("../controller/task-controller");
const CheckAuth = require("../middleware/auth-check");

routes.get("/:taskId", taskController.getTaskById);

routes.get("/user/:userId", taskController.getTasksByUserId);

routes.use(CheckAuth);

routes.post("/", [body("name").not().isEmpty()], taskController.createdTask);

routes.patch(
  "/:taskId",
  [body("name").not().isEmpty()],
  taskController.updateTask
);

routes.delete("/:taskId", taskController.deleteTask);
// routes.post("/", (req, res, next) => {
//   res.send("<h1>create new task here</h1>");
// });

// routes.patch("/:taskId", (req, res, next) => {
//   res.send("<h1>Edit task here</h1>");
// });

// routes.delete("/:taskId", (req, res, next) => {
//   res.send("<h1>delete task here</h1>");
// });

module.exports = routes;
