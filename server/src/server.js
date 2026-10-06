import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";

import { registerRoutes } from "./routes.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());

// Uploaded files ko browser se access karne ke liye
app.use(
  "/uploads",
  express.static(path.resolve("uploads"))
);

app.get("/api/health", (_req, res) => {
  res.json({
    message: "SkillMatch AI API is running",
  });
});

registerRoutes(app);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `Server running on http://localhost:${PORT}`
      );
    });
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });