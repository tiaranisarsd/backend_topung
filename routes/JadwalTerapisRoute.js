import express from "express";
import {
    getJadwalTerapis,
    getJadwalTerapisById,
    getJadwalByUser,
    getJadwalByUserAndId,
    updateJadwalByUserAndId,
    createJadwalTerapis,
    updateJadwalTerapis,
    deleteJadwalTerapis
} from "../controllers/JadwalTerapisController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/jadwalTerapis', getJadwalTerapis);
router.get('/jadwalTerapis/:id', verifyUser, getJadwalTerapisById);
router.post('/jadwalTerapis', verifyUser, createJadwalTerapis);
router.patch('/jadwalTerapis/:id', verifyUser, updateJadwalTerapis);
router.delete('/jadwalTerapis/:id', verifyUser, deleteJadwalTerapis);
router.get('/jadwalTerapis/users/:userId', verifyUser, getJadwalByUser);
router.get('/jadwalTerapis/users/:userId/:id', verifyUser, getJadwalByUserAndId);
router.patch('/jadwalTerapis/users/:userId/:id', verifyUser, updateJadwalByUserAndId);

export default router;