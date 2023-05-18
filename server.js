const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

//database (mongo) initializations
let db;
const MongoClient = require("mongodb").MongoClient;
const url = "mongodb+srv://wednesday:pacman1234@cluster0.vjw7i5w.mongodb.net/";

MongoClient.connect(url, (err, client) => {
  db = client.db("webstore");
});

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

  console.log(check, req.url);

  if (!check) {
    next();
    return;
  }

  let filePath = path.join(__dirname, "static", req.url);
  fs.stat("filePath", (err, fileInfo) => {
    if (err) {
      console.log(err); //logs error to the console
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

//adds custom static lesson image middleware to the application
app.use(image_middleware);

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
});

app.get("/", (req, res, next) => {
  res.send("Select a lesson, e.g .. .. //collection/lessons");
});

app.get("/collection/:collectionName", (req, res, next) => {
  req.collection.find({}).toArray((e, results) => {
    if (e) return next(e);
    res.send(results);
  });
});

app.post("/collection/:collectionName", (req, res, next) => {
  req.collection.insert(req.body, (e, results) => {
    if (e) return next(e);
    res.send(results.ops);
  });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("\n\n [0] Server Running at localhost:" + port + "\n\n");
});
