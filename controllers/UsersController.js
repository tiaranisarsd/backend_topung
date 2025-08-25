import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '../uploads/users');

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
  try {
    const response = await prisma.users.findMany({
      select: {
        id: true,
        nama: true,
        email: true,
        gambar: true,
        role: true,
        no_telp: true,
        harga: true,
        bank: true,
        no_rekening: true,
        alamat: true,
        cv_pdf: true,
        jadwal_terapis: {
          select: {
            hari: true,
            jam: true
          }
        }
      }
    });
    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ msg: "Terjadi kesalahan saat memuat data users.", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

export const createUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: "User  tidak terautentikasi. Silakan login." });
    }

    const { role } = req.user;
    if (role !== 'owner') {
      return res.status(403).json({ msg: "Akses ditolak. Hanya owner yang dapat membuat user baru." });
    }

    const { nama, email, password, confPassword, role: userRole, no_telp, harga, alamat, bank, no_rekening } = req.body;

    if (!nama || !email || !password || !confPassword || !userRole) {
      return res.status(400).json({ msg: "Nama, email, password, konfirmasi password, dan role wajib diisi." });
    }

    if (password !== confPassword) {
      return res.status(400).json({ msg: "Password dan Konfirmasi Password tidak cocok." });
    }

    const existingUser  = await prisma.users.findFirst({ where: { email } });
    if (existingUser ) {
      return res.status(400).json({ msg: "Email sudah terdaftar." });
    }

    const hashPassword = await argon2.hash(password);

    let gambar = null;
    let cv_pdf = null;

    if (req.files && req.files['gambar'] && req.files['gambar'].length > 0) {
      const file = req.files['gambar'][0];
      gambar = path.join('gambar', `${Date.now()}_${file.originalname}`); // Store relative path
      const fullPath = path.join(UPLOAD_DIR, 'gambar', `${Date.now()}_${file.originalname}`);
      fs.writeFileSync(fullPath, file.buffer);
      console.log(`New gambar uploaded successfully: ${fullPath}`);
    }

    if (req.files && req.files['cv_pdf'] && req.files['cv_pdf'].length > 0) {
      const file = req.files['cv_pdf'][0];
      const uploadPathDir = path.join(UPLOAD_DIR, 'cv');
      if (!fs.existsSync(uploadPathDir)) {
        fs.mkdirSync(uploadPathDir, { recursive: true });
      }
      cv_pdf = `/uploads/cv/${Date.now()}_${file.originalname}`; // Simpan path relatif untuk database
      const fullPath = path.join(uploadPathDir, `${Date.now()}_${file.originalname}`);
      fs.writeFileSync(fullPath, file.buffer);
      console.log(`New CV PDF uploaded successfully: ${fullPath}`);
    }

    // Create the user
    const newUser  = await prisma.users.create({
      data: {
        nama,
        email,
        password: hashPassword,
        role: userRole || 'terapis',
        gambar,
        no_telp: no_telp || null,
        harga: harga || null,
        bank: bank || null,
        no_rekening: no_rekening || null,
        alamat: alamat || null,
        cv_pdf,
      },
    });

    res.status(201).json({ msg: "User  berhasil dibuat.", data: newUser  });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ msg: "Terjadi kesalahan server.", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

export const getUsersById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'User  tidak terautentikasi. Silakan login.' });
    }

    const { id } = req.params;

    const user = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
      select: {
        id: true,
        gambar: true,
        nama: true,
        email: true,
        no_telp: true,
        harga: true,
        bank: true,
        no_rekening: true,
        alamat: true,
        cv_pdf: true,
        role: true,
        createdAt: true,
        jadwal_terapis: {
          select: {
            hari: true,
            jam: true
          }
        }
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "Data tidak ditemukan." });
    }
    console.log("Users Response:", user);
    return res.status(200).json(user);
    
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ msg: "Terjadi kesalahan server.", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

