import express from "express";
import {
    getPertanyaan,
    getPertanyaanById,
    createPertanyaan,
    updatePertanyaan,
    deletePertanyaan
} from "../controllers/PertanyaanController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/pertanyaan', getPertanyaan);
router.get('/pertanyaan/:id', getPertanyaanById);
router.post('/pertanyaan', verifyUser, createPertanyaan);
router.patch('/pertanyaan/:id', verifyUser, updatePertanyaan);
router.delete('/pertanyaan/:id', verifyUser, deletePertanyaan);


export default router;