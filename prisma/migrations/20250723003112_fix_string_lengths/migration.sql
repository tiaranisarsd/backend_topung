/*
  Warnings:

  - You are about to alter the column `gambar` on the `dokumentasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `judul` on the `dokumentasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `thumbnail` on the `dokumentasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `tanggal_waktu` on the `jadwal_kegiatan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `jenis_kegiatan` on the `jadwal_kegiatan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `lokasi` on the `jadwal_kegiatan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `hari` on the `jadwal_terapis` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `jam` on the `jadwal_terapis` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(20)`.
  - You are about to alter the column `judul_pertanyaan` on the `pertanyaan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `layanan` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `tanggal_waktu` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `nama` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(35)`.
  - You are about to alter the column `no_telp` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `alamat` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `pembayaran` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `bukti_pembayaran` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `status` on the `reservasi` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `media` on the `testimoni` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `thumbnail` on the `testimoni` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `nama` on the `tinjauan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `layanan` on the `tinjauan` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `token` on the `token` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `nama` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(35)`.
  - You are about to alter the column `email` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `password` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `role` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(8)`.
  - You are about to alter the column `alamat` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `gambar` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `no_rekening` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(25)`.
  - You are about to alter the column `no_telp` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `harga` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `bank` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(15)`.
  - You are about to alter the column `cv_pdf` on the `users` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - A unique constraint covering the columns `[email]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "dokumentasi" ALTER COLUMN "gambar" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "judul" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "thumbnail" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "jadwal_kegiatan" ALTER COLUMN "tanggal_waktu" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "jenis_kegiatan" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "lokasi" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "jadwal_terapis" ALTER COLUMN "hari" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "jam" SET DATA TYPE VARCHAR(20);

-- AlterTable
ALTER TABLE "pertanyaan" ALTER COLUMN "judul_pertanyaan" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "reservasi" ALTER COLUMN "layanan" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "tanggal_waktu" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "nama" SET DATA TYPE VARCHAR(35),
ALTER COLUMN "no_telp" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "alamat" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "pembayaran" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "bukti_pembayaran" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(25);

-- AlterTable
ALTER TABLE "testimoni" ALTER COLUMN "media" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "thumbnail" SET DATA TYPE VARCHAR(100);

-- AlterTable
ALTER TABLE "tinjauan" ALTER COLUMN "nama" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "layanan" SET DATA TYPE VARCHAR(25);

-- AlterTable
ALTER TABLE "token" ALTER COLUMN "token" SET DATA TYPE VARCHAR(255);

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "nama" SET DATA TYPE VARCHAR(35),
ALTER COLUMN "email" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "password" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "role" SET DATA TYPE VARCHAR(8),
ALTER COLUMN "alamat" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "gambar" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "no_rekening" SET DATA TYPE VARCHAR(25),
ALTER COLUMN "no_telp" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "harga" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "bank" SET DATA TYPE VARCHAR(15),
ALTER COLUMN "cv_pdf" SET DATA TYPE VARCHAR(100);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
