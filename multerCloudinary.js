import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Helper function to create directory if it doesn't exist
const createDirectory = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Configuration for Testimoni uploads
const storageTestimoni = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads/testimoni/');
    createDirectory(dir); // Ensure the directory exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configuration for Reservasi uploads
const storageReservasi = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads/reservasi/');
    createDirectory(dir); // Ensure the directory exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configuration for Users Gambar uploads (Image files)
const storageUsersGambar = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads/users/gambar/');
    createDirectory(dir); // Ensure the directory exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Configuration for Users CV PDF uploads (PDF files)
const storageUsersCV = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads/users/cv/');
    createDirectory(dir); // Ensure the directory exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Use memory storage for multer and validate files before uploading
const uploadUsers = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'gambar') {
      // Check if the file is an image (starts with 'image/')
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedImageTypes.includes(file.mimetype)) {
        return cb(new Error(`File gambar harus berupa gambar (jpg, png, jpeg, webp). Diterima: ${file.mimetype}`), false);
      }
    }

    // Check if the file is a PDF for 'cv_pdf'
    if (file.fieldname === 'cv_pdf' && file.mimetype !== 'application/pdf') {
      return cb(new Error(`File CV harus berupa PDF. Diterima: ${file.mimetype}`), false);
    }

    // Allow the file upload
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
}).fields([
  { name: 'gambar', maxCount: 1 },
  { name: 'cv_pdf', maxCount: 1 },
]);

const uploadTestimoni = multer({ 
  storage: storageTestimoni,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'image/webp', 
      'video/mp4', 
      'video/avi', 
      'video/quicktime', 
      'video/webm' 
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`File harus berupa gambar (JPEG, PNG, JPG, WebP) atau video (MP4, AVI, MOV, WebM)!`), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Configuration for Dokumentasi uploads
const storageDokumentasi = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(process.cwd(), 'uploads/dokumentasi_topung/');
    createDirectory(dir); // Ensure the directory exists
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const uploadDokumentasi = multer({ 
  storage: storageDokumentasi,
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 
      'image/png', 
      'image/jpg', 
      'image/webp', 
      'video/mp4', 
      'video/avi', 
      'video/quicktime', 
      'video/webm' 
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error(`File harus berupa gambar (JPEG, PNG, JPG, WebP) atau video (MP4, AVI, MOV, WebM)!`), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// Middleware untuk menangani kesalahan multer (opsional, tambahkan di rute)
export const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Check if the error is due to file size limit
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ msg: `File terlalu besar. Batas maksimum adalah 5 MB.` });
    }
    // Handle other Multer errors
    return res.status(400).json({ msg: err.message });
  } else if (err) {
    // Handle other types of errors
    return res.status(400).json({ msg: err.message });
  }
  next();
};

const uploadReservasi = multer({ 
  storage: storageReservasi,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error('File harus berupa gambar (jpg, png, jpeg)!'), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

// Export the multer configuration for other files
export { uploadTestimoni, uploadDokumentasi, uploadReservasi, uploadUsers };
