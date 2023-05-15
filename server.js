const express = require("express");
const cors = require("cors");
const app = express();


//database (mongo) initializations
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb+srv://wednesday:pacman1234@cluster0.vjw7i5w.mongodb.net/";

MongoClient.connect(url, (err, client)=>{
    db = client.db('webstore')
})

app.get('/', (req, res, next)=>{
    res.send('Select a collection, e.g .. .. //collection/messages')
})

let db;
const ObjectID = require("mongodb").ObjectID;

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

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log("\n\n [0] Server Running at localhost:" + port + "\n\n");
});
