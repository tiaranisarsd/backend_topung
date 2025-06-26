import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cloudinary from "../cloudinaryConfig.js";


export const getReservasi = async (req, res) => {
  try {
    const { id, role } = req.user;
    let response;

    if (role === 'owner') {
      response = await prisma.reservasi.findMany({
        include: {
          users: {
            select: {
              nama: true
            },
          },
          jadwal: {
            select: {
              id: true,
              hari: true,
              jam: true
            },
          },
        },
      });
    } else {
      response = await prisma.reservasi.findMany({
        where: {
          userId: id
        },
        include: {
          users: {
            select: {
              nama: true
            },
          },
          jadwal: {
            select: {
              id: true,
              hari: true,
              jam: true
            },
          },
        },
      });
    }

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ msg: error.message });
  }
};

export const getStatus = async (req, res) => {
  try {
    const query = req.query.query?.toLowerCase();

    const altQuery = query.startsWith('0') ? '62' + query.slice(1) :
                     query.startsWith('62') ? '0' + query.slice(2) : null;

    const response = await prisma.reservasi.findMany({
      where: {
        OR: [
          {
            nama: {
              contains: query,
              mode: 'insensitive'
            }
          },
          {
            no_telp: {
              contains: query,
              mode: 'insensitive'
            }
          },
          ...(altQuery ? [{
            no_telp: {
              contains: altQuery,
              mode: 'insensitive'
            }
          }] : [])
        ]
      },
      select: {
        no_telp: true,
        layanan: true,
        tanggal_waktu: true,
        nama: true,
        usia: true,
        alamat: true,
        pembayaran: true,
        status: true,
        users: {
          select: {
            nama: true
          }
        },
        jadwal: {
          select: {
            id: true,
            hari: true,
            jam: true
          }
        }
      }
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({ msg: error.message });
  }
};


export const getReservasiById = async (req, res) => {
  try {
    const responsee = await prisma.reservasi.findUnique({
      where: {
        id: Number(req.params.id),
      },
      include: {
        users: {          
            select: {
              nama: true
            },
          },
        jadwal: {          
            select: {
              hari: true,
              jam: true
            },
          },
      },
    });
    if (!responsee) {
      return res.status(404).json({ msg: "Data tidak ditemukan" });
    }
    res.status(200).json(responsee);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};

export const createReservasi = async (req, res) => {
  const bukti_pembayaran = req.file ? req.file.path : '';
  const { layanan, tanggal_waktu, nama, alamat, keluhan, pembayaran, status } = req.body;
  
  const usia = parseInt(req.body.usia, 10);
  const userId = parseInt(req.body.userId, 10);
  const jadwalId = parseInt(req.body.jadwalId, 10);
  const no_telp = req.body.no_telp;

  console.log("Received jadwalId:", req.body.jadwalId);
  console.log("Received userId:", req.body.userId);

  try {
    if (!userId) {
      return res.status(400).json({ msg: "Terapis yang dipilih tidak ditemukan. Silakan pilih terapis yang valid." });
    }

    const jadwal = await prisma.jadwal_terapis.findUnique({
      where: { id: jadwalId },
    });

    if (!jadwal) {
      return res.status(400).json({ msg: "Jadwal yang dipilih tidak ditemukan atau sudah tidak tersedia. Silakan pilih jadwal lain." });
    }

    const existingReservasi = await prisma.reservasi.findFirst({
      where: {
        jadwalId: jadwalId,
        status: "Disetujui",
      },
    });

    if (existingReservasi) {
      return res.status(400).json({ msg: "Maaf, jadwal yang Anda pilih sudah dipesan oleh pelanggan lain dan sedang dalam Disetujui. Silakan pilih jadwal lain." });
    }

    const newReservasi = await prisma.reservasi.create({
      data: {
        layanan: layanan,
        tanggal_waktu: tanggal_waktu,
        nama: nama,
        usia,
        no_telp: no_telp,
        alamat: alamat,
        keluhan: keluhan,
        pembayaran: pembayaran,
        bukti_pembayaran: bukti_pembayaran,
        status: status,
        userId: userId,
        jadwalId: jadwalId
      },
    });

    res.status(201).json({ msg: "Reservasi Created Successfully", reservasi: newReservasi });
  } catch (error) {
    console.error("Error creating reservasi:", error);
    if (error.code === 'P2003') {
      return res.status(400).json({ msg: "Gagal membuat reservasi: Terapis atau jadwal yang dipilih tidak valid atau tidak ditemukan." });
    }
    res.status(400).json({ msg: error.message });
  }
};


export const updateReservasiStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    const reservasi = await prisma.reservasi.findUnique({
      where: { id: id },
    });

    if (!reservasi) {
      return res.status(404).json({ msg: "Reservasi tidak ditemukan." });
    }

    console.log("Reservasi sebelum update:", reservasi);

    if (status === "Disetujui") {
      if (reservasi.jadwalId) {
        try {
          console.log(`Attempting to delete jadwal with ID: ${reservasi.jadwalId}`);
          await prisma.jadwal_terapis.delete({
            where: { id: reservasi.jadwalId },
          });
          console.log(`Deleted jadwal with ID: ${reservasi.jadwalId}`);
        } catch (deleteError) {
          console.error(`Error deleting jadwal with ID: ${reservasi.jadwalId}`, deleteError);
        }
      } else {
        console.log("No jadwalId found for this reservasi.");
        await prisma.reservasi.update({
          where: { id: id },
          data: { status: "Dibatalkan" },
        });
        return res.status(400).json({ msg: "Tidak dapat mengubah status ke 'Disetujui' karena jadwal tidak tersedia." });
      }
    }

    const updatedReservasi = await prisma.reservasi.update({
      where: { id: id },
      data: { 
        status: status,
      },
    });

    console.log("Updated Reservasi:", updatedReservasi);

    res.status(200).json({ msg: "Status reservasi berhasil diperbarui", reservasi: updatedReservasi });
  } catch (error) {
    console.error("Error updating reservasi status:", error);
    res.status(500).json({ msg: error.message });
  }
};

export const getAvailableJadwalTerapis = async (req, res) => {
  try {
    const jadwalTerapis = await prisma.jadwal_terapis.findMany({
      include: {
        reservasi: {
          where: { status: "Disetujui" },
        },
        user: {
          select: { nama: true, email: true },
        },
      },
    });

    const availableJadwal = jadwalTerapis.filter(jadwal => jadwal.reservasi.length === 0);

    res.status(200).json(availableJadwal);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



export const updateReservasi = async (req, res) => {
  try {
    const reservasi = await prisma.reservasi.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!reservasi) {
      return res.status(404).json({ msg: "Reservasi tidak ditemukan" });
    }

    const {
      layanan,
      tanggal_waktu,
      nama,
      no_telp,
      alamat,
      keluhan,
      pembayaran,
      status,
    } = req.body;

    let usia;
    if (req.body.usia !== undefined) {
      usia = parseInt(req.body.usia, 10);
      if (isNaN(usia) || usia <= 0) {
        return res.status(400).json({ msg: "Usia harus berupa angka positif" });
      }
    }

    const userId = req.body.userId ? parseInt(req.body.userId, 10) : undefined;
    const jadwalId = req.body.jadwalId ? parseInt(req.body.jadwalId, 10) : undefined;

    if (status) {
      const validStatuses = ['Menunggu', 'Disetujui', 'Selesai'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          msg: `Status harus salah satu dari: ${validStatuses.join(', ')}`,
        });
      }
    }

    let bukti_pembayaran = reservasi.bukti_pembayaran;
  if (req.file) {
    if (reservasi.bukti_pembayaran) {
          const urlParts = reservasi.bukti_pembayaran.split('/');
          const uploadIndex = urlParts.findIndex(part => part === 'upload');
          let publicId = urlParts.slice(uploadIndex + 2).join('/'); 
          publicId = publicId.split('.')[0]; 
        cloudinary.uploader.destroy(publicId, (err, result) => {
            if (err) {
                console.error('Error deleting image from Cloudinary:', err);
            } else {
                console.log('Old image deleted from Cloudinary:', result);
            }
        });
    }
      bukti_pembayaran = req.file.path; 
    }

    const updateData = {};
    if (layanan !== undefined) updateData.layanan = layanan;
    if (tanggal_waktu !== undefined) updateData.tanggal_waktu = tanggal_waktu;
    if (nama !== undefined) updateData.nama = nama;
    if (usia !== undefined && !isNaN(usia)) updateData.usia = usia; 
    if (no_telp !== undefined) updateData.no_telp = no_telp;
    if (alamat !== undefined) updateData.alamat = alamat;
    if (keluhan !== undefined) updateData.keluhan = keluhan;
    if (pembayaran !== undefined) updateData.pembayaran = pembayaran;
    if (status !== undefined) updateData.status = status;
    if (bukti_pembayaran !== reservasi.bukti_pembayaran) updateData.bukti_pembayaran = bukti_pembayaran;
    if (userId !== undefined && !isNaN(userId)) updateData.userId = userId;
    if (jadwalId !== undefined && !isNaN(jadwalId)) updateData.jadwalId = jadwalId;

    const updatedReservasi = await prisma.reservasi.update({
      where: {
        id: Number(req.params.id),
      },
      data: updateData,
    });

    res.status(200).json({ msg: "Reservasi updated successfully", data: updatedReservasi });
  } catch (error) {
    console.error('Error updating reservation:', error);
    res.status(500).json({ msg: "Gagal memperbarui reservasi", error: error.message });
  }
};