export const updateUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'User  tidak terautentikasi. Silakan login.' });
    }

    const { id } = req.params;
    const { role } = req.user;

    const user = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User  tidak ditemukan." });
    }

    if (role !== 'owner' && user.id !== Number(req.user.id)) {
      return res.status(403).json({ msg: 'Tidak bisa mengedit data yang bukan akun Anda.' });
    }

    const { nama: newNama, email, no_telp, bank, no_rekening, alamat, password, role: newRole, confPassword, harga } = req.body;
    let hashPassword = user.password;

    if (password && password !== confPassword) {
      return res.status(400).json({ msg: "Password dan Konfirmasi Password tidak cocok." });
    }

    if (password) {
      hashPassword = await argon2.hash(password);
    }

    let gambar = user.gambar;
    let cv_pdf = user.cv_pdf;

    if (req.files && req.files['gambar'] && req.files['gambar'].length > 0) {
      const file = req.files['gambar'][0];
      if (gambar) {
        const oldGambarPath = path.join(UPLOAD_DIR, gambar);
        if (fs.existsSync(oldGambarPath)) {
          fs.unlinkSync(oldGambarPath);
          console.log(`Old gambar deleted: ${oldGambarPath}`);
        }
      }
      gambar = path.join('gambar', `${Date.now()}_${file.originalname}`); // Store relative path
      const fullPath = path.join(UPLOAD_DIR, 'gambar', `${Date.now()}_${file.originalname}`);
      fs.writeFileSync(fullPath, file.buffer);
      console.log(`New gambar uploaded successfully: ${fullPath}`);
    }

    if (req.files && req.files['cv_pdf'] && req.files['cv_pdf'].length > 0) {
      if (cv_pdf) {
        const oldCvPdfPath = path.join(UPLOAD_DIR, cv_pdf);
        if (fs.existsSync(oldCvPdfPath)) {
          fs.unlinkSync(oldCvPdfPath);
          console.log(`Old CV PDF deleted: ${oldCvPdfPath}`);
        }
      }
      const file = req.files['cv_pdf'][0];
      cv_pdf = path.join('cv', `${Date.now()}_${file.originalname}`);
      const fullPath = path.join(UPLOAD_DIR, 'cv', `${Date.now()}_${file.originalname}`);
      fs.writeFileSync(fullPath, file.buffer);
      console.log(`New CV PDF uploaded successfully: ${fullPath}`);
    }

    // Update the user
    await prisma.users.update({
      where: {
        id: Number(id),
      },
      data: {
        gambar: gambar || user.gambar,
        nama: newNama || user.nama,
        email: email || user.email,
        no_telp: no_telp || user.no_telp,
        harga: harga || user.harga,
        bank: bank || user.bank,
        no_rekening: no_rekening || user.no_rekening,
        alamat: alamat || user.alamat,
        password: hashPassword,
        role: newRole || user.role,
        cv_pdf: cv_pdf || user.cv_pdf,
      },
    });

    res.status(200).json({ msg: "User  berhasil diperbarui." });
  } catch (error) {
    console.error('Error in updateUsers:', error);
    res.status(500).json({ msg: "Terjadi kesalahan server.", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteUsers = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ msg: 'User  tidak terautentikasi. Silakan login.' });
    }

    const { role } = req.user;
    if (role !== 'owner') {
      return res.status(403).json({ msg: "Akses ditolak. Hanya owner yang dapat menghapus user." });
    }

    const { id } = req.params;
    const user = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User  tidak ditemukan." });
    }

    if (user.gambar) {
      const gambarPath = path.join(__dirname, '..', 'uploads', 'users', user.gambar);
      fs.unlink(gambarPath, (err) => {
        if (err) {
          console.error(`Gagal menghapus gambar: ${gambarPath}`, err);
        } else {
          console.log(`Gambar berhasil dihapus: ${gambarPath}`);
        }
      });
    }

    if (user.cv_pdf) {
      const cvPath = path.join(__dirname, '..', 'uploads', 'users', user.cv_pdf);
      fs.unlink(cvPath, (err) => {
        if (err) {
          console.error(`Gagal menghapus CV: ${cvPath}`, err);
        } else {
          console.log(`CV berhasil dihapus: ${cvPath}`);
        }
      });
    }

    await prisma.users.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({ msg: "User  berhasil dihapus." });
  } catch (error) {
    console.error('Error in deleteUsers:', error);
    res.status(500).json({ msg: "Terjadi kesalahan server.", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};



