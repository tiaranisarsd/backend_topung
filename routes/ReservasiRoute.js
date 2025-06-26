import express from "express";
import {
    getReservasi,
    getReservasiById,
    createReservasi,
    getAvailableJadwalTerapis,
    getStatus,
    updateReservasiStatus,
    updateReservasi,
    deleteReservasi
} from "../controllers/ReservasiController.js";
import { verifyUser } from "../middleware/AuthUser.js";
import { uploadReservasi } from "../multerCloudinary.js";

const router = express.Router();

router.get('/reservasi',verifyUser, getReservasi);
router.get('/reservasi/:id',verifyUser, getReservasiById);
router.get('/availableJadwalTerapis', getAvailableJadwalTerapis);
router.patch('/reservasi/status', updateReservasiStatus);
router.get('/status', getStatus);
router.post('/reservasi', uploadReservasi.single('bukti_pembayaran'), createReservasi);
router.patch('/reservasi/:id', verifyUser, uploadReservasi.single('bukti_pembayaran'), updateReservasi);
router.delete('/reservasi/:id', verifyUser, deleteReservasi);


export default router;