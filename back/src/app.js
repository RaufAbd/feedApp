const express = require("express");
const path = require("path");

const mongoose = require("mongoose");

const feedRoutes = require("./routes/feed");

const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", feedRoutes);

app.use((error, req, res, next) => {
  console.log(error);

  const status = error.statusCode || 500;
  const message = error.message;

  return res.status(status).json({ message });
});

mongoose
  .connect(
    "mongodb+srv://araxisr4:Df18gvd9ZN4MUOZE@cluster0.xeu9ywj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
