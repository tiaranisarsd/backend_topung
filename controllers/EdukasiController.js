import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const getEdukasi = async (req, res) => {
    try {
        const response = await prisma.edukasi.findMany({
                include: {
                    user: { 
                        select: {
                            nama: true,
                            email: true
                        }
                    }
                }
            });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};



export const getEdukasiById = async (req, res) => {
  try {
    const response = await prisma.edukasi.findUnique({
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

export const createEdukasi = async (req, res) => {
  const { konten } = req.body;
  const userId = req.user.id;

  try {
    await prisma.edukasi.create({
        data: {
            konten: konten,
            user: {
              connect: {
                id: userId, 
              },
            },
          },
        });
    res.status(201).json({ msg: "Edukasi Created Successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateEdukasi = async (req, res) => {
  const response = await prisma.edukasi.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!response) return res.status(404).json({ msg: "Edukasi tidak ditemukan" });
  const { konten } = req.body;
  try {
    await prisma.edukasi.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        konten: konten,
      },
    });
    res.status(200).json({ msg: "Edukasi updated successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const deleteEdukasi = async (req, res) => {
  const response = await prisma.edukasi.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!response) return res.status(404).json({ msg: "Edukasi tidak ditemukan" });
  try {
    await prisma.edukasi.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(201).json({ msg: "Edukasi deleted successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
