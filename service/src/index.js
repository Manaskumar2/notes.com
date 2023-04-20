
const dotenv = require("dotenv");
const express = require("express");
const route = require("./route/route");
const mongoose = require("mongoose");
const path = require("path");
const app = express();

const multer = require("multer");

app.use(express.json());
const upload = multer();
app.use(upload.any());


dotenv.config({ path: ".env.dev" })
let DATABASE = process.env.DATABASE;
let PORT = process.env.PORT;

mongoose.set("strictQuery", true);
mongoose.connect(DATABASE, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDb is connected"))
  .catch((err) => console.log(err));


app.use("/api", route);

app.use((req, res, next) => {
  const error = new Error("Path not found.");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.send({
    error: {
      status: error.status || 500,
      message: error.message,
    },
  });
});

app.listen(process.env.PORT||3333, function () {
  console.log(`Express app running on ${PORT}`);
});