import express from "express";
import {Login, logOut, Me} from "../controllers/AuthController.js";

const router = express.Router();
import { verifyUser } from "../middleware/AuthUser.js";

router.get('/me', verifyUser, Me);
router.post('/login', Login);
router.delete('/logOut', logOut);

export default router;