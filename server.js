const express = require("express");
const connectDB = require("./config/db");

const path = require("path");
const bodyParser = require("body-parser");

var cors = require("cors");

const app = express();
app.use(cors());

// Connect Database

// Connect Database
connectDB();

// Init Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
// Define Routes

const users = require("./routes/api/users");
const auth = require("./routes/api/auth");
const profile = require("./routes/api/profile");
const connections = require("./routes/api/connections");
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/profile", profile);
app.use("/api/connections", connections);

// // Serve static assets in production
// if (process.env.NODE_ENV === "production") {
//   // Set static folder
//   app.use(express.static("client/build"));

//   app.get("*", (req, res) => {
//     res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
//   });
// }

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
