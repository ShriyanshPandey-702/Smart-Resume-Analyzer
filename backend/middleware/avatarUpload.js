const multer = require("multer");
const path = require("path");

// Keep the image in memory so we can stream it straight to Cloudinary.
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = [".jpg", ".jpeg", ".png", ".webp", ".gif"];
  const extension = path.extname(file.originalname).toLowerCase();
  const isImageMime = file.mimetype.startsWith("image/");

  if (allowedTypes.includes(extension) && isImageMime) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP or GIF images are allowed."));
  }
};

const avatarUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3 MB
});

module.exports = avatarUpload;
