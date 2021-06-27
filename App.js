const fs = require("fs");
const path = require("path");
//Thierd Party Package
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

//Global variable created
// function Initialize here
const app = express();
const userRoute = require("./routes/user");
const tasksRoute = require("./routes/task");
const HttpError = require("./model/http-error");

//Middleware Add Here
app.use(bodyParser.json());
app.use("/upload/images", express.static(path.join("upload", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE ");
  next();
});

app.use("/api/tasks", tasksRoute);
app.use("/api/user", userRoute);

//Handling route error

app.use((req, res, next) => {
  const error = new HttpError("Could not find that route", 404);
  throw error;
});

//adding error middleware
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "Unknown Error Occured" });
});

const host = "0.0.0.0";
const port = process.env.PORT || 8080;

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PWD}@cluster0.xhrwx.mongodb.net/${process.env.DB_NAME}`
  )
  .then((result) => {
    app.listen(port, host, function () {
      console.log("Server started.......");
    });
    // console.log(result);
    console.log("database connected", { useUnifiedTopology: true });
  })
  .catch((err) => {
    console.log(err);
  });

// Server Initialize Here
