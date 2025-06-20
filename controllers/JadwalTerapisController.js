import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getJadwalTerapis = async (req, res) => {
  try {
    const response = await prisma.jadwal_terapis.findMany({
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
export const getJadwalTerapisById = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ msg: "Invalid user ID" });
    }

    try {
        const response = await prisma.jadwal_terapis.findUnique({
            where: { id: Number(id) },
            include: {
                user: { select: { nama: true, email: true } },
            },
        });

        if (!response) {
            return res.status(404).json({ msg: "Data tidak ditemukan" });
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching jadwal:", error);
        res.status(500).json({ msg: "Server error", error: error.message });
    }
};

// Mengambil daftar jadwal berdasarkan userId
export const getJadwalByUser = async (req, res) => {
    try {
        const jadwal = await prisma.jadwal_terapis.findMany({
            where: {
                userId: parseInt(req.params.userId)
            }
        });
        res.status(200).json(jadwal);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Mengambil jadwal spesifik berdasarkan userId dan id
export const getJadwalByUserAndId = async (req, res) => {
    try {
        const jadwal = await prisma.jadwal_terapis.findFirst({
            where: {
                id: parseInt(req.params.id),
                userId: parseInt(req.params.userId)
            }
        });
        if (!jadwal) {
            return res.status(404).json({ msg: "Jadwal tidak ditemukan" });
        }
        res.status(200).json(jadwal);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

// Update jadwal berdasarkan userId dan id
export const updateJadwalByUserAndId = async (req, res) => {
    try {
        const { hari, jam } = req.body;
        const jadwal = await prisma.jadwal_terapis.update({
            where: {
                id: parseInt(req.params.id),
                userId: parseInt(req.params.userId)
            },
            data: {
                hari,
                jam
            }
        });
        res.status(200).json({ msg: "Jadwal berhasil diperbarui", jadwal });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};



export const createJadwalTerapis = async (req, res) => {
  const {hari, jam } = req.body;
  const userId = req.user.id;

  try {
    await prisma.jadwal_terapis.create({
      data: {
        hari: hari,
        jam: jam,
        user: {
            connect: {
              id: userId,
            },
          },
      },
    });
    res.status(201).json({ msg: "JadwalTerapis Created Successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateJadwalTerapis = async (req, res) => {
    const response = await prisma.jadwal_terapis.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
    if (!response) return res.status(404).json({ msg: "Jadwal Terapis tidak ditemukan" });
  const { userId, hari, jam } = req.body;
  try {
    await prisma.jadwal_terapis.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        userId: userId,
        hari: hari,
        jam: jam
      },
    });
    res.status(200).json({ msg: "JadwalTerapis updated Successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const deleteJadwalTerapis = async (req, res) => {
  try {
    const response = await prisma.jadwal_terapis.delete({
      where: {
        id: Number(req.params.id),
      },
    });
     if (!response) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }
    res.status(200).json({ msg: "Data terapis berhasil dihapus" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

