import express from "express";
import {
    getDokumentasi,
    getDokumentasiById,
    createDokumentasi,
    updateDokumentasi,
    deleteDokumentasi
} from "../controllers/DokumentasiController.js";
import { verifyUser } from "../middleware/AuthUser.js";
import { uploadDokumentasi, handleMulterError } from "../multerCloudinary.js";

const router = express.Router();

router.get('/dokumentasi', getDokumentasi);
router.get('/dokumentasi/:id', getDokumentasiById);
router.post('/dokumentasi', verifyUser, uploadDokumentasi.single('gambar'), handleMulterError, createDokumentasi);
router.patch('/dokumentasi/:id', verifyUser, uploadDokumentasi.single('gambar'), handleMulterError, updateDokumentasi);
router.delete('/dokumentasi/:id', verifyUser, deleteDokumentasi);


export default router;