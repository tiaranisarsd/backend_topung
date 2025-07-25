import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from '@prisma/client';
import UsersRoute from "./routes/UsersRoute.js";
import AuthRoute from "./routes/AuthRoute.js";
import EdukasiRoute from "./routes/EdukasiRoute.js";
import JadwalKegiatanRoute from "./routes/JadwalKegiatanRoute.js";
import JadwalTerapisRoute from "./routes/JadwalTerapisRoute.js";
import DokumentasiRoute from "./routes/DokumentasiRoute.js";
import TestimoniRoute from "./routes/TestimoniRoute.js";
import PertanyaanRoute from "./routes/PertanyaanRoute.js";
import TinjauanRoute from "./routes/TinjauanRoute.js";
import ReservasiRoute from "./routes/ReservasiRoute.js";
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, 'uploads');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/users', express.static(path.join(__dirname, 'uploads', 'users')));

app.get('/', (req, res) => {
    res.send('Backend Berjalan!');
});

app.use(cors({
    credentials: true,
    origin: 3000
}));

app.use((req, res, next) => {
  res.setHeader('Permissions-Policy', "accelerometer=(self 'https://www.tiktok.com')");
  next();
});

app.use(express.json());
app.use(UsersRoute);
app.use(AuthRoute);
app.use(EdukasiRoute);
app.use(JadwalKegiatanRoute);
app.use(JadwalTerapisRoute);
app.use(DokumentasiRoute);
app.use(TestimoniRoute);
app.use(PertanyaanRoute);
app.use(TinjauanRoute);
app.use(ReservasiRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`Server berjalan di port ${port}`);
});

