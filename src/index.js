const express = require("express");
require("dotenv").config();
const routes=require("./routes/routes");
const app = express();

app.use('/api',routes);

app.listen(process.env.PORT, () => {
  console.log("listening on port " + process.env.PORT);
});

