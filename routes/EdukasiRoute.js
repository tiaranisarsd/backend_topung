import express from "express";
import {
    getEdukasi,
    getEdukasiById,
    createEdukasi,
    updateEdukasi,
    deleteEdukasi
} from "../controllers/EdukasiController.js";
import { verifyUser } from "../middleware/AuthUser.js";

const router = express.Router();

router.get('/edukasi', getEdukasi);
router.get('/edukasi/:id', getEdukasiById);
router.post('/edukasi', verifyUser, createEdukasi);
router.patch('/edukasi/:id', verifyUser, updateEdukasi);
router.delete('/edukasi/:id', verifyUser, deleteEdukasi);


export default router;