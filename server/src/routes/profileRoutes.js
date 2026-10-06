import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

import { auth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

router.use(auth);

// Resume upload folder
const uploadDir = path.resolve("uploads/resumes");

fs.mkdirSync(uploadDir, { recursive: true });

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    cb(
      null,
      `${req.user._id}-${Date.now()}${extension}`
    );
  },
});

// Only PDF, maximum 5 MB
const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      extension !== ".pdf" ||
      file.mimetype !== "application/pdf"
    ) {
      return cb(
        new Error("Only PDF resume files are allowed.")
      );
    }

    cb(null, true);
  },
});

// Get profile
router.get("/", async (req, res) => {
  try {
    const profile = await User.findById(req.user._id)
      .select("-password");

    res.json({ profile });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Update profile
router.put("/", async (req, res) => {
  try {
    const {
      name,
      skills,
      education,
      experience,
    } = req.body;

    const profile = await User.findByIdAndUpdate(
      req.user._id,
      {
        name,

        skills: Array.isArray(skills)
          ? skills
          : String(skills || "")
              .split(",")
              .map((skill) => skill.trim())
              .filter(Boolean),

        education,
        experience,
      },
      {
        new: true,
      }
    ).select("-password");

    res.json({ profile });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// Upload resume
router.post(
  "/resume",
  (req, res, next) => {
    upload.single("resume")(req, res, (error) => {
      if (error) {
        return res.status(400).json({
          message: error.message,
        });
      }

      next();
    });
  },

  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a PDF resume.",
        });
      }

      const resumeUrl =
        `/uploads/resumes/${req.file.filename}`;

      const profile = await User.findByIdAndUpdate(
        req.user._id,
        {
          resume: {
            name: req.file.originalname,
            url: resumeUrl,
          },
        },
        {
          new: true,
        }
      ).select("-password");

      res.json({
        message: "Resume uploaded successfully.",
        profile,
      });
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  }
);

export default router;