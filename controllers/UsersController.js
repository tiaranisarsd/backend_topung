import { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import cloudinary from '../cloudinaryConfig.js'; // Ensure correct path to your Cloudinary config
import streamifier from 'streamifier';

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
    // Check if user is authenticated (e.g., owner role check)
    if (!req.user) {
      return res.status(401).json({ msg: "User tidak terautentikasi. Silakan login." });
    }

    const { role } = req.user;
    if (role !== 'owner') {
      return res.status(403).json({ msg: "Akses ditolak. Hanya owner yang dapat membuat user baru." });
    }

    // Handle form fields
    const { nama, email, password, confPassword, role: userRole, no_telp, harga, alamat, bank, no_rekening } = req.body;

    if (!nama || !email || !password || !confPassword || !userRole ) {
      return res.status(400).json({ msg: "Nama, email, password, konfirmasi password, dan role wajib diisi." });
    }

    if (password !== confPassword) {
      return res.status(400).json({ msg: "Password dan Konfirmasi Password tidak cocok." });
    }

    // Check if email already exists
    const existingUser = await prisma.users.findFirst({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email sudah terdaftar." });
    }

    // Hash the password
    const hashPassword = await argon2.hash(password);

    // Handle file uploads using Cloudinary
    let gambar = '';
    let cv_pdf = '';

    console.log('Files received:', req.files);

    if (req.files && req.files['gambar'] && req.files['gambar'].length > 0) {
      const file = req.files['gambar'][0];
      console.log(`Uploading gambar to Cloudinary: ${file.originalname}, Type: ${file.mimetype}`);
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({
            folder: 'users/gambar',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 500, height: 500, crop: 'thumb', gravity: 'face' }],
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
        gambar = result.secure_url;
        console.log(`Gambar uploaded successfully: ${gambar}`);
      } catch (error) {
        console.error(`Error uploading gambar to Cloudinary: ${error.message}`);
        return res.status(500).json({ msg: "Gagal mengunggah gambar ke Cloudinary.", error: error.message });
      }
    }

    if (req.files && req.files['cv_pdf'] && req.files['cv_pdf'].length > 0) {
      const file = req.files['cv_pdf'][0];
      console.log(`Uploading cv_pdf to Cloudinary: ${file.originalname}, Type: ${file.mimetype}`);
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({
            folder: 'users/cv',
            resource_type: 'raw',
            allowed_formats: ['pdf'],
            public_id: `cv_${nama.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`, // Tambahkan ekstensi .pdf di public_id
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
        cv_pdf = result.secure_url;
        console.log(`CV PDF uploaded successfully: ${cv_pdf}`);
      } catch (error) {
        console.error(`Error uploading cv_pdf to Cloudinary: ${error.message}`);
        return res.status(500).json({ msg: "Gagal mengunggah CV PDF ke Cloudinary.", error: error.message });
      }
    }

    // Create the user
    const newUser = await prisma.users.create({
      data: {
        nama,
        email,
        password: hashPassword,
        role: userRole || 'terapis',
        gambar: gambar || null,
        no_telp: no_telp || null,
        harga: harga || null,
        bank: bank || null,
        no_rekening: no_rekening || null,
        alamat: alamat || null,
        cv_pdf: cv_pdf || null,
      },
    });

    res.status(201).json({ msg: "User berhasil dibuat.", data: newUser });
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
      return res.status(401).json({ msg: 'User tidak terautentikasi. Silakan login.' });
    }

    const { id } = req.params;
    const { role } = req.user;

    if (role === 'owner') {
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

      return res.status(200).json(user);
    } else {
      if (Number(id) !== req.user.id) {
        return res.status(403).json({ msg: 'Tidak bisa melihat data yang bukan akun Anda.' });
      }

      const user = await prisma.users.findUnique({
        where: {
          id: req.user.id,
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

      return res.status(200).json(user);
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ msg: "Terjadi kesalahan server.", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

export const updateUsers = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ msg: 'User tidak terautentikasi. Silakan login.' });
    }

    const { id } = req.params;
    const { role } = req.user;

    const user = await prisma.users.findUnique({
      where: {
        id: Number(id),
      },
    });

    if (!user) {
      return res.status(404).json({ msg: "User tidak ditemukan." });
    }

    // Allow edit if the user is an owner or if they are editing their own account
    if (role !== 'owner' && user.id !== Number(req.user.id)) {
      return res.status(403).json({ msg: 'Tidak bisa mengedit data yang bukan akun Anda.' });
    }

    const { nama: newNama, email, no_telp, bank, no_rekening, alamat, password, role: newRole, confPassword, harga } = req.body;
    let hashPassword = user.password;
    const jadwalId = req.body.jadwalId ? parseInt(req.body.jadwalId, 10) : user.jadwalId;

    if (password && password !== confPassword) {
      return res.status(400).json({ msg: "Password dan Konfirmasi Password tidak cocok." });
    }

    if (password) {
      hashPassword = await argon2.hash(password);
    }

    // Handle file uploads using Cloudinary
    let gambar = user.gambar;
    let cv_pdf = user.cv_pdf;

    if (req.files && req.files['gambar'] && req.files['gambar'].length > 0) {
      const file = req.files['gambar'][0];
      console.log(`Uploading new gambar to Cloudinary: ${file.originalname}, Type: ${file.mimetype}`);
      try {
        // Delete old gambar from Cloudinary if it exists
        if (user.gambar) {
          try {
            const urlParts = user.gambar.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const publicId = fileName.split('.')[0];
            const folderPath = urlParts[urlParts.length - 2];
            if (folderPath === 'gambar') {
              const fullPublicId = `users/gambar/${publicId}`;
              console.log(`Attempting to delete old gambar from Cloudinary: ${fullPublicId}`);
              const deleteResult = await cloudinary.uploader.destroy(fullPublicId);
              console.log(`Delete result for gambar: ${JSON.stringify(deleteResult)}`);
              if (deleteResult.result === 'ok') {
                console.log(`Old gambar deleted successfully from Cloudinary: ${fullPublicId}`);
              } else {
                console.warn(`Failed to delete old gambar from Cloudinary: ${fullPublicId}, continuing with upload.`);
              }
            } else {
              console.warn(`Unexpected folder path for gambar: ${folderPath}, skipping deletion.`);
            }
          } catch (deleteError) {
            console.error(`Error deleting old gambar from Cloudinary: ${deleteError.message}`);
            // Continue with upload even if deletion fails
          }
        }
        // Upload new gambar
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({
            folder: 'users/gambar',
            allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
            transformation: [{ width: 500, height: 500, crop: 'thumb', gravity: 'face' }],
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
        gambar = result.secure_url;
        console.log(`New gambar uploaded successfully: ${gambar}`);
      } catch (error) {
        console.error(`Error uploading new gambar to Cloudinary: ${error.message}`);
        return res.status(500).json({ msg: "Gagal mengunggah gambar ke Cloudinary.", error: error.message });
      }
    }

    if (req.files && req.files['cv_pdf'] && req.files['cv_pdf'].length > 0) {
      const file = req.files['cv_pdf'][0];
      console.log(`Uploading new cv_pdf to Cloudinary: ${file.originalname}, Type: ${file.mimetype}`);
      try {
        // Delete old cv_pdf from Cloudinary if it exists
        if (user.cv_pdf) {
          try {
            const urlParts = user.cv_pdf.split('/');
            const fileName = urlParts[urlParts.length - 1];
            const publicId = fileName.split('.')[0];
            const folderPath = urlParts[urlParts.length - 2];
            if (folderPath === 'cv') {
              const fullPublicId = `users/cv/${publicId}`;
              console.log(`Attempting to delete old cv_pdf from Cloudinary: ${fullPublicId}`);
              const deleteResult = await cloudinary.uploader.destroy(fullPublicId, { resource_type: 'raw' });
              console.log(`Delete result for cv_pdf: ${JSON.stringify(deleteResult)}`);
              if (deleteResult.result === 'ok') {
                console.log(`Old cv_pdf deleted successfully from Cloudinary: ${fullPublicId}`);
              } else {
                console.warn(`Failed to delete old cv_pdf from Cloudinary: ${fullPublicId}, continuing with upload.`);
              }
            } else {
              console.warn(`Unexpected folder path for cv_pdf: ${folderPath}, skipping deletion.`);
            }
          } catch (deleteError) {
            console.error(`Error deleting old cv_pdf from Cloudinary: ${deleteError.message}`);
            // Continue with upload even if deletion fails
          }
        }
        // Upload new cv_pdf with .pdf extension in public_id
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream({
            folder: 'users/cv',
            resource_type: 'raw',
            allowed_formats: ['pdf'],
            public_id: `cv_${newNama ? newNama.replace(/[^a-zA-Z0-9]/g, '_') : user.nama.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.pdf`, // Tambahkan ekstensi .pdf di public_id
          }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          });
          streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
        cv_pdf = result.secure_url;
        console.log(`New CV PDF uploaded successfully: ${cv_pdf}`);
      } catch (error) {
        console.error(`Error uploading new cv_pdf to Cloudinary: ${error.message}`);
        return res.status(500).json({ msg: "Gagal mengunggah CV PDF ke Cloudinary.", error: error.message });
      }
    }

    // Update the user
    try {
      await prisma.users.update({
        where: {
          id: Number(id),
        },
        data: {
          gambar: gambar,
          nama: newNama || user.nama,
          email: email || user.email,
          no_telp: no_telp || user.no_telp,
          harga: harga || user.harga,
          bank: bank || user.bank,
          no_rekening: no_rekening || user.no_rekening,
          alamat: alamat || user.alamat,
          jadwalId: jadwalId,
          password: hashPassword,
          role: newRole || user.role,
          cv_pdf: cv_pdf,
        },
      });
      res.status(200).json({ msg: "User berhasil diperbarui." });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(400).json({ msg: "Gagal memperbarui user.", error: error.message });
    }
  } catch (error) {
    console.error('Error in updateUsers:', error);
    res.status(500).json({ msg: "Terjadi kesalahan server.", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};

export const deleteUsers = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ msg: 'User tidak terautentikasi. Silakan login.' });
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
      return res.status(404).json({ msg: "User tidak ditemukan." });
    }

    // Function to extract public_id from Cloudinary URL
    const extractPublicId = (url) => {
      if (!url) return null;
      try {
        const parts = url.split('/upload/');
        if (parts.length < 2) return null;
        const afterUpload = parts[1];
        const segments = afterUpload.split('/');
        // Find version segment (starts with 'v' followed by numbers)
        const versionIndex = segments.findIndex(s => s.startsWith('v') && !isNaN(parseInt(s.substring(1))));
        if (versionIndex === -1) return null;
        // Join segments after version to get the full path
        const publicIdPath = segments.slice(versionIndex + 1).join('/');
        // Return public_id with and without extension for testing
        const publicIdWithExt = publicIdPath;
        const publicIdWithoutExt = publicIdPath.split('.')[0];
        return { withExt: publicIdWithExt, withoutExt: publicIdWithoutExt };
      } catch (error) {
        console.error(`Error extracting public_id from URL: ${url}`, error);
        return null;
      }
    };

    // Delete the user's image (gambar) from Cloudinary if it exists
    if (user.gambar) {
      const publicIdObj = extractPublicId(user.gambar);
      if (!publicIdObj) {
        console.warn(`Peringatan: Gagal mengekstrak Public ID dari URL gambar: ${user.gambar}. Gambar mungkin tidak terhapus dari Cloudinary.`);
      } else {
        try {
          const publicId = publicIdObj.withoutExt; // Gambar biasanya tanpa ekstensi
          const cloudinaryResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
          console.log("Hasil penghapusan gambar dari Cloudinary:", cloudinaryResult);
          if (cloudinaryResult.result === 'not found') {
            console.warn(`Peringatan: Gambar dengan Public ID "${publicId}" tidak ditemukan di Cloudinary. Mungkin sudah dihapus atau ID salah.`);
          } else if (cloudinaryResult.result !== 'ok') {
            console.error(`Error: Gagal menghapus gambar dari Cloudinary. Pesan: ${cloudinaryResult.result}`);
          } else {
            console.log(`Gambar dengan Public ID "${publicId}" berhasil dihapus dari Cloudinary.`);
          }
        } catch (cloudinaryError) {
          console.error("Kesalahan umum saat memproses penghapusan gambar dari Cloudinary:", cloudinaryError);
        }
      }
    }

    if (user.cv_pdf) {
      const publicIdObj = extractPublicId(user.cv_pdf);
      if (!publicIdObj) {
        console.warn(`Peringatan: Gagal mengekstrak Public ID dari URL CV: ${user.cv_pdf}. File PDF mungkin tidak terhapus dari Cloudinary.`);
      } else {
        try {
          let publicId = publicIdObj.withExt;
          console.log(`Mencoba menghapus CV dengan Public ID (dengan ekstensi): "${publicId}"`);
          let cloudinaryResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
          console.log("Hasil penghapusan CV dari Cloudinary (dengan ekstensi):", cloudinaryResult);

          if (cloudinaryResult.result === 'not found') {
            // If not found with extension, try without extension
            publicId = publicIdObj.withoutExt;
            console.log(`Mencoba menghapus CV dengan Public ID (tanpa ekstensi): "${publicId}"`);
            cloudinaryResult = await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
            console.log("Hasil penghapusan CV dari Cloudinary (tanpa ekstensi):", cloudinaryResult);
          }

          if (cloudinaryResult.result === 'not found') {
            console.warn(`Peringatan: CV dengan Public ID "${publicId}" tidak ditemukan di Cloudinary. Mungkin sudah dihapus atau ID salah.`);
          } else if (cloudinaryResult.result !== 'ok') {
            console.error(`Error: Gagal menghapus CV dari Cloudinary. Pesan: ${cloudinaryResult.result}`);
          } else {
            console.log(`CV dengan Public ID "${publicId}" berhasil dihapus dari Cloudinary.`);
          }
        } catch (cloudinaryError) {
          console.error("Kesalahan umum saat memproses penghapusan CV dari Cloudinary:", cloudinaryError);
        }
      }
    }

    await prisma.users.delete({
      where: {
        id: Number(id),
      },
    });

    res.status(200).json({ msg: "User berhasil dihapus." });
  } catch (error) {
    console.error('Error in deleteUsers:', error);
    res.status(500).json({ msg: "Terjadi kesalahan server.", error: error.message });
  } finally {
    await prisma.$disconnect();
  }
};


