import express from "express";
import {
    getUsers,
    getUsersById,
    createUsers,
    updateUsers,
    deleteUsers
} from "../controllers/UsersController.js";
import { verifyUser, ownerOnly } from "../middleware/AuthUser.js";
import { uploadUsers, handleMulterError } from "../multerCloudinary.js";

const router = express.Router();

router.get('/users', getUsers);
router.get('/users/:id', verifyUser, getUsersById);
router.post('/users', uploadUsers, verifyUser, ownerOnly, handleMulterError, createUsers);
router.patch('/users/:id', uploadUsers, verifyUser, handleMulterError, updateUsers);
router.delete('/users/:id', verifyUser, deleteUsers);

export default router;
