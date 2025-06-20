import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

export const getJadwalKegiatan = async (req, res) => {
  try {
    const response = await prisma.jadwal_kegiatan.findMany({
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

export const getJadwalKegiatanById = async (req, res) => {
  try {
    const response = await prisma.jadwal_kegiatan.findUnique({
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
    res.status(404).json({ msg: error.message });
  }
};

export const createJadwalKegiatan = async (req, res) => {
  const { tanggal_waktu, jenis_kegiatan, lokasi, deskripsi } = req.body;
  const userId = req.user.id;

  let tanggalWaktuISO;
  try {
    tanggalWaktuISO = new Date(tanggal_waktu).toISOString();
  } catch (error) {
    return res.status(400).json({ msg: "Format tanggal tidak valid. Gunakan format 'YYYY-MM-DDTHH:mm:ssZ'" });
  }

  try {
    await prisma.jadwal_kegiatan.create({
      data: {
        tanggal_waktu: tanggalWaktuISO,
        jenis_kegiatan: jenis_kegiatan,
        lokasi: lokasi,
        deskripsi: deskripsi,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    res.status(201).json({ msg: "Jadwal Kegiatan Created Successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const updateJadwalKegiatan = async (req, res) => {
  const response = await prisma.jadwal_kegiatan.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!response)
    return res.status(404).json({ msg: "Jadwal Kegiatan tidak ditemukan" });
  const { tanggal_waktu, jenis_kegiatan, lokasi, deskripsi } = req.body;
    // Ubah format tanggal menjadi ISO-8601
    let tanggalWaktuISO;
    try {
      tanggalWaktuISO = new Date(tanggal_waktu).toISOString();
    } catch (error) {
      return res.status(400).json({ msg: "Format tanggal tidak valid. Gunakan format 'YYYY-MM-DDTHH:mm:ssZ'" });
    }
  try {
    await prisma.jadwal_kegiatan.update({
      where: {
        id: Number(req.params.id),
      },
      data: {
        tanggal_waktu: tanggalWaktuISO,
        jenis_kegiatan: jenis_kegiatan,
        lokasi: lokasi,
        deskripsi: deskripsi,
      },
    });
    res.status(200).json({ msg: "Jadwal Kegiatan updated successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

export const deleteJadwalKegiatan = async (req, res) => {
  const response = await prisma.jadwal_kegiatan.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });
  if (!response)
    return res.status(404).json({ msg: "Jadwal Kegiatan tidak ditemukan" });
  try {
    await prisma.jadwal_kegiatan.delete({
      where: {
        id: Number(req.params.id),
      },
    });
    res.status(201).json({ msg: "Jadwal Kegiatan deleted successfully" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

