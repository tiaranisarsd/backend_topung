import {PrismaClient} from "@prisma/client";
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export const getTestimoni = async (req, res) => {
  try {
    const response = await prisma.testimoni.findMany({
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
    res.status(500).json({ msg: error.message });
  }
};

export const getTestimoniById = async (req, res) => {
  try {
    const response = await prisma.testimoni.findUnique({
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
    if (!response) return res.status(404).json({ msg: "Data tidak ditemukan" });
    res.status(200).json(response);
  } catch (error) {
    res.status(404).json({ msg: error.message });
  }
};

export const createTestimoni= async (req, res) => {
  const userId = req.user.id;

  try {
    let media = '';
    let thumbnail = '';
    if (req.file) {
      media = `/uploads/testimoni/${req.file.filename}`;
      console.log(`File uploaded: ${media}, Type: ${req.file.mimetype}`);
      // Jika file adalah video, gunakan path placeholder untuk thumbnail
    if (req.file.mimetype.startsWith('video/')) {
      thumbnail = ''; // Tidak mencoba membuat thumbnail
      console.log(`Skipping thumbnail generation for video.`);
    }

      console.log(`File saved locally: ${media}`);
    }

    await prisma.testimoni.create({
      data: {
        media: media,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    res.status(201).json({ msg: "Testimoni Created Successfully" });
  } catch (error) {
    console.error("Error creating testimoni:", error);
    res.status(400).json({ msg: error.message || "Failed to create testimoni" });
  }
};

export const updateTestimoni = async (req, res) => {
  const { id } = req.params;

  try {
    const testimoni = await prisma.testimoni.findUnique({
      where: { id: Number(id) },
    });

    if (!testimoni) {
      return res.status(404).json({ msg: "Testimoni tidak ditemukan" });
    }

    let media = testimoni.media;
    let thumbnail = testimoni.thumbnail || '';
    if (req.file) {
      // Hapus file lama jika ada
      if (testimoni.media) {
        const oldFilePath = path.join(process.cwd(), testimoni.media);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
          console.log(`Old file deleted: ${oldFilePath}`);
        } else {
          console.warn(`Old file not found: ${oldFilePath}`);
        }
      }

      media = `/uploads/testimoni/${req.file.filename}`;
if (req.file.mimetype.startsWith('video/')) {
  thumbnail = '';
  console.log(`Skipping thumbnail generation for video.`);
}

      console.log(`New file saved locally: ${media}`);
    }


    await prisma.testimoni.update({
      where: { id: Number(id) },
      data: { media, thumbnail},
    });

    res.status(200).json({ msg: "Testimoni updated successfully" });
  } catch (error) {
    console.error("Error updating testimoni:", error);
    res.status(500).json({ msg: error.message || "Server error" });
  }
};

export const deleteTestimoni = async (req, res) => {
  try {
    const testimoni = await prisma.testimoni.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!testimoni) {
      return res.status(404).json({ msg: "Testimoni tidak ditemukan" });
    }

    // Hapus file dari folder lokal jika ada
    if (testimoni.media) {
      const filePath = path.join(process.cwd(), testimoni.media);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`File deleted: ${filePath}`);
      } else {
        console.warn(`File not found: ${filePath}`);
      }
    }
    // Hapus thumbnail dari folder lokal jika ada
    if (testimoni.thumbnail) {
      const thumbnailPath = path.join(process.cwd(), testimoni.thumbnail);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
        console.log(`Thumbnail deleted: ${thumbnailPath}`);
      } else {
        console.warn(`Thumbnail not found: ${thumbnailPath}`);
      }
    }
        await prisma.testimoni.delete({
          where: {
            id: Number(req.params.id),
          },
        });

        res.status(200).json({ msg: "Testimoni deleted successfully" });
  } catch (error) {
    console.error("Error deleting testimoni:", error);
    res.status(500).json({ msg: error.message }); 
  }
};
