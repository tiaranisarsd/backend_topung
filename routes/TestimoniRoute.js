import express from "express";
import {
    getTestimoni,
    getTestimoniById,
    createTestimoni,
    updateTestimoni,
    deleteTestimoni
} from "../controllers/TestimoniController.js";
import { verifyUser } from "../middleware/AuthUser.js";
import { uploadTestimoni, handleMulterError } from "../multerCloudinary.js";

const router = express.Router();

router.get('/testimoni', getTestimoni);
router.get('/testimoni/:id', getTestimoniById);
router.post('/testimoni', verifyUser, uploadTestimoni.single('media'), handleMulterError, createTestimoni);
router.patch('/testimoni/:id', verifyUser, uploadTestimoni.single('media'), handleMulterError, updateTestimoni);
router.delete('/testimoni/:id', verifyUser, deleteTestimoni);


export default router;