import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};


// Testimoni
const storageTestimoni = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads/testimoni/');
    createDirectory(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Reservasi
const storageReservasi = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads/reservasi/');
    createDirectory(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Users - Gambar
const storageUsersGambar = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads/users/gambar/');
    createDirectory(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Users - CV PDF
const storageUsersCV = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads/users/cv/');
    createDirectory(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Dokumentasi
const storageDokumentasi = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, 'uploads/dokumentasi_topung/');
    createDirectory(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});


// Upload Users (gambar + cv)
const uploadUsers = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'gambar') {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedImageTypes.includes(file.mimetype)) {
        return cb(new Error(`File gambar harus berupa gambar (jpg, png, jpeg, webp). Diterima: ${file.mimetype}`), false);
      }
    }

    if (file.fieldname === 'cv_pdf' && file.mimetype !== 'application/pdf') {
      return cb(new Error(`File CV harus berupa PDF. Diterima: ${file.mimetype}`), false);
    }

    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
}).fields([
  { name: 'gambar', maxCount: 1 },
  { name: 'cv_pdf', maxCount: 1 },
]);

// Upload Testimoni
const uploadTestimoni = multer({ 
  storage: storageTestimoni,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
      'video/mp4', 'video/avi', 'video/quicktime', 'video/webm'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`File harus berupa gambar (JPEG, PNG, JPG, WebP) atau video (MP4, AVI, MOV, WebM)!`), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Upload Dokumentasi
const uploadDokumentasi = multer({ 
  storage: storageDokumentasi,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/jpg', 'image/webp',
      'video/mp4', 'video/avi', 'video/quicktime', 'video/webm'
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`File harus berupa gambar (JPEG, PNG, JPG, WebP) atau video (MP4, AVI, MOV, WebM)!`), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Upload Reservasi
const uploadReservasi = multer({ 
  storage: storageReservasi,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File harus berupa gambar (jpg, png, jpeg)!'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: `File terlalu besar. Batas maksimum adalah 5 MB.` });
    }
    return res.status(400).json({ msg: err.message });
  } else if (err) {
    return res.status(400).json({ msg: err.message });
  }
  next();
};

export { uploadTestimoni, uploadDokumentasi, uploadReservasi, uploadUsers };
