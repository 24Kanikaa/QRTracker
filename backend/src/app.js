const express = require("express");
const cors = require("cors");

const routes = require("./routes");

const errorHandler = require("./middleware/errorHandler");
const cookieParser = require("cookie-parser");

const app = express();

app.use(cors(
    {origin: process.env.FRONTEND_URL,
    credentials: true,}
));
app.use(cookieParser());
app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));
// app.use((req, res, next) => {
//     console.log("Incoming:", req.method, req.originalUrl);
//     next();
// });
app.use("/api", routes);

app.use(errorHandler);

module.exports = app;