import {PrismaClient} from "@prisma/client";
import cloudinary from "../cloudinaryConfig.js";

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
    if (req.file) {
      const isVideo = req.file.mimetype.startsWith('video/');
      const resourceType = isVideo ? 'video' : 'image';
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: resourceType,
        folder: 'testimoni'
      });
      media = result.secure_url; 
      console.log(`File uploaded to Cloudinary: ${media}`);
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
    if (req.file) {
      if (testimoni.media) {
        try {
          const urlParts = testimoni.media.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          let publicId = urlParts.slice(uploadIndex + 2).join('/'); 
          publicId = publicId.split('.')[0]; 
          const isVideo = testimoni.media.endsWith('.mp4') || testimoni.media.endsWith('.webm') || testimoni.media.endsWith('.mov');
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
        folder: 'testimoni'
      });
      media = result.secure_url; 
      console.log(`New file uploaded to Cloudinary: ${media}`);
    }

    await prisma.testimoni.update({
      where: { id: Number(id) },
      data: { media},
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

    if (testimoni.media) {
          const urlParts = testimoni.media.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          let publicId = urlParts.slice(uploadIndex + 2).join('/'); 
          publicId = publicId.split('.')[0]; 

      cloudinary.uploader.destroy(publicId, async (error, result) => {
        if (error) {
          console.error("Error deleting image from Cloudinary:", error);
          return res
            .status(500)
            .json({ msg: "Error deleting image from Cloudinary" });
        }
        console.log("Old image deleted from Cloudinary:", result);

        await prisma.testimoni.delete({
          where: {
            id: Number(req.params.id),
          },
        });

        res.status(200).json({ msg: "Testimoni deleted successfully" });
      });
    } else {
      await prisma.testimoni.delete({
        where: {
          id: Number(req.params.id),
        },
      });
      res.status(200).json({ msg: "Testimoni deleted successfully" });
    }
  } catch (error) {
    console.error("Error deleting testimoni:", error);
    res.status(500).json({ msg: error.message }); 
  }
};
