const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

//database (mongo) initializations
let db;
const MongoClient = require("mongodb").MongoClient;
const url = "secret phrase here";

MongoClient.connect(url, (err, client) => {
  db = client.db("webstore");
});

const ObjectID = require("mongodb").ObjectID;

// logger middleware function
const logger_middleware = (req, res, next) => {
  //logs the requests to the server console
  console.log(
    "\n[!] Request Url: " +
      req.url +
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

  // console.log(check, req.url);

  // if the request is not an image request continue
  if (!check) {
    next();
    return;
  }

  let filePath = path.join(__dirname, "static", req.url.split("/")[2]);

  fs.stat(filePath, (err, fileInfo) => {
    if (err) {
      if (err.code === "ENOENT") {
        res.status(404);
        res.send("[0] Image file not Found !!");
      } else {
        console.log(err); //logs error to the console
        res.send("[0] An Error occured!!");
      }
      return;
    }
    if (fileInfo.isFile()) {
      res.sendFile(filePath);
    } else {
      next();
    }
  });
};

app.use(express.json());
app.use(cors());
app.set("port", 3000);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-headers", "*");
  next();
});

//adds logger middleware to the application
app.use(logger_middleware);

//adds custom static lesson image middleware to the application
app.use(image_middleware);

app.get("/", (req, res, next) => {
  res.send("Select a lesson, e.g .. .. //collection/lessons");
});

app.param("collectionName", (req, res, next, collectionName) => {
  req.collection = db.collection(collectionName);
  return next();
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
    console.log(results.result.n, "within post function");
    if (results.result.n === 1) {
      res.send({ msg: "success" });
    } else {
      res.send({ msg: "Some error occurred" });
    }
  });
});

app.get("/collection/:collectionName/:searchTerm", (req, res, next) => {
  let value = parseInt(req.params.searchTerm) || req.params.searchTerm;
  value = new RegExp(value, "gi");
  req.collection
    .find({
      $or: [
        { availableSpace: { $regex: value } },
        { location: { $regex: value } },
        { price: { $regex: value } },
        { subject: { $regex: value } },
      ],
    })
    .toArray((err, results) => {
      if (err) return next(err);
      res.send(results);
    });
});

app.put("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.update(
    { _id: new ObjectID(req.params.id) },
    { $set: req.body },
    { safe: true, multi: false },
    (e, result) => {
      if (e) return next(e);
      res.send(result.result.n === 1 ? { msg: "success" } : { msg: "error" });
    }
  );
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("\n\n [0] Server Running at localhost:" + port + "\n\n");
});
