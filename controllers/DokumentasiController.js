import { PrismaClient } from "@prisma/client";
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const createDokumentasi = async (req, res) => {
  const { judul } = req.body;
  const userId = req.user.id;

  try {
    let gambar = '';
    let thumbnail = '';
    if (req.file) {
      gambar = `/uploads/dokumentasi_topung/${req.file.filename}`;
      console.log(`File uploaded: ${gambar}, Type: ${req.file.mimetype}`);
      // Jika file adalah video, gunakan path placeholder untuk thumbnail
if (req.file.mimetype.startsWith('video/')) {
  thumbnail = ''; // Tidak mencoba membuat thumbnail
  console.log(`Skipping thumbnail generation for video.`);
}

      console.log(`File saved locally: ${gambar}`);
    }

    await prisma.dokumentasi.create({
      data: {
        gambar: gambar,
        thumbnail: thumbnail,
        judul: judul,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    res.status(201).json({ msg: "Dokumentasi Created Successfully" });
  } catch (error) {
    console.error("Error creating dokumentasi:", error);
    res.status(400).json({ msg: error.message || "Failed to create dokumentasi" });
  }
};

export const updateDokumentasi = async (req, res) => {
  const { id } = req.params;
  const { judul } = req.body;

  try {
    const dokumentasi = await prisma.dokumentasi.findUnique({
      where: { id: Number(id) },
    });

    if (!dokumentasi) {
      return res.status(404).json({ msg: "Dokumentasi tidak ditemukan" });
    }

    let gambar = dokumentasi.gambar;
    let thumbnail = dokumentasi.thumbnail || '';
    if (req.file) {
      // Hapus file lama jika ada
      if (dokumentasi.gambar) {
        const oldFilePath = path.join(process.cwd(), dokumentasi.gambar);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`Old file deleted: ${oldFilePath}`);
        } else {
          console.warn(`Old file not found: ${oldFilePath}`);
        }
      }

      gambar = `/uploads/dokumentasi_topung/${req.file.filename}`;
if (req.file.mimetype.startsWith('video/')) {
  thumbnail = '';
  console.log(`Skipping thumbnail generation for video.`);
}

      console.log(`New file saved locally: ${gambar}`);
    }

    await prisma.dokumentasi.update({
      where: { id: Number(id) },
      data: { gambar, thumbnail, judul },
    });

    res.status(200).json({ msg: "Dokumentasi updated successfully" });
  } catch (error) {
    console.error("Error updating dokumentasi:", error);
    res.status(500).json({ msg: error.message || "Server error" });
  }
};

export const getDokumentasi = async (req, res) => {
  try {
    const response = await prisma.dokumentasi.findMany({
      include: {
        user: {
          select: {
            nama: true,
            email: true,
          },
        },
      },
    });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching dokumentasi:", error);
    res.status(500).json({ msg: error.message || "Internal Server Error" });
  }
};

export const getDokumentasiById = async (req, res) => {
  try {
    const response = await prisma.dokumentasi.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        user: {
          select: {
            nama: true,
            email: true,
          },
        },
      },
    });
    if (!response)
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    res.status(200).json(response);
  } catch (error) {
    console.error("Error fetching dokumentasi by ID:", error);
    res.status(404).json({ msg: error.message || "Data tidak ditemukan" });
  }
};


export const deleteDokumentasi = async (req, res) => {
  try {
    const dokumentasi = await prisma.dokumentasi.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!dokumentasi) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }

    // Hapus file dari folder lokal jika ada
    if (dokumentasi.gambar) {
      const filePath = path.join(process.cwd(), dokumentasi.gambar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    }
    // Hapus thumbnail dari folder lokal jika ada
    if (dokumentasi.thumbnail) {
      const thumbnailPath = path.join(process.cwd(), dokumentasi.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
        console.log(`Thumbnail deleted: ${thumbnailPath}`);
      } else {
        console.warn(`Thumbnail not found: ${thumbnailPath}`);
      }
    }

    await prisma.dokumentasi.delete({
      where: {
        id: dokumentasi.id,
      },
    });

    res.status(200).json({ msg: "Dokumentasi deleted successfully" });
  } catch (error) {
    console.error("Error deleting dokumentasi:", error);
    res.status(500).json({ msg: error.message || "Server error" });
  }
};
