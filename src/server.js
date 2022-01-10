const express = require("express");
const app = express();
const port = process.env.PORT || 8090;
const cors = require("cors");

app.use(cors());
app.use(express.static("dist"));

app.listen(port, () =>
  console.log(`Looker BQML app listening on port ${port}!`)
);
