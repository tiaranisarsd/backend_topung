import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cloudinary from "../cloudinaryConfig.js";

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

export const createDokumentasi = async (req, res) => {
  const { judul } = req.body;
  const userId = req.user.id;

  try {
    let gambar = '';
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resourceType,
        folder: 'dokumentasi_topung'
      });
      gambar = result.secure_url; // Simpan URL publik dari Cloudinary
      console.log(`File uploaded to Cloudinary: ${gambar}`);
    }

    await prisma.dokumentasi.create({
      data: {
        gambar: gambar,
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
    if (req.file) {
      if (dokumentasi.gambar) {
        try {
          const urlParts = dokumentasi.gambar.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          let publicId = urlParts.slice(uploadIndex + 2).join('/'); 
          publicId = publicId.split('.')[0]; 
          const isVideo = dokumentasi.gambar.endsWith('.mp4') || dokumentasi.gambar.endsWith('.webm') || dokumentasi.gambar.endsWith('.mov');
          const resourceType = isVideo ? 'video' : 'image';

          if (publicId) {
            const result = await cloudinary.uploader.destroy(publicId, {
              resource_type: resourceType
            });
            console.log("Old file deleted from Cloudinary:", result);
            if (result.result === 'not found') {
              console.warn("File not found in Cloudinary, proceeding with update.");
            }
          } else {
            console.warn("Could not extract publicId from URL, skipping deletion.");
          }
        } catch (err) {
          console.error("Error deleting file from Cloudinary:", err);
          console.warn("Proceeding with update despite Cloudinary deletion error.");
        }
      }

      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resourceType,
        folder: 'dokumentasi_topung'
      });
      gambar = result.secure_url; // Simpan URL publik dari Cloudinary
      console.log(`New file uploaded to Cloudinary: ${gambar}`);
    }

    await prisma.dokumentasi.update({
      where: { id: Number(id) },
      data: { gambar, judul },
    });

    res.status(200).json({ msg: "Dokumentasi updated successfully" });
  } catch (error) {
    console.error("Error updating dokumentasi:", error);
    res.status(500).json({ msg: error.message || "Server error" });
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

    if (dokumentasi.gambar) {
      const urlParts = dokumentasi.gambar.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      let publicId = urlParts.slice(uploadIndex + 2).join('/'); 
      publicId = publicId.split('.')[0]; 
      const isVideo = dokumentasi.gambar.endsWith('.mp4') || dokumentasi.gambar.endsWith('.webm') || dokumentasi.gambar.endsWith('.mov');
      const resourceType = isVideo ? 'video' : 'image';

      cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, async (error, result) => {
        if (error) {
          console.error("Error deleting file from Cloudinary:", error);
          return res
            .status(500)
            .json({ msg: "Error deleting file from Cloudinary", error: error.message || error.toString() });
        }
        console.log("Old file deleted from Cloudinary:", result);

        await prisma.dokumentasi.delete({
          where: {
            id: dokumentasi.id, 
          },
        });

        res.status(200).json({ msg: "Dokumentasi deleted successfully" });
      });
    } else {
      await prisma.dokumentasi.delete({
        where: {
          id: dokumentasi.id, 
        },
      });
      res.status(200).json({ msg: "Dokumentasi deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting dokumentasi:", error);
    res.status(500).json({ msg: error.message || "Server error" });
  }
};
