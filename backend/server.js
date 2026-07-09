require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { clerkMiddleware } = require("@clerk/express");
const connectDB = require("./config/db");

const resumeRoutes = require("./routes/resumeRoutes");
const compareRoutes = require("./routes/compareRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

connectDB();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      process.env.FRONTEND_URL,
    ],
    credentials: true,
  })
);  //This allows your React app (localhost:5173) to talk to your backend.

// Clerk webhooks must be verified against the RAW request body,
// so mount them (with express.raw) BEFORE express.json().
app.use("/api/webhooks", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());  //Express automatically converts the JSON into a JavaScript object.

// Clerk — attaches auth to every request (verifies the session token)
app.use(clerkMiddleware());

app.use("/api/resume", resumeRoutes);
app.use("/api/compare", compareRoutes);


app.get("/", (req, res) => {
    res.send("Backend Working Successfully");
});



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});