export const deleteReservasi = async (req, res) => {
  try {
    const reservasi = await prisma.reservasi.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!reservasi) {
      return res.status(200).json({ msg: "Data reservasi sudah tidak ditemukan atau telah dihapus." });
    }

    if (reservasi.bukti_pembayaran) {
      let publicId = null;
      try {

        const urlParts = reservasi.bukti_pembayaran.split('/upload/');
        if (urlParts.length > 1) {
          const pathAfterUpload = urlParts[1]; 
          const segments = pathAfterUpload.split('/');

          const versionSegmentIndex = segments.findIndex(s => s.startsWith('v') && !isNaN(parseInt(s.substring(1))));

          if (versionSegmentIndex !== -1) {
            const publicIdWithPathAndExtension = segments.slice(versionSegmentIndex + 1).join('/');
            publicId = publicIdWithPathAndExtension.split('.')[0];
          }
        }
        
        if (!publicId) {
          console.warn(`Peringatan: Gagal mengekstrak Public ID dari URL: ${reservasi.bukti_pembayaran}. Gambar mungkin tidak terhapus dari Cloudinary.`);
        } else {
            const cloudinaryResult = await cloudinary.uploader.destroy(publicId);
            console.log("Hasil penghapusan gambar dari Cloudinary:", cloudinaryResult);

            if (cloudinaryResult.result === 'not found') {
                console.warn(`Peringatan: Gambar dengan Public ID "${publicId}" tidak ditemukan di Cloudinary. Mungkin sudah dihapus atau ID salah.`);

            } else if (cloudinaryResult.result !== 'ok') {
                console.error(`Error: Gagal menghapus gambar dari Cloudinary. Pesan: ${cloudinaryResult.result}`);

            }
        }
      } catch (cloudinaryError) {
        console.error("Kesalahan umum saat memDisetujui penghapusan gambar dari Cloudinary:", cloudinaryError);
      }
    }

    await prisma.reservasi.delete({
      where: {
        id: Number(req.params.id),
      },
    });

    res.status(200).json({ msg: "Reservasi berhasil dihapus!" });

  } catch (error) {
    console.error("Terjadi kesalahan saat menghapus reservasi:", error);

    if (error.code === 'P2025') {
      return res.status(200).json({ msg: "Reservasi sudah tidak ditemukan atau telah dihapus oleh Disetujui lain." });
    }
    
    res.status(500).json({ msg: error.message });
  }
};
