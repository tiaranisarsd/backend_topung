import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import cloudinary from "../cloudinaryConfig.js";


export const getReservasi = async (req, res) => {
  try {
    const { id, role } = req.user; // Extract user info from middleware (adjust based on your setup)
    let response;

    if (role === 'owner') {
      // Option 1: Admin sees all response (currently active)
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

      // Option 2: Admin sees only their response (uncomment if desired)
      // response = await prisma.reservasi.findMany({
      //   where: {
      //     userId: id // Filter by admin's user ID (adjust field based on schema)
      //     // OR if filtering by nama directly:
      //     // nama: nama
      //   },
      //   include: {
      //     users: {
      //       select: {
      //         nama: true
      //       },
      //     },
      //     jadwal: {
      //       select: {
      //         hari: true,
      //         jam: true
      //       },
      //     },
      //   },
      // });
    } else {
      // Regular users see only their response
      response = await prisma.reservasi.findMany({
        where: {
          userId: id // Filter by user's ID (adjust field based on schema)
          // OR if filtering by nama directly:
          // nama: nama
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
  
  // Parse usia, userId, and jadwalId
  const usia = parseInt(req.body.usia, 10);
  const userId = parseInt(req.body.userId, 10); // Ensure userId is an integer
  const jadwalId = parseInt(req.body.jadwalId, 10); // Ensure jadwalId is an integer
  const no_telp = req.body.no_telp; // Assuming no_telp is already a formatted string

  console.log("Received jadwalId:", req.body.jadwalId); // Log untuk debugging
  console.log("Received userId:", req.body.userId); // Log untuk debugging

  try {
    // Validasi apakah userId ada di tabel users
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    // });

    if (!userId) {
      return res.status(400).json({ msg: "Terapis yang dipilih tidak ditemukan. Silakan pilih terapis yang valid." });
    }

    // Validasi apakah jadwalId ada di tabel jadwal_terapis
    const jadwal = await prisma.jadwal_terapis.findUnique({
      where: { id: jadwalId },
    });

    if (!jadwal) {
      return res.status(400).json({ msg: "Jadwal yang dipilih tidak ditemukan atau sudah tidak tersedia. Silakan pilih jadwal lain." });
    }

    // Validasi apakah jadwal sudah dipesan dengan status "proses"
    const existingReservasi = await prisma.reservasi.findFirst({
      where: {
        jadwalId: jadwalId,
        status: "proses", // Hanya cek reservasi dengan status "proses"
      },
    });

    if (existingReservasi) {
      return res.status(400).json({ msg: "Maaf, jadwal yang Anda pilih sudah dipesan oleh pelanggan lain dan sedang dalam proses. Silakan pilih jadwal lain." });
    }

    // Jika semua validasi lolos, buat reservasi baru
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
      // Foreign key constraint error
      return res.status(400).json({ msg: "Gagal membuat reservasi: Terapis atau jadwal yang dipilih tidak valid atau tidak ditemukan." });
    }
    res.status(400).json({ msg: error.message });
  }
};




// controllers/reservasiController.js
export const updateReservasiStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    // Ambil data reservasi terlebih dahulu untuk mendapatkan jadwalId
    const reservasi = await prisma.reservasi.findUnique({
      where: { id: id },
    });

    if (!reservasi) {
      return res.status(404).json({ msg: "Reservasi tidak ditemukan." });
    }

    // Log reservasi sebelum update untuk debugging
    console.log("Reservasi sebelum update:", reservasi);

    // Jika status diubah menjadi "proses" dan ada jadwalId, hapus jadwal_terapis
    if (status === "proses") {
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
        // Set status to "batal" if jadwalId is not found
        await prisma.reservasi.update({
          where: { id: id },
          data: { status: "batal" },
        });
        return res.status(400).json({ msg: "Tidak dapat mengubah status ke 'proses' karena jadwal tidak tersedia." });
      }
    }

    // Update status reservasi
    const updatedReservasi = await prisma.reservasi.update({
      where: { id: id },
      data: { 
        status: status,
      },
    });

    // Log reservasi setelah update
    console.log("Updated Reservasi:", updatedReservasi);

    res.status(200).json({ msg: "Status reservasi berhasil diperbarui", reservasi: updatedReservasi });
  } catch (error) {
    console.error("Error updating reservasi status:", error);
    res.status(500).json({ msg: error.message });
  }
};



// controllers/jadwalTerapisController.js
export const getAvailableJadwalTerapis = async (req, res) => {
  try {
    // Ambil semua jadwal terapis beserta reservasi yang terkait
    const jadwalTerapis = await prisma.jadwal_terapis.findMany({
      include: {
        reservasi: {
          where: { status: "proses" }, // Hanya ambil reservasi dengan status "proses"
        },
        user: {
          select: { nama: true, email: true }, // Informasi terapis
        },
      },
    });

    // Filter jadwal yang tidak memiliki reservasi dengan status "proses"
    const availableJadwal = jadwalTerapis.filter(jadwal => jadwal.reservasi.length === 0);

    res.status(200).json(availableJadwal);
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
};



export const updateReservasi = async (req, res) => {
  try {
    // Check if the reservation exists
    const reservasi = await prisma.reservasi.findUnique({
      where: {
        id: Number(req.params.id),
      },
    });

    if (!reservasi) {
      return res.status(404).json({ msg: "Reservasi tidak ditemukan" });
    }

    // Extract data from request body (only update fields that are provided)
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

    // Parse usia if provided and validate
    let usia;
    if (req.body.usia !== undefined) {
      usia = parseInt(req.body.usia, 10);
      if (isNaN(usia) || usia <= 0) {
        return res.status(400).json({ msg: "Usia harus berupa angka positif" });
      }
    }

    // Parse userId and jadwalId if provided
    const userId = req.body.userId ? parseInt(req.body.userId, 10) : undefined;
    const jadwalId = req.body.jadwalId ? parseInt(req.body.jadwalId, 10) : undefined;

    // Validate status if provided
    if (status) {
      const validStatuses = ['pending', 'proses', 'success']; // Adjust based on your allowed statuses
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          msg: `Status harus salah satu dari: ${validStatuses.join(', ')}`,
        });
      }
    }

    // Handle bukti_pembayaran (file upload) if a new file is provided
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

    // Perform the update
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
        console.error("Kesalahan umum saat memproses penghapusan gambar dari Cloudinary:", cloudinaryError);
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
      return res.status(200).json({ msg: "Reservasi sudah tidak ditemukan atau telah dihapus oleh proses lain." });
    }
    
    res.status(500).json({ msg: error.message });
  }
};
