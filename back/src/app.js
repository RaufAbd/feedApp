const express = require("express");
const path = require("path");

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const { graphqlHTTP } = require("express-graphql");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");
const auth = require("./middleware/auth");
const { throwError } = require("./utils/error");
const clearImage = require("./utils/clearImage");

const app = express();

const CONNECTION_STRING = {
  local: "mongodb://localhost:27017/feed",
  remote:
    "mongodb+srv://araxisr4:Df18gvd9ZN4MUOZE@cluster0.xeu9ywj.mongodb.net/feed?retryWrites=true&w=majority&appName=Cluster0",
};

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    cb(null, `${timestamp}-${file.originalname}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    throwError("Not authenticated!", 422);
  }

  if (!req.file) {
    throwError("No file provided!", 200);
  }

  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }

  const replacedPath = req.file.path.replace(/\\/g, "/");
  const postId = req.body.id;

  return res.status(201).json({
    message: "Image loaded successfully!",
    filePath: replacedPath,
    postId,
  });
});

app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn: (err) => {
      if (!err.originalError) {
        return err;
      }
      const { message, statusCode: code, data } = err.originalError;
      return { message, code, data };
    },
  })
);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  return res.status(status).json({ message, data });
});

mongoose
  .connect(CONNECTION_STRING.local)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
