require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const resumeRoutes = require("./routes/resumeRoutes");
const authRoutes = require("./routes/authRoutes");

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
app.use(express.json());  //Express automatically converts the JSON into a JavaScript object.
app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);


app.get("/", (req, res) => {
    res.send("Backend Working Successfully");
});



const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});