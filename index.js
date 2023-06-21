const express = require("express");
const dotenv = require("dotenv").config();
const routes = require("./routes");
const { checkApiKey } = require("./middleware/authMiddleware");

const port = process.env.PORT || 5000;

const app = express();

// check api key for all requests
app.get("*", checkApiKey);

app.use("/", routes);

app.listen(port, () => console.log(`server started on port ${port}`));
