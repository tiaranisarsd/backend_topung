-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "alamat" TEXT,
    "gambar" TEXT,
    "jadwalId" INTEGER,
    "no_rekening" TEXT,
    "no_telp" TEXT,
    "harga" TEXT,
    "bank" TEXT,
    "cv_pdf" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "edukasi" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "konten" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "edukasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "token" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal_kegiatan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tanggal_waktu" TEXT NOT NULL,
    "jenis_kegiatan" TEXT NOT NULL,
    "lokasi" TEXT NOT NULL,
    "deskripsi" TEXT NOT NULL,

    CONSTRAINT "jadwal_kegiatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal_terapis" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "hari" TEXT NOT NULL,
    "jam" TEXT NOT NULL,

    CONSTRAINT "jadwal_terapis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dokumentasi" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "gambar" TEXT NOT NULL,
    "judul" TEXT NOT NULL,

    CONSTRAINT "dokumentasi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "testimoni" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "media" TEXT NOT NULL,

    CONSTRAINT "testimoni_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pertanyaan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "judul_pertanyaan" TEXT NOT NULL,
    "isi_pertanyaan" TEXT NOT NULL,

    CONSTRAINT "pertanyaan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tinjauan" (
    "id" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "layanan" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "tinjauan" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tinjauan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservasi" (
    "id" SERIAL NOT NULL,
    "layanan" TEXT NOT NULL,
    "tanggal_waktu" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "usia" INTEGER NOT NULL,
    "no_telp" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "keluhan" TEXT NOT NULL,
    "pembayaran" TEXT NOT NULL,
    "bukti_pembayaran" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER,
    "jadwalId" INTEGER,

    CONSTRAINT "reservasi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "token_token_key" ON "token"("token");

-- AddForeignKey
ALTER TABLE "edukasi" ADD CONSTRAINT "edukasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "token" ADD CONSTRAINT "token_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_kegiatan" ADD CONSTRAINT "jadwal_kegiatan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_terapis" ADD CONSTRAINT "jadwal_terapis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dokumentasi" ADD CONSTRAINT "dokumentasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "testimoni" ADD CONSTRAINT "testimoni_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pertanyaan" ADD CONSTRAINT "pertanyaan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "jadwal_terapis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservasi" ADD CONSTRAINT "reservasi_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
