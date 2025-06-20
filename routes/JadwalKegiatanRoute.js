import express from "express";
import {
    getJadwalKegiatan,
    getJadwalKegiatanById,
    createJadwalKegiatan,
    updateJadwalKegiatan,
    deleteJadwalKegiatan
} from "../controllers/JadwalKegiatanController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/jadwalKegiatan', getJadwalKegiatan);
router.get('/jadwalKegiatan/:id', getJadwalKegiatanById);
router.post('/jadwalKegiatan', verifyUser, createJadwalKegiatan);
router.patch('/jadwalKegiatan/:id', verifyUser, updateJadwalKegiatan);
router.delete('/jadwalKegiatan/:id', verifyUser, deleteJadwalKegiatan);


export default router;