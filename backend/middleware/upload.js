const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const modelsDir = path.join(__dirname, '../uploads/models');
const imagesDir = path.join(__dirname, '../uploads/images');

[modelsDir, imagesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const createStorage = (destination) => multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, destination),
  filename: (_req, file, cb) => {
    cb(null, `${uuidv4()}${path.extname(file.originalname).toLowerCase()}`);
  }
});

const modelFilter = (_req, file, cb) => {
  const allowed = ['.stl', '.obj'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid model file. Allowed: STL, OBJ'), false);
  }
};

const imageFilter = (_req, file, cb) => {
  const allowed = ['.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image. Allowed: JPG, PNG, WebP'), false);
  }
};

const upload = multer({
  storage: createStorage(modelsDir),
  fileFilter: modelFilter,
  limits: { fileSize: 50 * 1024 * 1024 }
});

const uploadImages = multer({
  storage: createStorage(imagesDir),
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }
});

const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File too large. Images max 5MB each.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Too many files. Maximum is 5 images.' });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message });
  }
  next();
};

module.exports = { upload, uploadImages, handleUploadError };
