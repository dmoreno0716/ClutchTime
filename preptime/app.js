const express = require("express");
const admin = require("firebase-admin");
const app = express();
var cors = require("cors");
var bodyParser = require("body-parser");

app.use(cors());

// Add body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Firebase Admin SDK
const serviceAccount = require("./config/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Make the Firebase admin SDK available to your routes
app.locals.admin = admin;

// Import routes
const usersRoutes = require("./routes/users");
const dashboardRoutes = require("./routes/dashboard");
const newsRoutes = require("./routes/news");

// Use routes
app.use("/users", usersRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/news", newsRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
