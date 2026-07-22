const express = require("express");
const cookieParser = require("cookie-parser");
const authRoutes = require("../routes/authRoutes");
const dogRoutes = require("../routes/dogRoutes");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(authRoutes);
app.use(dogRoutes);

module.exports = app;
