const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

//database (mongo) initializations
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb+srv://wednesday:pacman1234@cluster0.vjw7i5w.mongodb.net/";

MongoClient.connect(url, (err, client) => {
  db = client.db("webstore");
});

app.get;

let db;
const ObjectID = require("mongodb").ObjectID;

// logger middleware function
const logger_middleware = (req, res, next) => {
  //logs the requests to the server console
  console.log(
    "\n[!] Request Method: " +
      req.method +
      "\n[!] Request Body: " +
      JSON.stringify(req.body)
  );
  next();
};

//static lessons image middleware function
const image_middleware = (req, res, next) => {
  //checks if this is an image request
  let check = req.url.split("/")[1] === "images";
  if (!check) {
    next();
    return;
  }
  let filePath = path.join(__dirname, "static", req.url);
  fs.stat("filePath", (err, fileInfo) => {
    if (err) {
      next();
      return;
    }
    if (fileInfo.isFile()) {
      res.sendFile(filePath);
    } else {
      res.status(404);
      res.send("Image file not Found!");
    }
  });
};

app.use(express.json());
app.use(cors());
// app.set("port", 3000);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-headers", "*");
  next();
});

//adds logger middleware to the application
app.use(logger_middleware);

//adds custom static file middleware to the application

app.get("/", (req, res, next) => {
  res.send("Select a collection, e.g .. .. //collection/messages");
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("\n\n [0] Server Running at localhost:" + port + "\n\n");
});
