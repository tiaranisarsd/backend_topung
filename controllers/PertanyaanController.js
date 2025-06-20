import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const getPertanyaan = async (req, res) => {
  try {
    const response = await prisma.pertanyaan.findMany({
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

export const getPertanyaanById = async (req, res) => {
  try {
    const response = await prisma.pertanyaan.findUnique({
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

export const createPertanyaan = async (req, res) => {
  const { judul_pertanyaan, isi_pertanyaan } = req.body;
  const userId = req.user.id;

  try {
    await prisma.pertanyaan.create({
        data: {
            judul_pertanyaan: judul_pertanyaan,
            isi_pertanyaan: isi_pertanyaan,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        });
    res.status(201).json({ msg: "Pertanyaan Created Successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updatePertanyaan = async (req, res) => {
  const response = await prisma.pertanyaan.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!response) return res.status(404).json({ msg: "Pertanyaan tidak ditemukan" });
  const { judul_pertanyaan, isi_pertanyaan } = req.body;
  try {
    await prisma.pertanyaan.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        judul_pertanyaan: judul_pertanyaan,
        isi_pertanyaan: isi_pertanyaan
      },
    });
    res.status(200).json({ msg: "Pertanyaan updated successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const deletePertanyaan = async (req, res) => {
  const response = await prisma.pertanyaan.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!response) return res.status(404).json({ msg: "Pertanyaan tidak ditemukan" });
  try {
    await prisma.pertanyaan.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(201).json({ msg: "Pertanyaan deleted successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};
